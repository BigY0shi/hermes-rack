#!/usr/bin/env bash
# Resilient launcher — nohup'd, auto-restarts, writes PID + logs.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
LOG="$HOME/.hermes/logs/hermes-bridge.log"
PIDFILE="$HOME/.hermes/hermes-bridge.pid"
mkdir -p "$(dirname "$LOG")"

# Kill any existing bridge cleanly
if [[ -f "$PIDFILE" ]]; then
  OLD=$(cat "$PIDFILE" 2>/dev/null || echo "")
  if [[ -n "$OLD" ]] && kill -0 "$OLD" 2>/dev/null; then
    echo "Stopping existing bridge PID $OLD"
    kill "$OLD" 2>/dev/null || true
    sleep 1
    kill -9 "$OLD" 2>/dev/null || true
  fi
  rm -f "$PIDFILE"
fi

# Self-healing loop in a detached subshell
nohup bash -c '
  while true; do
    echo "[$(date -Iseconds)] starting hermes-bridge"
    bash "'"$HERE"'/run.sh" || echo "[$(date -Iseconds)] bridge exited with $?"
    echo "[$(date -Iseconds)] restarting in 3s…"
    sleep 3
  done
' >> "$LOG" 2>&1 &

echo $! > "$PIDFILE"
echo "Bridge supervisor PID: $(cat "$PIDFILE")"
echo "Log: $LOG"
echo ""
echo "Watch logs:   tail -f $LOG"
echo "Stop bridge:  kill \$(cat $PIDFILE)"
sleep 2
tail -20 "$LOG" 2>/dev/null || true
