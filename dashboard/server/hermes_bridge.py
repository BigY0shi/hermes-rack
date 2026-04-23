#!/usr/bin/env python3
"""
HERMES BRIDGE — HTTP frontend for the real Hermes agent.

Endpoints:
  GET  /health                 → liveness
  GET  /status                 → uptime, model, session count
  GET  /sessions               → active sessions
  POST /chat                   → {message, session_id?, attachments?[]} → SSE stream
  POST /upload                 → multipart file → {file_id, path, name, size}
  POST /sessions/{sid}/clear   → drop session
  GET  /tools                  → list registered tools
  GET  /skills                 → list available skills
  POST /command                → {command, session_id?} → run slash command
  GET  /                       → serves terminal-v0.html if present

Run:
  bash ~/projects/hermes-rack/dashboard/server/run.sh
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import time
import threading
import uuid
import shutil
import re
from pathlib import Path
from typing import Any, Optional, List

# ── Path surgery so we can import hermes-agent directly ─────────────────────
HERMES_AGENT_DIR = Path(os.environ.get(
    "HERMES_AGENT_DIR",
    Path.home() / ".hermes" / "hermes-agent",
)).resolve()

if not HERMES_AGENT_DIR.exists():
    print(f"[hermes-bridge] ERROR: HERMES_AGENT_DIR not found: {HERMES_AGENT_DIR}", file=sys.stderr)
    sys.exit(2)

sys.path.insert(0, str(HERMES_AGENT_DIR))

try:
    from hermes_cli.env_loader import load_hermes_dotenv
    from hermes_constants import get_hermes_home
    load_hermes_dotenv(
        hermes_home=get_hermes_home(),
        project_env=HERMES_AGENT_DIR / ".env",
    )
except Exception as e:
    print(f"[hermes-bridge] WARN: env loader failed: {e}", file=sys.stderr)

# ── Third-party ─────────────────────────────────────────────────────────────
try:
    from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
    from pydantic import BaseModel
    import uvicorn
except ImportError:
    print("[hermes-bridge] FastAPI/uvicorn not installed. Install with:", file=sys.stderr)
    print("  pip install fastapi uvicorn[standard] python-multipart", file=sys.stderr)
    sys.exit(2)

# ── Hermes agent ────────────────────────────────────────────────────────────
from run_agent import AIAgent  # type: ignore

# Shared SQLite session store (WAL mode → thread-safe for multiple sessions).
# Without this, AIAgent defaults session_db=None and the session_search tool
# returns "Session database not available." on every call — plus history
# flushing, title lineage, and token-count persistence silently no-op.
try:
    from hermes_state import SessionDB  # type: ignore
    SESSION_DB = SessionDB()
    print(f"[hermes-bridge] SessionDB initialized", file=sys.stderr)
except Exception as _sdb_err:  # pragma: no cover
    SESSION_DB = None
    print(f"[hermes-bridge] WARN: SessionDB init failed — session_search will be disabled: {_sdb_err}", file=sys.stderr)

# ────────────────────────────────────────────────────────────────────────────

DEFAULT_MODEL    = os.environ.get("HERMES_BRIDGE_MODEL",    "claude-opus-4-7")
DEFAULT_PROVIDER = os.environ.get("HERMES_BRIDGE_PROVIDER", "anthropic")
LISTEN_HOST      = os.environ.get("HERMES_BRIDGE_HOST",     "0.0.0.0")
LISTEN_PORT      = int(os.environ.get("HERMES_BRIDGE_PORT", "7777"))
MAX_ITER         = int(os.environ.get("HERMES_BRIDGE_MAX_ITER", "60"))
# base_url / api_mode resolved dynamically per provider below.

HERMES_HOME = Path.home() / ".hermes"
UPLOAD_DIR  = HERMES_HOME / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

STARTED_AT = time.time()

STATIC_DIR = Path(__file__).resolve().parent.parent  # .../dashboard
INDEX_HTML = STATIC_DIR / "terminal-v0.html"


def _resolve_runtime(provider: str) -> dict:
    """Resolve base_url / api_key / api_mode for a given provider, using
    Hermes's own credential pool (OAuth, env vars, etc.)."""
    try:
        from hermes_cli.runtime_provider import resolve_runtime_provider
        rt = resolve_runtime_provider(requested=provider)
        return {
            "provider":  rt.get("provider", provider),
            "base_url":  rt.get("base_url", ""),
            "api_key":   rt.get("api_key", "") or rt.get("access_token", ""),
            "api_mode":  rt.get("api_mode", "chat_completions"),
        }
    except Exception as e:
        print(f"[hermes-bridge] WARN: runtime resolve failed for {provider}: {e}", file=sys.stderr)
        # Fallback: raw OpenRouter env key
        return {
            "provider": provider,
            "base_url": os.environ.get("HERMES_BRIDGE_BASE_URL", "https://openrouter.ai/api/v1"),
            "api_key":  os.environ.get("OPENROUTER_API_KEY", ""),
            "api_mode": "chat_completions",
        }


