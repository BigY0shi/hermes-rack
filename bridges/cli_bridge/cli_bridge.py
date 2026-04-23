#!/usr/bin/env python3
"""Hermes/VoltAgent CLI Bridge Server

Wraps claude-code and codex CLI tools behind a local FastAPI HTTP interface.
Supports one-shot subprocess execution and persistent tmux sessions.
"""

import os
import sys
import re
import json
import time
import subprocess
import shlex
import asyncio
import logging
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# ------------------------------------------------------------------
# Logging
# ------------------------------------------------------------------
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("cli_bridge")

# ------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------
HOST = os.environ.get("BRIDGE_HOST", "127.0.0.1")
PORT = int(os.environ.get("BRIDGE_PORT", "4040"))

CLAUDE_CODE_BIN = os.environ.get("CLAUDE_CODE_BIN", "")
CODEX_BIN = os.environ.get("CODEX_BIN", "")

TMUX_AVAILABLE = bool(subprocess.run(["which", "tmux"], capture_output=True).returncode == 0)
if not TMUX_AVAILABLE:
    logger.warning("tmux not found; persistent sessions disabled (falling back to one-shot mode)")

# ------------------------------------------------------------------
# Tool resolution
# ------------------------------------------------------------------
def _which(cmd: str) -> str:
    result = subprocess.run(["which", cmd], capture_output=True, text=True)
    if result.returncode == 0:
        return result.stdout.strip()
    return ""


def resolve_tool(tool: str) -> str:
    mapping = {
        "claude-code": CLAUDE_CODE_BIN or _which("claude-code") or _which("claude"),
        "codex": CODEX_BIN or _which("codex"),
    }
    if tool in mapping and mapping[tool]:
        return mapping[tool]
    raise HTTPException(status_code=400, detail=f"Tool binary for '{tool}' not found. Set CLAUDE_CODE_BIN or CODEX_BIN.")


# ------------------------------------------------------------------
# Persistent tmux session manager
# ------------------------------------------------------------------
class SessionManager:
    def __init__(self):
        # sessions: {session_id: {"started_at": iso, "tool": str, "cwd": str}}
        self._sessions: dict[str, dict] = {}

    def _ensure_session_exists(self, sid: str):
        if not self._sessions.get(sid):
            return False
        # Check tmux session actually alive
        result = subprocess.run(
            ["tmux", "has-session", "-t", sid],
            capture_output=True,
        )
        return result.returncode == 0

    def list(self):
        """Return metadata for active sessions."""
        alive = []
        for sid, meta in list(self._sessions.items()):
            if self._ensure_session_exists(sid):
                meta["id"] = sid
                alive.append(meta)
            else:
                self._sessions.pop(sid, None)
        return alive

    def create(self, sid: str, tool: str, cwd: str):
        if not TMUX_AVAILABLE:
            raise HTTPException(status_code=503, detail="tmux not available; persistent sessions unsupported")
        if self._ensure_session_exists(sid):
            return
        cmd = ["tmux", "new-session", "-d", "-s", sid, "-c", cwd or "."]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"tmux session creation failed: {result.stderr}")
        self._sessions[sid] = {
            "started_at": datetime.utcnow().isoformat() + "Z",
            "tool": tool,
            "cwd": cwd,
        }
        logger.info("Created tmux session %s for tool=%s cwd=%s", sid, tool, cwd)

    def destroy(self, sid: str) -> bool:
        exists = self._ensure_session_exists(sid)
        if exists:
            subprocess.run(["tmux", "kill-session", "-t", sid], capture_output=True)
        self._sessions.pop(sid, None)
        return exists

    def send(self, sid: str, text: str):
        if not self._ensure_session_exists(sid):
            raise HTTPException(status_code=404, detail=f"Session '{sid}' not found or tmux session missing")
        escaped = text.replace('"', '\\"').replace("$", "\\$")
        result = subprocess.run(
            ["tmux", "send-keys", "-t", sid, escaped, "C-m"],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"tmux send-keys failed: {result.stderr}")

    def capture(self, sid: str) -> str:
        result = subprocess.run(
            ["tmux", "capture-pane", "-t", sid, "-p"],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"tmux capture-pane failed: {result.stderr}")
        return result.stdout


session_mgr = SessionManager()

# ------------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------------
class RunRequest(BaseModel):
    tool: str = Field(..., pattern="^(claude-code|codex)$")
    task: str = Field(..., min_length=1)
    cwd: Optional[str] = None
    timeout: int = Field(default=300, ge=1, le=3600)
    session_id: Optional[str] = None


class RunResponse(BaseModel):
    status: str
    stdout: str
    stderr: str
    exit_code: int
    session_id: str
    duration_ms: int
    tool: str


class HealthResponse(BaseModel):
    status: str
    tmux_available: bool
    claude_code_bin: Optional[str] = None
    codex_bin: Optional[str] = None


# ------------------------------------------------------------------
# One-shot runner
# ------------------------------------------------------------------
async def run_oneshot(bin_path: str, task: str, cwd: Optional[str], timeout: int) -> RunResponse:
    start = time.time()
    cmd = [bin_path, task]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=cwd or None,
    )
    try:
        stdout_bytes, stderr_bytes = await asyncio.wait_for(asyncio.shield(proc.communicate()), timeout=timeout)
        exit_code = proc.returncode if proc.returncode is not None else 0
        status = "ok" if exit_code == 0 else "error"
    except asyncio.TimeoutError:
        proc.kill()
        stdout_bytes, stderr_bytes = await proc.communicate()
        exit_code = -9
        status = "timeout"
    duration_ms = int((time.time() - start) * 1000)
    return RunResponse(
        status=status,
        stdout=stdout_bytes.decode(errors="replace"),
        stderr=stderr_bytes.decode(errors="replace"),
        exit_code=exit_code,
        session_id="",
        duration_ms=duration_ms,
        tool=bin_path,
    )


