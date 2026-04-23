#!/usr/bin/env bash
ALIVE=~/projects/hermes-rack/build-heartbeat/.alive
if [ ! -f "$ALIVE" ]; then
    echo "STATUS: NO_HEARTBEAT"
    exit 1
fi
LAST=$(stat -c %Y "$ALIVE" 2>/dev/null || stat -f %m "$ALIVE" 2>/dev/null)
NOW=$(date +%s)
AGE=$(( NOW - LAST ))
CONTENT=$(cat "$ALIVE")
if [ "$AGE" -gt 90 ]; then
    echo "STATUS: STALE ($AGE sec ago)"
    echo "$CONTENT"
    exit 1
else
    echo "STATUS: ALIVE ($AGE sec ago)"
    echo "$CONTENT"
    exit 0
fi