# ── Session registry ────────────────────────────────────────────────────────
class Session:
    def __init__(self, session_id: str, model: str, provider: str = DEFAULT_PROVIDER):
        self.session_id = session_id
        self.model = model
        self.provider = provider
        self.created_at = time.time()
        self.turns = 0
        self.lock = threading.Lock()
        # Persistent multi-turn history in OpenAI message format
        self.history: list[dict] = []
        # Flag the worker thread checks to abort early
        self.interrupt_flag = threading.Event()
        rt = _resolve_runtime(provider)
        self.agent = AIAgent(
            model=model,
            base_url=rt["base_url"],
            api_key=rt["api_key"],
            provider=rt["provider"],
            api_mode=rt["api_mode"],
            max_iterations=MAX_ITER,
            platform="cli",
            session_id=session_id,
            save_trajectories=False,
            quiet_mode=True,
            session_db=SESSION_DB,
        )

    def info(self) -> dict:
        return {
            "session_id": self.session_id,
            "model": self.agent.model,
            "provider": getattr(self.agent, "provider", None),
            "api_mode": getattr(self.agent, "api_mode", None),
            "created_at": self.created_at,
            "turns": self.turns,
            "history_len": len(self.history),
        }


SESSIONS: dict[str, Session] = {}
SESSIONS_LOCK = threading.Lock()


def get_or_create_session(session_id: Optional[str]) -> Session:
    if not session_id:
        session_id = "web-" + uuid.uuid4().hex[:10]
    with SESSIONS_LOCK:
        sess = SESSIONS.get(session_id)
        if sess is None:
            sess = Session(session_id, DEFAULT_MODEL)
            SESSIONS[session_id] = sess
    return sess


# ── FastAPI app ─────────────────────────────────────────────────────────────
app = FastAPI(title="hermes-bridge", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "uptime_s": int(time.time() - STARTED_AT)}


@app.get("/status")
def status():
    return {
        "ok": True,
        "uptime_s": int(time.time() - STARTED_AT),
        "default_model": DEFAULT_MODEL,
        "default_provider": DEFAULT_PROVIDER,
        "hermes_home": str(HERMES_HOME),
        "agent_dir": str(HERMES_AGENT_DIR),
        "session_count": len(SESSIONS),
        "listen": f"{LISTEN_HOST}:{LISTEN_PORT}",
    }


@app.get("/sessions")
def list_sessions():
    with SESSIONS_LOCK:
        return {"sessions": [s.info() for s in SESSIONS.values()]}


@app.post("/sessions/{sid}/clear")
def clear_session(sid: str):
    with SESSIONS_LOCK:
        if sid in SESSIONS:
            del SESSIONS[sid]
            # also wipe uploads for that session
            udir = UPLOAD_DIR / sid
            if udir.exists():
                shutil.rmtree(udir, ignore_errors=True)
            return {"ok": True, "cleared": sid}
    raise HTTPException(404, "session not found")


# ── Persistent sessions (SessionDB) ─────────────────────────────────────────
_SESSION_DB = None
_SESSION_DB_LOCK = threading.Lock()


def _db():
    global _SESSION_DB
    with _SESSION_DB_LOCK:
        if _SESSION_DB is None:
            from hermes_state import SessionDB  # type: ignore
            _SESSION_DB = SessionDB()
        return _SESSION_DB


