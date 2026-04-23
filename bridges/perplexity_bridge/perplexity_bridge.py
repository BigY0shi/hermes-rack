#!/usr/bin/env python3
"""Hermes/VoltAgent Perplexity Bridge Server

Launches a Playwright-controlled Chromium instance using the user's Chrome
profile to drive perplexity.ai queries behind a local FastAPI HTTP interface.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import re
import shutil
import sys
import tempfile
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Path as FastPath
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from playwright.async_api import async_playwright, BrowserContext, Page, TimeoutError as PWTimeout

# ------------------------------------------------------------------
# Logging
# ------------------------------------------------------------------
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("perplexity_bridge")

# ------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------
HOST = os.environ.get("BRIDGE_HOST", "127.0.0.1")
PORT = int(os.environ.get("BRIDGE_PORT", "4050"))
OVERRIDE_CHROME_PROFILE = os.environ.get("CHROME_USER_DATA_DIR", "")

# ------------------------------------------------------------------
# Chrome profile auto-detection
# ------------------------------------------------------------------
WSL_CHROME_BASE = Path("/mnt/c/Users")
SKIP_COPY_DIRS = {
    "Cache", "Code Cache", "GPUCache", "Service Worker",
    "blob_storage", "file_systems", "databases", "indexdbs",
    "shared_proto_db", "VideoDecodeStats", "optimization_guide",
    "AutofillStrikeDatabase", "Session Storage", "Sessions",
    "Thumbnails", "Top Sites", "Visited Links", "Web Applications",
    "MEIPreload", "Safe Browsing", "component_crx_cache",
    "on_device_head", "ZxcvbnData", "pnacl", "recovery",
    "MediaFoundationCdm", "hyphen-data", "preloaded_error_log",
}


def _find_chrome_user_data_dir() -> Optional[str]:
    if OVERRIDE_CHROME_PROFILE:
        path = Path(OVERRIDE_CHROME_PROFILE)
        if path.is_dir():
            return str(path)
        logger.warning("CHROME_USER_DATA_DIR set but not a directory: %s", OVERRIDE_CHROME_PROFILE)

    if not WSL_CHROME_BASE.exists():
        return None

    for user_dir in WSL_CHROME_BASE.iterdir():
        if not user_dir.is_dir():
            continue
        candidate = user_dir / "AppData" / "Local" / "Google" / "Chrome" / "User Data"
        if candidate.is_dir() and (candidate / "Local State").exists():
            return str(candidate)
    return None


def _chrome_is_running() -> bool:
    try:
        import subprocess
        result = subprocess.run(["pgrep", "-i", "chrome"], capture_output=True)
        return result.returncode == 0 and bool(result.stdout.strip())
    except Exception:
        return False


def _prepare_shadow_profile(src: str) -> str:
    """Copy auth-critical files from the live Chrome profile to a temp
    directory so Playwright can use them without locking the real profile."""
    tmp = tempfile.mkdtemp(prefix="perplexity_bridge_profile_")
    src_path = Path(src)
    logger.info("Preparing shadow profile from %s -> %s", src, tmp)

    # Copy root-level metadata files
    for fname in ("Local State", "First Run", "Last Version", "Last Browser"):
        fpath = src_path / fname
        if fpath.is_file():
            shutil.copy2(fpath, tmp)

    # Copy Default selectively
    default_src = src_path / "Default"
    default_dst = Path(tmp) / "Default"
    if default_src.is_dir():
        default_dst.mkdir(parents=True, exist_ok=True)
        for item in default_src.iterdir():
            rel = item.name
            if rel in SKIP_COPY_DIRS:
                continue
            dst_item = default_dst / rel
            try:
                if item.is_dir():
                    shutil.copytree(item, dst_item, dirs_exist_ok=True, ignore=shutil.ignore_patterns(*SKIP_COPY_DIRS))
                elif item.is_file():
                    shutil.copy2(item, dst_item)
            except Exception as exc:
                logger.debug("Shadow copy skip %s: %s", item, exc)
    return tmp


# ------------------------------------------------------------------
# Browser manager
# ------------------------------------------------------------------
class BrowserManager:
    def __init__(self):
        self._playwright: Optional[Any] = None
        self._context: Optional[BrowserContext] = None
        self._pages: dict[str, Page] = {}
        self._shadow_dir: Optional[str] = None
        self._headless: bool = True
        self._lock = asyncio.Lock()

    # ---- profile discovery ------------------------------------------------
    async def profile_path(self) -> Optional[str]:
        return _find_chrome_user_data_dir()

    # ---- lifecycle --------------------------------------------------------
    async def ensure_browser(self) -> BrowserContext:
        async with self._lock:
            if self._context:
                return self._context

            profile = await self.profile_path()
            if not profile:
                raise RuntimeError("Chrome user data directory not found. Set CHROME_USER_DATA_DIR.")

            # Use shadow copy to avoid locking user's live Chrome
            self._shadow_dir = _prepare_shadow_profile(profile)
            logger.info("Shadow profile prepared at %s", self._shadow_dir)

            self._playwright = await async_playwright().start()

            # Try headless first; fall back to headed if launch fails or later if bot-detected
            ctx = await self._try_launch(headless=True)
            if ctx is None:
                logger.warning("Headless launch failed / blocked; trying headed mode")
                ctx = await self._try_launch(headless=False)
                self._headless = False
            if ctx is None:
                raise RuntimeError(
                    "Unable to launch persistent Chromium context. "
                    "Ensure Playwright browsers are installed (`playwright install chromium`)."
                )
            self._context = ctx
            logger.info("Browser context ready (headless=%s)", self._headless)
            return self._context

    async def _try_launch(self, headless: bool) -> Optional[BrowserContext]:
        try:
            browser = self._playwright.chromium
            ctx = await browser.launch_persistent_context(
                user_data_dir=self._shadow_dir,
                headless=headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--disable-site-isolation-trials",
                    "--disable-web-security",
                    "--no-first-run",
                    "--no-default-browser-check",
                ],
                no_viewport=True if not headless else False,
                locale="en-US",
            )
            return ctx
        except Exception as exc:
            logger.warning("Launch attempt (headless=%s) failed: %s", headless, exc)
            return None

    async def close(self):
        async with self._lock:
            for sid, page in list(self._pages.items()):
                try:
                    await page.close()
                except Exception as exc:
                    logger.debug("Error closing page %s: %s", sid, exc)
            self._pages.clear()

            if self._context:
                try:
                    await self._context.close()
                except Exception as exc:
                    logger.debug("Error closing context: %s", exc)
                self._context = None

            if self._playwright:
                try:
                    await self._playwright.stop()
                except Exception as exc:
                    logger.debug("Error stopping playwright: %s", exc)
                self._playwright = None

            if self._shadow_dir and os.path.isdir(self._shadow_dir):
                try:
                    shutil.rmtree(self._shadow_dir)
                    logger.info("Cleaned up shadow profile %s", self._shadow_dir)
                except Exception as exc:
                    logger.warning("Failed to remove shadow profile: %s", exc)
                self._shadow_dir = None

    # ---- pages / sessions -------------------------------------------------
    async def get_page(self, session_id: Optional[str] = None) -> tuple[Page, str]:
        ctx = await self.ensure_browser()
        sid = session_id or f"auto_{id(asyncio.current_task())}"
        if sid in self._pages:
            page = self._pages[sid]
            # Ensure page is still usable
            try:
                _ = await page.evaluate("1")
                return page, sid
            except Exception:
                logger.info("Page for session %s dead; recreating", sid)
                try:
                    await page.close()
                except Exception:
                    pass
                del self._pages[sid]
        page = await ctx.new_page()
        self._pages[sid] = page
        return page, sid

    async def clear_session(self, sid: str) -> bool:
        page = self._pages.pop(sid, None)
        if page:
            try:
                await page.close()
            except Exception as exc:
                logger.debug("Error closing page for session %s: %s", sid, exc)
            return True
        return False


browser_mgr = BrowserManager()


# ------------------------------------------------------------------
# Perplexity automation helpers
# ------------------------------------------------------------------
LOGIN_INDICATORS = ["perplexity.ai/login", "perplexity.ai/auth", "perplexity.ai/signin"]
BOT_INDICATORS = ["captcha", "robot", "cloudflare", "verify you are human", "challenge"]

SELECTORS_SEARCH = [
    'textarea[placeholder*="Ask"]',
    'textarea[placeholder*="Search"]',
    'textarea[data-testid="search-box"]',
    '[data-testid="search-box"]',
    'div[contenteditable="true"]',
    'textarea',
]

SELECTORS_ANSWER = [
    '[data-testid="answer-content"]',
    '.prose',
    '.answer',
    '[data-testid="result"]',
    '.search-result',
    'main .markdown-body',
    'article',
    'div[class*="answer"]',
    'div[class*="result"]',
    '.message-content',
]

SELECTORS_SOURCES = [
    '[data-testid="source"] a',
    '.source-card a',
    '.citation a',
    '.source-item a',
    '.source a',
    '[class*="source"] a',
]


async def _is_login_page(page: Page) -> bool:
    url = page.url.lower()
    for indicator in LOGIN_INDICATORS:
        if indicator in url:
            return True
    try:
        title = await page.title()
        if "log in" in title.lower() or "sign in" in title.lower():
            return True
    except Exception:
        pass
    return False


async def _detect_bot_challenge(page: Page) -> bool:
    try:
        content = (await page.content()).lower()
        title = await page.title()
        body_text = await page.inner_text("body")
    except Exception:
        return False
    combined = f"{content} {title} {body_text}".lower()
    return any(ind in combined for ind in BOT_INDICATORS)


async def _dismiss_cookies(page: Page):
    """Best-effort cookie/ consent banner dismissal."""
    consent_selectors = [
        'button:has-text("Accept")',
        'button:has-text("Allow")',
        'button:has-text("Got it")',
        'button:has-text("I agree")',
        '[data-testid="cookie-banner-accept"]',
        '[aria-label*="Accept"]',
    ]
    for sel in consent_selectors:
        try:
            if await page.is_visible(sel, timeout=500):
                await page.click(sel)
                await asyncio.sleep(0.2)
        except Exception:
            pass


async def _find_and_fill_search(page: Page, query: str):
    for sel in SELECTORS_SEARCH:
        try:
            if await page.is_visible(sel, timeout=2000):
                await page.fill(sel, query)
                return sel
        except Exception:
            continue
    raise RuntimeError("Search input not found on perplexity.ai")


async def _submit_search(page: Page, sel: str):
    """Submit by pressing Enter; fall back to submit button click."""
    try:
        await page.press(sel, "Enter")
    except Exception:
        pass
    # Some UIs require button click
    submit_selectors = [
        'button[type="submit"]',
        'button[aria-label="Submit"]',
        '[data-testid="submit-button"]',
        'button:has(svg)',
        'button >> nth=0',
    ]
    for btn_sel in submit_selectors:
        try:
            if await page.is_visible(btn_sel, timeout=500):
                await page.click(btn_sel)
                return
        except Exception:
            continue


async def _wait_for_answer(page: Page, timeout_sec: int) -> Optional[str]:
    """Return the selector that matched, or None on timeout."""
    start = time.time()
    while time.time() - start < timeout_sec:
        for sel in SELECTORS_ANSWER:
            try:
                if await page.is_visible(sel, timeout=1500):
                    return sel
            except Exception:
                continue
        await asyncio.sleep(0.5)
    return None


async def _extract_answer_text(page: Page, selector: str) -> str:
    try:
        text = await page.inner_text(selector, timeout=5000)
        return text.strip()
    except Exception as exc:
        logger.debug("inner_text extraction failed: %s", exc)
        # Fallback: all paragraphs inside selector
        try:
            paragraphs = await page.eval_on_selector_all(
                f"{selector} p", "els => els.map(e => e.innerText).join('\\n\\n')"
            )
            return paragraphs.strip()
        except Exception:
            return ""


async def _extract_sources(page: Page, limit: int = 5) -> list[dict[str, str]]:
    sources: list[dict[str, str]] = []
    for sel in SELECTORS_SOURCES:
        try:
            anchors = await page.query_selector_all(sel)
            for a in anchors:
                href = await a.get_attribute("href")
                title = await a.inner_text()
                if href and not href.startswith("javascript:"):
                    sources.append({
                        "title": (title or href).strip().replace("\n", " "),
                        "url": href,
                    })
                if len(sources) >= limit:
                    break
            if sources:
                break
        except Exception:
            continue
    # De-duplicate by URL while preserving order
    seen = set()
    unique = []
    for s in sources:
        if s["url"] not in seen:
            seen.add(s["url"])
            unique.append(s)
        if len(unique) >= limit:
            break
    return unique


async def run_perplexity_query(
    query: str,
    mode: str,
    session_id: Optional[str],
    max_wait: int,
    include_sources: bool,
) -> dict[str, Any]:
    start = time.time()
    page, sid = await browser_mgr.get_page(session_id)
    status = "ok"
    answer = ""
    sources: list[dict[str, str]] = []

    try:
        # Only navigate if this is a fresh page; reusing preserves thread history.
        current_url = page.url
        if not current_url.startswith("https://www.perplexity.ai"):
            logger.info("[%s] Navigating to perplexity.ai (mode=%s)", sid, mode)
            await page.goto("https://www.perplexity.ai/", wait_until="domcontentloaded", timeout=30000)
            await _dismiss_cookies(page)
            await asyncio.sleep(1.0)
        else:
            logger.info("[%s] Reusing existing perplexity tab for follow-up", sid)
            # Allow any dynamic UI to settle
            await asyncio.sleep(0.5)

        if await _is_login_page(page):
            return {
                "status": "auth_required",
                "answer": "",
                "sources": [],
                "session_id": sid,
                "duration_ms": int((time.time() - start) * 1000),
                "query": query,
            }

        if await _detect_bot_challenge(page):
            return {
                "status": "rate_limited",
                "answer": "",
                "sources": [],
                "session_id": sid,
                "duration_ms": int((time.time() - start) * 1000),
                "query": query,
            }

        # Best-effort mode selection (toggle before typing if UI element present)
        mode_label = mode.lower()
        mode_selectors = [
            f'button:has-text("{mode_label.capitalize()}")',
            f'[role="tab"]:has-text("{mode_label.capitalize()}")',
            f'div:has-text("{mode_label.capitalize()}")',
            '[data-testid="mode-toggle"]',
        ]
        for msel in mode_selectors:
            try:
                if await page.is_visible(msel, timeout=800):
                    await page.click(msel)
                    await asyncio.sleep(0.3)
                    break
            except Exception:
                continue

        search_sel = await _find_and_fill_search(page, query)
        await _submit_search(page, search_sel)
        logger.info("[%s] Query submitted, waiting for answer (max_wait=%d)", sid, max_wait)

        # Perplexity streams content; wait for the answer block to appear.
        answer_sel = await _wait_for_answer(page, max_wait)
        if answer_sel is None:
            status = "timeout"
            answer = await _extract_answer_text(page, "body")
        else:
            answer = await _extract_answer_text(page, answer_sel)

        if include_sources:
            sources = await _extract_sources(page)

    except PWTimeout:
        status = "timeout"
        logger.warning("[%s] Playwright timeout", sid)
        try:
            answer = await _extract_answer_text(page, "body")
        except Exception:
            answer = ""
    except Exception as exc:
        logger.exception("[%s] Query error", sid)
        status = "error"
        answer = str(exc)

    duration_ms = int((time.time() - start) * 1000)
    return {
        "status": status,
        "answer": answer,
        "sources": sources,
        "session_id": sid,
        "duration_ms": duration_ms,
        "query": query,
    }


# ------------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------------
class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1)
    mode: str = Field(default="pro", pattern="^(pro|focus|copilot)$")
    session_id: Optional[str] = None
    max_wait: int = Field(default=60, ge=5, le=300)
    sources: bool = Field(default=True)


class QueryResponse(BaseModel):
    status: str
    answer: str
    sources: list[dict[str, str]]
    session_id: str
    duration_ms: int
    query: str


class HealthResponse(BaseModel):
    status: str
    playwright_ready: bool
    chrome_profile_found: bool


# ------------------------------------------------------------------
# FastAPI app
# ------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Perplexity Bridge starting on %s:%d", HOST, PORT)
    yield
    logger.info("Perplexity Bridge stopping; cleaning up browser context")
    await browser_mgr.close()


app = FastAPI(title="Hermes Perplexity Bridge", version="0.1.0", lifespan=lifespan)


@app.get("/health", response_model=HealthResponse)
async def health():
    profile_found = bool(_find_chrome_user_data_dir())
    pw_ready = False
    try:
        import playwright
        from playwright.sync_api import sync_playwright
        # Quick smoke: can we import and list browser types?
        with sync_playwright() as p:
            _ = p.chromium
        pw_ready = True
    except Exception:
        pw_ready = False
    return HealthResponse(
        status="ok",
        playwright_ready=pw_ready,
        chrome_profile_found=profile_found,
    )


@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    result = await run_perplexity_query(
        query=req.query,
        mode=req.mode,
        session_id=req.session_id,
        max_wait=req.max_wait,
        include_sources=req.sources,
    )
    return QueryResponse(**result)


@app.post("/sessions/{sid}/clear")
async def clear_session(sid: str = FastPath(...)):
    cleared = await browser_mgr.clear_session(sid)
    return {"cleared": cleared, "session_id": sid}


# ------------------------------------------------------------------
# CLI helpers
# ------------------------------------------------------------------
def check_environment() -> bool:
    ok = True
    print("Perplexity Bridge environment check:")

    # Playwright
    try:
        import playwright
        print(f"  [OK] playwright Python package installed")
    except ImportError:
        print("  [MISSING] playwright Python package not installed")
        ok = False

    # Playwright browsers
    try:
        import subprocess
        result = subprocess.run(["playwright", "chromium", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  [OK] Playwright Chromium ready: {result.stdout.strip()}")
        else:
            print("  [MISSING] Playwright Chromium not installed (`playwright install chromium`)")
            ok = False
    except Exception as exc:
        print(f"  [WARN] Could not verify Playwright Chromium: {exc}")

    # Chrome profile
    profile = _find_chrome_user_data_dir()
    if profile:
        print(f"  [OK] Chrome profile found: {profile}")
    else:
        print("  [MISSING] Chrome profile not found. Set CHROME_USER_DATA_DIR.")
        ok = False

    return ok


def main():
    parser = argparse.ArgumentParser(description="Hermes Perplexity Bridge Server")
    parser.add_argument("--check", action="store_true", help="Validate environment and exit")
    parser.add_argument("--host", default=HOST, help="Bind host")
    parser.add_argument("--port", type=int, default=PORT, help="Bind port")
    parser.add_argument("--headed", action="store_true", help="Force headed mode (visible browser window)")
    args = parser.parse_args()

    if args.check:
        ok = check_environment()
        sys.exit(0 if ok else 1)

    import uvicorn
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
