# Hermes Perplexity Bridge

Local HTTP bridge that lets Hermes/VoltAgent send research queries to
[Perplexity.ai](https://perplexity.ai) and receive structured answers back,
using Playwright to drive a Chromium instance loaded with the user's Windows
Chrome profile for authentication.

## Setup

```bash
cd ~/projects/hermes-rack/bridges/perplexity_bridge

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright Chromium binaries
playwright install chromium
```

### Environment variables

| Variable               | Default                               | Description                          |
| ---------------------- | ------------------------------------- | ------------------------------------ |
| `BRIDGE_HOST`          | `127.0.0.1`                           | API bind host                        |
| `BRIDGE_PORT`          | `4050`                                | API bind port                        |
| `CHROME_USER_DATA_DIR` | auto-detected (WSL Chrome profile)    | Chrome `User Data` folder to use     |
| `LOG_LEVEL`            | `INFO`                                | Python logging level                 |

On WSL the bridge scans `/mnt/c/Users/*/AppData/Local/Google/Chrome/User Data/`
and picks the first valid profile. If your Chrome is elsewhere, set
`CHROME_USER_DATA_DIR` explicitly.

**The bridge does NOT write into your real Chrome profile.**
It creates a temporary shadow copy of auth-critical files (cookies, login
state, etc.) and runs its own isolated Chromium process so your live Chrome
browsing is unaffected.

## Usage

### Validate environment

```bash
python perplexity_bridge.py --check
```

### Start the server

```bash
python perplexity_bridge.py
# or force visible browser window
python perplexity_bridge.py --headed
# or custom host/port
python perplexity_bridge.py --host 0.0.0.0 --port 5050
```

### API endpoints

#### `GET /health`

```json
{
  "status": "ok",
  "playwright_ready": true,
  "chrome_profile_found": true
}
```

#### `POST /query`

Request body:

```json
{
  "query": "What are the latest LLM benchmarks?",
  "mode": "pro",
  "session_id": "optional-thread-id",
  "max_wait": 60,
  "sources": true
}
```

- `mode`: `pro`, `focus`, or `copilot` (best-effort UI toggle).
- `session_id`: If provided, the same browser tab / Perplexity thread is reused,
  preserving conversation history.
- `max_wait`: Maximum seconds to wait for an answer (default `60`).
- `sources`: Whether to extract cited source links (default `true`).

Response:

```json
{
  "status": "ok",
  "answer": "The latest LLM benchmarks...",
  "sources": [
    {"title": "LM Arena Leaderboard", "url": "https://..."},
    ...
  ],
  "session_id": "optional-thread-id",
  "duration_ms": 8420,
  "query": "What are the latest LLM benchmarks?"
}
```

Possible `status` values:

- `ok` – answer extracted successfully
- `timeout` – answer didn't appear within `max_wait`; partial text may still be present
- `auth_required` – Perplexity redirected to login; your Chrome profile may need a manual login
- `rate_limited` – Captcha / bot challenge detected
- `error` – unexpected exception

#### `POST /sessions/{id}/clear`

Closes the browser tab for the given session ID and frees memory.

```json
{
  "cleared": true,
  "session_id": "optional-thread-id"
}
```

## Architecture

- **FastAPI** frontend, single `BrowserManager` keeps one persistent Chromium
  `BrowserContext` alive.
- Each `session_id` maps to a dedicated `Page` (tab). Reusing a session reuses
  the same tab so Perplexity treats it as the same conversation thread.
- On startup the bridge copies only small auth metadata files into a temp
  "shadow" profile, avoiding file locks on the live Chrome directory.
- If `headless=True` is blocked by Perplexity, the bridge automatically falls
  back to `headless=False`.