@app.get("/db-sessions")
def db_list_sessions(limit: int = 100, offset: int = 0, source: Optional[str] = None):
    """List persisted sessions from sessions.db (the ones searchable via
    session_search). These are the real conversation tapes."""
    try:
        rows = _db().list_sessions_rich(
            source=source,
            limit=limit,
            offset=offset,
            include_children=False,
        )
    except Exception as e:
        return {"ok": False, "error": repr(e)}
    # Trim to fields the UI needs
    tapes = []
    for r in rows:
        tapes.append({
            "id": r.get("id"),
            "source": r.get("source"),
            "model": r.get("model"),
            "title": r.get("title") or "",
            "preview": (r.get("_preview_raw") or r.get("preview") or "").strip(),
            "started_at": r.get("started_at"),
            "last_active": r.get("last_active"),
            "message_count": r.get("message_count") or 0,
        })
    return {"ok": True, "count": len(tapes), "tapes": tapes}


@app.get("/db-sessions/{sid}/messages")
def db_session_messages(sid: str):
    """Fetch the full message history for a persisted session."""
    try:
        db = _db()
        resolved = db.resolve_session_id(sid) or sid
        messages = db.get_messages_as_conversation(resolved)
    except Exception as e:
        return {"ok": False, "error": repr(e)}
    # Render UI-friendly slim messages
    compact = []
    for m in messages:
        role = m.get("role", "?")
        content = m.get("content") or ""
        if isinstance(content, list):
            content = " ".join(
                str(p.get("text", p)) if isinstance(p, dict) else str(p)
                for p in content
            )
        entry = {"role": role, "content": str(content)}
        if m.get("tool_name"):
            entry["tool_name"] = m["tool_name"]
        compact.append(entry)
    return {"ok": True, "sid": resolved, "count": len(compact), "messages": compact}


@app.post("/db-sessions/{sid}/resume")
def db_resume_session(sid: str):
    """Load a persisted session into a bridge in-memory session so you can
    continue the conversation. Returns the session_id to use going forward."""
    try:
        db = _db()
        resolved = db.resolve_session_id(sid) or sid
        meta = db.get_session(resolved)
        if not meta:
            raise HTTPException(404, "session not found in DB")
        messages = db.get_messages_as_conversation(resolved)
    except HTTPException:
        raise
    except Exception as e:
        return {"ok": False, "error": repr(e)}

    model = meta.get("model") or DEFAULT_MODEL
    with SESSIONS_LOCK:
        sess = SESSIONS.get(resolved)
        if sess is None:
            sess = Session(resolved, model, DEFAULT_PROVIDER)
            SESSIONS[resolved] = sess
        # Replace history with what was persisted
        sess.history = messages
    return {
        "ok": True,
        "session_id": resolved,
        "model": sess.agent.model,
        "message_count": len(messages),
    }


class TitleReq(BaseModel):
    title: str


@app.post("/db-sessions/{sid}/title")
def db_set_title(sid: str, req: TitleReq):
    """Rename a persisted session. Titles must be unique across the DB."""
    title = (req.title or "").strip()
    if not title:
        return {"ok": False, "error": "empty title"}
    if len(title) > 200:
        return {"ok": False, "error": "title too long (max 200)"}
    try:
        db = _db()
        resolved = db.resolve_session_id(sid) or sid
        db.set_session_title(resolved, title)
    except ValueError as e:
        # duplicate title
        return {"ok": False, "error": str(e)}
    except Exception as e:
        return {"ok": False, "error": repr(e)}
    return {"ok": True, "sid": resolved, "title": title}


@app.get("/db-search")
def db_search(q: str = "", limit: int = 40):
    """FTS5 search across all session messages. Returns grouped results:
    one entry per session, with the top match snippet."""
    q = (q or "").strip()
    if not q:
        return {"ok": True, "query": "", "count": 0, "results": []}
    try:
        db = _db()
        rows = db.search_messages(query=q, limit=limit * 3)  # overshoot for grouping
    except Exception as e:
        return {"ok": False, "error": repr(e)}

    # Group by session_id, keep best/first hit per session
    grouped: dict[str, dict] = {}
    order: list[str] = []
    for r in rows:
        sid = r.get("session_id")
        if not sid:
            continue
        if sid not in grouped:
            grouped[sid] = {
                "id": sid,
                "source": r.get("source"),
                "model": r.get("model"),
                "title": r.get("title") or "",
                "snippet": r.get("snippet") or "",
                "role": r.get("role"),
                "timestamp": r.get("timestamp"),
                "hits": 1,
            }
            order.append(sid)
            if len(order) >= limit:
                break
        else:
            grouped[sid]["hits"] += 1

    results = [grouped[s] for s in order]
    return {"ok": True, "query": q, "count": len(results), "results": results}


