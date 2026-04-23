"""
Hermes Build Heartbeat — run this in parallel with long builds.
Writes a .alive file every HEARTBEAT_INTERVAL seconds.
Check with: cat ~/projects/hermes-rack/build-heartbeat/.alive
"""
import argparse
import os
import sys
import time
from datetime import datetime, timezone

DEFAULT_DIR = os.path.expanduser("~/projects/hermes-rack/build-heartbeat")
ALIVE_FILE = os.path.join(DEFAULT_DIR, ".alive")

UPDATE_EVERY_SEC = 30

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Hermes build heartbeat daemon")
    parser.add_argument("--dir", default=DEFAULT_DIR, help="Directory for alive file")
    parser.add_argument("--interval", type=int, default=UPDATE_EVERY_SEC, help="Seconds between heartbeats")
    parser.add_argument("--once", action="store_true", help="Write once and exit")
    args = parser.parse_args()

    os.makedirs(args.dir, exist_ok=True)
    alive_path = os.path.join(args.dir, ".alive")

    if args.once:
        with open(alive_path, "w") as f:
            f.write(f"{datetime.now(timezone.utc).isoformat()}Z  RUNNING")
        sys.exit(0)

    print(f"[heartbeat] writing to {alive_path} every {args.interval}s", file=sys.stderr)
    try:
        while True:
            with open(alive_path, "w") as f:
                f.write(f"{datetime.now(timezone.utc).isoformat()}Z  RUNNING")
            time.sleep(args.interval)
    except KeyboardInterrupt:
        with open(alive_path, "w") as f:
            f.write(f"{datetime.now(timezone.utc).isoformat()}Z  STOPPED")
        print("[heartbeat] stopped", file=sys.stderr)
