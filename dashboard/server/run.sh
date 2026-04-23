#!/usr/bin/env bash
# Launcher for hermes-bridge. Activates the hermes venv and starts the server.
set -euo pipefail

HERMES_AGENT_DIR="${HERMES_AGENT_DIR:-$HOME/.hermes/hermes-agent}"
VENV="$HERMES_AGENT_DIR/venv"
BRIDGE="$(cd "$(dirname "$0")" && pwd)/hermes_bridge.py"

if [[ ! -d "$VENV" ]]; then
  echo "venv not found at $VENV" >&2
  exit 2
fi

# shellcheck disable=SC1091
source "$VENV/bin/activate"

# Ensure FastAPI + uvicorn are available; install on first run into the venv.
python - <<'PY' || exit 3
import importlib.util, subprocess, sys
need = []
for mod, pip_name in (("fastapi","fastapi"), ("uvicorn","uvicorn[standard]"),
                      ("pydantic","pydantic"), ("multipart","python-multipart")):
    if importlib.util.find_spec(mod) is None:
        need.append(pip_name)
if need:
    print(f"[hermes-bridge] installing: {need}")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--quiet", *need])
PY

export HERMES_AGENT_DIR
export HERMES_BRIDGE_HOST="${HERMES_BRIDGE_HOST:-0.0.0.0}"
export HERMES_BRIDGE_PORT="${HERMES_BRIDGE_PORT:-7777}"
export HERMES_BRIDGE_MODEL="${HERMES_BRIDGE_MODEL:-claude-opus-4-7}"
export HERMES_BRIDGE_PROVIDER="${HERMES_BRIDGE_PROVIDER:-anthropic}"

exec python "$BRIDGE"