# ── Tools / skills listing ──────────────────────────────────────────────────
@app.get("/tools")
def list_tools():
    try:
        from model_tools import get_all_tool_names
        tools = sorted(get_all_tool_names())
        return {"ok": True, "count": len(tools), "tools": tools}
    except Exception as e:
        return {"ok": False, "error": repr(e)}


@app.get("/skills")
def list_skills():
    out = []
    skills_dir = HERMES_HOME / "skills"
    if not skills_dir.exists():
        return {"ok": True, "count": 0, "skills": []}
    for skill_md in skills_dir.rglob("SKILL.md"):
        rel = skill_md.parent.relative_to(skills_dir)
        name = rel.name
        category = str(rel.parent) if rel.parent != Path(".") else ""
        desc = ""
        tags: list[str] = []
        try:
            txt = skill_md.read_text(encoding="utf-8", errors="ignore")
            # extract YAML frontmatter block
            fm = ""
            if txt.startswith("---"):
                end = txt.find("\n---", 3)
                if end > 0:
                    fm = txt[3:end]
            src = fm or txt
            # description (single line)
            m = re.search(r"^description:\s*(.+?)$", src, re.MULTILINE)
            if m:
                desc = m.group(1).strip().strip('"\'').strip()[:200]
            # tags — support inline `tags: [a, b]` and nested `hermes: { tags: [...] }`
            t_inline = re.search(r"^\s*tags:\s*\[(.+?)\]", src, re.MULTILINE)
            if t_inline:
                tags = [t.strip().strip('"\'') for t in t_inline.group(1).split(",") if t.strip()]
            else:
                # nested under metadata.hermes.tags (common in existing skills)
                t_nested = re.search(r"tags:\s*\[(.+?)\]", src)
                if t_nested:
                    tags = [t.strip().strip('"\'') for t in t_nested.group(1).split(",") if t.strip()]
        except Exception:
            pass
        out.append({"name": name, "category": category, "description": desc, "tags": tags})
    out.sort(key=lambda s: (s["category"], s["name"]))
    return {"ok": True, "count": len(out), "skills": out}


# ── File upload ─────────────────────────────────────────────────────────────
class UploadResult(BaseModel):
    file_id: str
    path: str
    name: str
    size: int
    kind: str


def _classify(name: str) -> str:
    ext = Path(name).suffix.lower()
    if ext in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"}: return "image"
    if ext in {".pdf"}:                                           return "pdf"
    if ext in {".txt", ".md", ".json", ".yaml", ".yml", ".toml",
               ".csv", ".log", ".py", ".js", ".ts", ".go", ".rs",
               ".sh", ".html", ".css", ".xml"}:                   return "text"
    return "binary"


@app.post("/upload")
async def upload(
    file: UploadFile = File(...),
    session_id: str = Form("_global"),
):
    # sanitize session id to a safe filesystem component
    sid = re.sub(r"[^A-Za-z0-9_-]", "_", session_id or "_global")
    sess_dir = UPLOAD_DIR / sid
    sess_dir.mkdir(parents=True, exist_ok=True)

    file_id = uuid.uuid4().hex[:12]
    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", file.filename or f"upload-{file_id}")
    target = sess_dir / f"{file_id}__{safe_name}"

    size = 0
    with target.open("wb") as fp:
        while True:
            chunk = await file.read(1024 * 64)
            if not chunk:
                break
            fp.write(chunk)
            size += len(chunk)

    return UploadResult(
        file_id=file_id,
        path=str(target),
        name=safe_name,
        size=size,
        kind=_classify(safe_name),
    ).dict()


# ── Transcription (Whisper via faster-whisper) ──────────────────────────────
# Lazy-loaded on first /transcribe call. Model stays warm in memory after that.
_whisper_model = None
_whisper_lock = threading.Lock()
_WHISPER_MODEL_NAME = os.environ.get("HERMES_WHISPER_MODEL", "distil-large-v3")
_WHISPER_DEVICE     = os.environ.get("HERMES_WHISPER_DEVICE", "cpu")
_WHISPER_COMPUTE    = os.environ.get("HERMES_WHISPER_COMPUTE", "int8")