# ------------------------------------------------------------------
# Persistent session runner (tmux)
# ------------------------------------------------------------------
def _tmux_oneshot_send_wait_capture(sid: str, bin_path: str, task: str, timeout: int) -> tuple[str, str, int]:
    """Synchronous helper; run in threadpool for tmux interaction."""
    marker = "___CLI_BRIDGE_MARKER___"
    # Build a safe shell-typed command via shlex.quote
    cmd_str = f"{shlex.quote(bin_path)} {shlex.quote(task)}; echo {shlex.quote(marker)}"

    # Send Ctrl-C to cancel any running process, then literal send the command and Enter
    subprocess.run(["tmux", "send-keys", "-t", sid, "C-c"], capture_output=True)
    time.sleep(0.2)
    subprocess.run(["tmux", "send-keys", "-l", "-t", sid, cmd_str], capture_output=True)
    subprocess.run(["tmux", "send-keys", "-t", sid, "C-m"], capture_output=True)

    deadline = time.time() + timeout
    captured = ""
    while time.time() < deadline:
        time.sleep(0.5)
        cap = subprocess.run(["tmux", "capture-pane", "-t", sid, "-p"], capture_output=True, text=True)
        if cap.returncode == 0:
            captured = cap.stdout
            if marker in captured:
                lines = captured.splitlines()
                idx = next((i for i in range(len(lines) - 1, -1, -1) if marker in lines[i]), None)
                if idx is not None:
                    output_lines = lines[:idx]
                    return "\n".join(output_lines), cap.stderr or "", 0
    return captured, "timeout waiting for marker", -1


async def run_persistent(sid: str, bin_path: str, task: str, cwd: Optional[str], timeout: int) -> RunResponse:
    start = time.time()
    session_mgr.create(sid, bin_path, cwd or ".")
    loop = asyncio.get_running_loop()
    stdout, stderr, exit_code = await loop.run_in_executor(
        None, _tmux_oneshot_send_wait_capture, sid, bin_path, task, timeout
    )
    duration_ms = int((time.time() - start) * 1000)
    status = "timeout" if exit_code == -1 else ("ok" if exit_code == 0 else "error")
    return RunResponse(
        status=status,
        stdout=stdout,
        stderr=stderr,
        exit_code=exit_code,
        session_id=sid,
        duration_ms=duration_ms,
        tool=bin_path,
    )


# ------------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CLI Bridge starting on %s:%d", HOST, PORT)
    yield
    # Cleanup: kill all managed tmux sessions on shutdown
    for sid in list(session_mgr._sessions.keys()):
        session_mgr.destroy(sid)
    logger.info("CLI Bridge stopped")


app = FastAPI(title="Hermes CLI Bridge", version="0.1.0", lifespan=lifespan)


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        tmux_available=TMUX_AVAILABLE,
        claude_code_bin=(CLAUDE_CODE_BIN or _which("claude-code") or _which("claude") or None),
        codex_bin=(CODEX_BIN or _which("codex") or None),
    )


@app.get("/sessions")
async def list_sessions():
    return {"sessions": session_mgr.list()}


@app.post("/sessions/{sid}/destroy")
async def destroy_session(sid: str):
    killed = session_mgr.destroy(sid)
    return {"destroyed": killed, "session_id": sid}


@app.post("/run", response_model=RunResponse)
async def run_tool(req: RunRequest):
    bin_path = resolve_tool(req.tool)
    # Normalize session id
    sid = req.session_id or ""
    if sid:
        sid = re.sub(r"[^a-zA-Z0-9_-]", "-", sid)
        if not TMUX_AVAILABLE:
            logger.warning("Session requested but tmux unavailable; falling back to one-shot")
            # fallback to one-shot (stateless)
            result = await run_oneshot(bin_path, req.task, req.cwd, req.timeout)
            result.session_id = sid  # echo back the requested id
            return result
        return await run_persistent(sid, bin_path, req.task, req.cwd, req.timeout)
    else:
        return await run_oneshot(bin_path, req.task, req.cwd, req.timeout)


# ------------------------------------------------------------------
# CLI entrypoint
# ------------------------------------------------------------------
def check_tools():
    ok = True
    for label, env_var, default_cmds in [
        ("claude-code", "CLAUDE_CODE_BIN", ["claude-code", "claude"]),
        ("codex", "CODEX_BIN", ["codex"]),
    ]:
        path = os.environ.get(env_var, "")
        if not path:
            for cmd in default_cmds:
                path = _which(cmd)
                if path:
                    break
        if path:
            print(f"  [OK] {label}: {path}")
        else:
            print(f"  [MISSING] {label}: binary not found (set {env_var} env var)")
            ok = False
    if not TMUX_AVAILABLE:
        print("  [WARN] tmux not installed: persistent sessions unavailable")
    else:
        print(f"  [OK] tmux {subprocess.check_output(['tmux', '-V']).decode().strip()}")
    return ok


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Hermes CLI Bridge Server")
    parser.add_argument("--check", action="store_true", help="Validate tool binaries and exit")
    parser.add_argument("--host", default=HOST, help="Bind host")
    parser.add_argument("--port", type=int, default=PORT, help="Bind port")
    args = parser.parse_args()

    if args.check:
        print("CLI Bridge check:")
        ok = check_tools()
        sys.exit(0 if ok else 1)

    import uvicorn
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
