# Hermes CLI Bridge

A lightweight FastAPI bridge server that wraps `claude-code` and `codex` CLI tools behind a local HTTP interface. Hermes and VoltAgent agents can delegate coding tasks without managing OAuth or CLI tool state directly.

## Features

- FastAPI HTTP server (default `127.0.0.1:4040`)
- **One-shot mode**: Stateless subprocess execution
- **Persistent sessions**: `tmux`-backed sessions keep state (auth, git, shell env) across calls via `session_id`
- Automatic binary resolution via `which` or env overrides
- Graceful fallback when `tmux` is unavailable

## Quick Start

```bash
cd ~/projects/hermes-rack/bridges/cli_bridge

# Install dependencies (into a venv or globally)
pip install -r requirements.txt

# Validate tool binaries exist
python3 cli_bridge.py --check

# Start the server
python3 cli_bridge.py
```

Server will listen on `127.0.0.1:4040` by default.

## Environment Variables

| Variable          | Description                                    | Default               |
|-------------------|------------------------------------------------|-----------------------|
| `BRIDGE_HOST`     | Bind address                                   | `127.0.0.1`           |
| `BRIDGE_PORT`     | Bind port                                      | `4040`                |
| `CLAUDE_CODE_BIN` | Full path to `claude-code` binary              | auto-detect (`claude-code` or `claude`) |
| `CODEX_BIN`       | Full path to `codex` binary                    | auto-detect (`codex`) |
| `LOG_LEVEL`       | Server log level                               | `INFO`                |

## API Endpoints

### GET /health

```bash
curl http://127.0.0.1:4040/health
```

Returns tool availability and `tmux` status.

### POST /run

```bash
curl -X POST http://127.0.0.1:4040/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "claude-code",
    "task": "--help",
    "timeout": 300
  }'
```

Body fields:
- `tool` (required): `"claude-code"` or `"codex"`
- `task` (required): raw command-line arguments / prompt text
- `cwd` (optional): working directory for execution
- `timeout` (optional): max seconds (default `300`, max `3600`)
- `session_id` (optional): persistent tmux session id

Response:
```json
{
  "status": "ok|error|timeout",
  "stdout": "...",
  "stderr": "...",
  "exit_code": 0,
  "session_id": "",
  "duration_ms": 1234,
  "tool": "/usr/local/bin/claude"
}
```

### Persistent session example

```bash
# first call creates the tmux session
curl -X POST http://127.0.0.1:4040/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "claude-code",
    "task": "explain this file",
    "session_id": "proj-alpha"
  }'

# subsequent calls reuse the same session (git state, auth, etc.)
curl -X POST http://127.0.0.1:4040/run \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "claude-code",
    "task": "list files",
    "session_id": "proj-alpha"
  }'
```

### GET /sessions

List active persistent sessions.

### POST /sessions/{id}/destroy

Kill a persistent session.

## Project Structure

```
cli_bridge/
├── cli_bridge.py       # Main server + CLI
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

## Notes

- Server is intended for LAN / localhost use only. No auth or HTTPS built-in.
- `tmux` is required on the host for persistent sessions; otherwise the server falls back to one-shot mode.
- The bridge assumes `claude-code` / `codex` are installed and authenticated on the target host (WSL / Linux).