def _get_whisper():
    """Lazy-load the faster-whisper model. Thread-safe singleton."""
    global _whisper_model
    if _whisper_model is not None:
        return _whisper_model
    with _whisper_lock:
        if _whisper_model is not None:
            return _whisper_model
        try:
            from faster_whisper import WhisperModel
        except ImportError as e:
            raise HTTPException(
                status_code=503,
                detail=f"faster-whisper not installed in bridge venv: {e}",
            )
        print(f"[hermes-bridge] loading whisper: {_WHISPER_MODEL_NAME} on {_WHISPER_DEVICE}/{_WHISPER_COMPUTE}", flush=True)
        t0 = time.time()
        _whisper_model = WhisperModel(
            _WHISPER_MODEL_NAME,
            device=_WHISPER_DEVICE,
            compute_type=_WHISPER_COMPUTE,
        )
        print(f"[hermes-bridge] whisper ready in {time.time()-t0:.1f}s", flush=True)
        return _whisper_model


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    session_id: str = Form("_global"),
    language: str = Form("en"),
):
    """
    Accept audio (webm/opus/ogg/mp3/wav/m4a — anything ffmpeg reads),
    return transcribed text.

    Body (multipart/form-data):
      file:       audio blob from MediaRecorder or file upload
      session_id: scoping (persisted under uploads/<sid>/transcripts/)
      language:   ISO code or 'auto' to detect (default: 'en')

    Returns: {text, language, duration_sec, transcribe_sec, segments}
    """
    # Persist the raw audio so we have a forensic record of every dump
    sid = re.sub(r"[^A-Za-z0-9_-]", "_", session_id or "_global")
    tdir = UPLOAD_DIR / sid / "transcripts"
    tdir.mkdir(parents=True, exist_ok=True)

    file_id = uuid.uuid4().hex[:12]
    # Normalize filename and preserve extension hint from browser
    orig_name = re.sub(r"[^A-Za-z0-9._-]", "_", file.filename or f"rec-{file_id}.webm")
    if "." not in orig_name:
        orig_name += ".webm"
    audio_path = tdir / f"{file_id}__{orig_name}"

    size = 0
    with audio_path.open("wb") as fp:
        while True:
            chunk = await file.read(1024 * 64)
            if not chunk:
                break
            fp.write(chunk)
            size += len(chunk)

    if size == 0:
        raise HTTPException(status_code=400, detail="Empty audio upload")

    # Serialize transcription — CPU inference thrashes if run in parallel
    def _run_transcription():
        model = _get_whisper()
        t0 = time.time()
        lang = None if (language or "").lower() in ("auto", "") else language
        segments, info = model.transcribe(
            str(audio_path),
            language=lang,
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
            beam_size=5,
        )
        # Materialize the generator — faster-whisper streams segments lazily
        seg_list = []
        for s in segments:
            seg_list.append({
                "start": round(s.start, 2),
                "end":   round(s.end, 2),
                "text":  s.text.strip(),
            })
        text = " ".join(s["text"] for s in seg_list).strip()
        return {
            "text": text,
            "language": info.language,
            "language_prob": round(info.language_probability, 3),
            "duration_sec": round(info.duration, 2),
            "transcribe_sec": round(time.time() - t0, 2),
            "segments": seg_list,
            "audio_path": str(audio_path),
            "file_id": file_id,
        }

    # Run in a worker thread so we don't block the event loop
    result = await asyncio.get_event_loop().run_in_executor(None, _run_transcription)

    # Also save the text next to the audio for easy grep-ability later
    try:
        (tdir / f"{file_id}__transcript.txt").write_text(result["text"], encoding="utf-8")
    except Exception:
        pass

    return result


# ── Slash commands ──────────────────────────────────────────────────────────
SLASH_COMMANDS = [
    {"cmd": "/help",       "args": "",              "desc": "Show this command list"},
    {"cmd": "/new",        "args": "",              "desc": "Start a fresh tape (client-side)"},
    {"cmd": "/clear",      "args": "",              "desc": "Wipe this session's server-side state"},
    {"cmd": "/model",      "args": "<model-id>",    "desc": "Switch session model"},
    {"cmd": "/sessions",   "args": "",              "desc": "List active sessions"},
    {"cmd": "/tools",      "args": "",              "desc": "List available tools"},
    {"cmd": "/skills",     "args": "[filter]",      "desc": "List available skills"},
    {"cmd": "/skill",      "args": "<name>",        "desc": "Load a skill's content for next message"},
    {"cmd": "/status",     "args": "",              "desc": "Bridge status"},
]


class CommandReq(BaseModel):
    command: str
    session_id: Optional[str] = None


@app.post("/command")
def run_command(req: CommandReq):
    raw = (req.command or "").strip()
    if not raw.startswith("/"):
        return {"ok": False, "error": "not a slash command"}
    parts = raw.split(maxsplit=1)
    cmd = parts[0].lower()
    arg = parts[1].strip() if len(parts) > 1 else ""

    if cmd == "/help":
        return {"ok": True, "kind": "help", "commands": SLASH_COMMANDS}

    if cmd == "/status":
        return {"ok": True, "kind": "status", **status()}

    if cmd == "/sessions":
        return {"ok": True, "kind": "sessions", **list_sessions()}

    if cmd == "/tools":
        return {"ok": True, "kind": "tools", **list_tools()}

    if cmd == "/skills":
        d = list_skills()
        if arg:
            f = arg.lower()
            d["skills"] = [s for s in d["skills"] if f in s["name"].lower() or f in s["category"].lower() or f in s["description"].lower()]
            d["count"] = len(d["skills"])
        return {"ok": True, "kind": "skills", **d}

    if cmd == "/skill":
        if not arg:
            return {"ok": False, "error": "usage: /skill <name>"}
        # find matching skill by name
        skills_dir = HERMES_HOME / "skills"
        matches = list(skills_dir.rglob(f"{arg}/SKILL.md"))
        if not matches:
            # fuzzy fallback
            matches = [p for p in skills_dir.rglob("SKILL.md") if arg.lower() in p.parent.name.lower()]
        if not matches:
            return {"ok": False, "error": f"no skill matching '{arg}'"}
        skill_path = matches[0]
        try:
            content = skill_path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            return {"ok": False, "error": f"failed to read: {e}"}
        return {
            "ok": True, "kind": "skill",
            "name": skill_path.parent.name,
            "path": str(skill_path),
            "content": content,
        }

    if cmd == "/clear":
        if not req.session_id:
            return {"ok": False, "error": "no session_id"}
        return clear_session(req.session_id)

    if cmd == "/model":
        if not arg:
            return {"ok": False, "error": "usage: /model <model-id>"}
        if not req.session_id:
            return {"ok": False, "error": "no session_id"}
        with SESSIONS_LOCK:
            sess = SESSIONS.get(req.session_id)
        if not sess:
            return {"ok": False, "error": "session not found"}
        try:
            rt = _resolve_runtime(sess.provider)
            sess.agent.switch_model(new_model=arg, new_provider=rt["provider"],
                                    api_key=rt["api_key"],
                                    base_url=rt["base_url"],
                                    api_mode=rt["api_mode"])
            sess.model = arg
            return {"ok": True, "kind": "model", "model": arg}
        except Exception as e:
            return {"ok": False, "error": f"switch failed: {e}"}

    if cmd == "/new":
        # purely a client-side signal; return ok and let the UI wipe state
        return {"ok": True, "kind": "new"}

    return {"ok": False, "error": f"unknown command: {cmd}"}


# ── Chat (with attachments) ─────────────────────────────────────────────────
class Attachment(BaseModel):
    file_id: str
    path: str
    name: str
    kind: str = "binary"


class ChatReq(BaseModel):
    message: str
    session_id: Optional[str] = None
    model: Optional[str] = None
    attachments: Optional[List[Attachment]] = None


SSE_HEADERS = {
    "Cache-Control": "no-cache",
    "Connection":    "keep-alive",
    "X-Accel-Buffering": "no",
}


def _sse(event: str, data: Any) -> bytes:
    payload = data if isinstance(data, str) else json.dumps(data, ensure_ascii=False)
    return f"event: {event}\ndata: {payload}\n\n".encode("utf-8")


def _compose_message_with_attachments(message: str, attachments: Optional[List[Attachment]]) -> str:
    if not attachments:
        return message
    lines = [message.rstrip(), "", "── Attachments ──"]
    for a in attachments:
        lines.append(f"- [{a.kind}] {a.name}  →  {a.path}")
    lines.append("")
    lines.append(
        "Use your file_tools / vision_analyze / read_file tools on the paths above "
        "as needed. Paths are readable by your tools."
    )
    return "\n".join(lines)


@app.post("/chat")
async def chat(req: ChatReq, request: Request):
    if not req.message or not req.message.strip():
        raise HTTPException(400, "empty message")

    sess = get_or_create_session(req.session_id)

    if req.model and req.model != sess.agent.model:
        try:
            rt = _resolve_runtime(sess.provider)
            sess.agent.switch_model(
                new_model=req.model,
                new_provider=rt["provider"],
                api_key=rt["api_key"],
                base_url=rt["base_url"],
                api_mode=rt["api_mode"],
            )
            sess.model = req.model
        except Exception as e:
            print(f"[hermes-bridge] model switch failed: {e}", file=sys.stderr)

    composed = _compose_message_with_attachments(req.message, req.attachments)

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[tuple[str, Any]] = asyncio.Queue()

    def stream_cb(delta: str):
        try:
            asyncio.run_coroutine_threadsafe(queue.put(("delta", delta)), loop)
        except Exception:
            pass

    def thinking_cb(*a, **kw):
        # Hermes's thinking_callback signature varies; just signal "thinking" on any call.
        try:
            asyncio.run_coroutine_threadsafe(queue.put(("thinking", {"active": True})), loop)
        except Exception:
            pass

    def reasoning_cb(text: str):
        try:
            asyncio.run_coroutine_threadsafe(queue.put(("reasoning", {"text": text})), loop)
        except Exception:
            pass

    def tool_progress_cb(event: str, name: str = "", preview: str = "", args: Any = None):
        # event is one of "tool.started", "tool.progress", etc.
        payload = {"event": event, "name": name, "preview": str(preview)[:400] if preview else ""}
        try:
            asyncio.run_coroutine_threadsafe(queue.put(("tool_progress", payload)), loop)
        except Exception:
            pass

    def tool_start_cb(tc_id: str, name: str, args: Any = None):
        preview = ""
        try:
            if isinstance(args, dict):
                # Show the most informative arg (command/path/query/url/etc.)
                for k in ("command", "cmd", "path", "file_path", "query", "pattern", "url", "message", "goal"):
                    if k in args and args[k]:
                        preview = f"{k}={str(args[k])[:220]}"
                        break
                if not preview and args:
                    first_k = next(iter(args))
                    preview = f"{first_k}={str(args[first_k])[:220]}"
        except Exception:
            pass
        try:
            asyncio.run_coroutine_threadsafe(
                queue.put(("tool_start", {"id": tc_id, "name": name, "preview": preview})), loop
            )
        except Exception:
            pass

    def tool_complete_cb(*a, **kw):
        # Signatures vary; accept any. Extract a name if present.
        name = ""
        if a:
            # common pattern: (tc_id, name, result)
            if len(a) >= 2 and isinstance(a[1], str):
                name = a[1]
            elif isinstance(a[0], str):
                name = a[0]
        try:
            asyncio.run_coroutine_threadsafe(queue.put(("tool_done", {"name": name})), loop)
        except Exception:
            pass

    # Attach callbacks to this session's agent for this request.
    try:
        sess.agent.tool_progress_callback = tool_progress_cb
        sess.agent.tool_start_callback    = tool_start_cb
        sess.agent.tool_complete_callback = tool_complete_cb
        sess.agent.thinking_callback      = thinking_cb
        sess.agent.reasoning_callback     = reasoning_cb
    except Exception:
        pass

    def worker():
        with sess.lock:
            # Clear any stale interrupt from a prior turn
            sess.interrupt_flag.clear()
            try:
                # Pass full per-session history so multi-turn context is preserved.
                result = sess.agent.run_conversation(
                    user_message=composed,
                    conversation_history=sess.history,
                    stream_callback=stream_cb,
                )
                final_text = ""
                new_messages = sess.history
                if isinstance(result, dict):
                    final_text = result.get("final_response") or ""
                    # run_conversation returns the full new message list — adopt it.
                    msgs = result.get("messages")
                    if isinstance(msgs, list):
                        new_messages = msgs
                elif isinstance(result, str):
                    final_text = result

                # Persist new history back onto the session.
                sess.history = new_messages
                sess.turns += 1

                asyncio.run_coroutine_threadsafe(
                    queue.put(("done", {"final": final_text, "interrupted": sess.interrupt_flag.is_set()})), loop
                )
            except KeyboardInterrupt:
                asyncio.run_coroutine_threadsafe(
                    queue.put(("interrupted", {"message": "interrupted by user"})), loop
                )
            except Exception as e:
                asyncio.run_coroutine_threadsafe(
                    queue.put(("error", {"message": repr(e)})), loop
                )

    async def event_stream():
        t = threading.Thread(target=worker, daemon=True)
        t.start()

        yield _sse("session", {"session_id": sess.session_id, "model": sess.agent.model})

        while True:
            if await request.is_disconnected():
                break
            try:
                kind, payload = await asyncio.wait_for(queue.get(), timeout=3.0)
            except asyncio.TimeoutError:
                # Frequent keepalive so WSL/browser never idle-kills the pipe.
                yield b": keepalive\n\n"
                continue

            if kind == "delta":
                yield _sse("delta", {"text": payload})
            elif kind == "thinking":
                yield _sse("thinking", payload)
            elif kind == "reasoning":
                yield _sse("reasoning", payload)
            elif kind == "tool_start":
                yield _sse("tool_start", payload)
            elif kind == "tool_progress":
                yield _sse("tool_progress", payload)
            elif kind == "tool_done":
                yield _sse("tool_done", payload)
            elif kind == "done":
                yield _sse("done", payload)
                break
            elif kind == "interrupted":
                yield _sse("interrupted", payload)
                break
            elif kind == "error":
                yield _sse("error", payload)
                break

    return StreamingResponse(event_stream(), media_type="text/event-stream", headers=SSE_HEADERS)


# ── Interrupt / activity ────────────────────────────────────────────────────
@app.post("/sessions/{sid}/interrupt")
def interrupt(sid: str):
    with SESSIONS_LOCK:
        sess = SESSIONS.get(sid)
    if not sess:
        raise HTTPException(404, "session not found")
    sess.interrupt_flag.set()
    # Also use the agent's native interrupt mechanism (cancels in-flight tools).
    try:
        sess.agent.interrupt(message="user pressed stop")
    except Exception as e:
        print(f"[hermes-bridge] agent.interrupt() failed: {e}", file=sys.stderr)
    return {"ok": True, "sid": sid, "interrupted": True}


@app.get("/sessions/{sid}/history")
def get_history(sid: str):
    with SESSIONS_LOCK:
        sess = SESSIONS.get(sid)
    if not sess:
        raise HTTPException(404, "session not found")
    # Sanitize tool results for display — can be huge. Summarize.
    compact = []
    for m in sess.history:
        role = m.get("role", "?")
        if role == "tool":
            content = m.get("content", "")
            preview = content[:300] + ("…" if len(content) > 300 else "") if isinstance(content, str) else str(content)[:300]
            compact.append({"role": role, "name": m.get("name"), "preview": preview})
        else:
            c = m.get("content", "")
            if isinstance(c, list):
                c = " ".join(str(p.get("text", p)) if isinstance(p, dict) else str(p) for p in c)
            compact.append({"role": role, "content": str(c)[:2000]})
    return {"ok": True, "sid": sid, "turns": sess.turns, "history": compact}


# ── Static ─────────────────────────────────────────────────────────────────
@app.get("/")
def index():
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
    return JSONResponse({
        "ok": True,
        "hint": "place terminal-v0.html at " + str(INDEX_HTML),
        "endpoints": ["/health", "/status", "/sessions", "/chat (POST)", "/upload (POST)", "/command (POST)"],
    })


# ── Entry ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("━" * 60)
    print(" HERMES BRIDGE v0.2")
    print(f"  listen:     http://{LISTEN_HOST}:{LISTEN_PORT}")
    print(f"  model:      {DEFAULT_MODEL}")
    rt_preview = _resolve_runtime(DEFAULT_PROVIDER)
    print(f"  provider:   {DEFAULT_PROVIDER}  ({rt_preview.get('base_url') or '(resolved at session-create)'})")
    print(f"  api_mode:   {rt_preview.get('api_mode')}")
    print(f"  agent dir:  {HERMES_AGENT_DIR}")
    print(f"  uploads:    {UPLOAD_DIR}")
    print("━" * 60)
    uvicorn.run(app, host=LISTEN_HOST, port=LISTEN_PORT, log_level="info", access_log=False)
