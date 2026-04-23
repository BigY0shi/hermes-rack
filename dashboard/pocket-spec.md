# Spec: HERMES POCKET — Phone Companion

## Objective

Build a mobile-first web companion for Hermes that runs in any phone browser on the LAN. Not a chat client — a **control console**: status readouts, activity feed, skill launcher, push-to-talk. Phase 1 of the dashboard roadmap. Single HTML file, no build step.

**User stories:**
- As yoshi, I want to see Hermes status (model, uptime, tokens, cost) at a glance from my phone
- As yoshi, I want to see recent activity (tool calls, messages, cron runs) in a scrollable feed
- As yoshi, I want to launch skills by tapping pads on a grid
- As yoshi, I want to push-to-talk (HAIL) and have Hermes respond via voice
- As yoshi, I want to switch models/providers from CFG tab
- As yoshi, I want this to feel like a weathered spaceship control panel in my pocket

## Tech Stack

- **Single HTML file** with inline CSS + JS (like terminal-v0.html)
- **No framework, no bundler, no build step**
- **Fonts:** JetBrains Mono, IBM Plex Sans Condensed, VT323, DSEG7 Classic (Google Fonts CDN + self-hosted DSEG7)
- **Design system:** cassette-futurism-ui skill (palette, typography, motion, LEDs, panels)
- **Backend:** hermes_bridge.py (FastAPI on :7777)
- **Transport:** fetch + SSE for streaming, standard REST for commands

## Commands

```bash
# Start bridge (already exists)
bash ~/projects/hermes-rack/dashboard/server/run.sh

# Serve pocket companion (bridge serves static files from dashboard/)
# Pocket will be at http://<host>:7777/pocket.html

# View on phone (same LAN)
# http://<wsl-ip>:7777/pocket.html
```

## Project Structure

```
dashboard/
  terminal-v0.html        ← existing chat client (reference, not modified)
  pocket.html             ← THIS — phone companion
  server/
    hermes_bridge.py      ← existing bridge (add /pocket.html static route)
    run.sh
```

## Design System (locked — cassette-futurism-ui)

### Palette
```
--bone: #E8DFC8      --paper: #F1E8D0     --paper-dim: #DCD2B4
--graphite: #2B2A28  --slate: #6B6A66
--line: #C8BFA6      --line-dim: #B8AF93
--signal: #E8572C    --signal-dim: #B8431F  (user/active)
--amber: #D89B2A     (thinking/warning)
--teal: #5B8A8A      (nominal/assistant)
--phosphor: #5FA860  (CRT sub-panels ONLY)
--crt-bg: #0E1A12
```

### Phone-specific overrides
- Below 400px: no screws, no corner brackets (too noisy)
- 44px minimum touch targets
- Bottom nav is sticky, never scrolls
- HAIL button always visible (fixed, never scrolls away)
- Dark mode: CRT palette (phosphor on near-black) — auto via `prefers-color-scheme`

### Typography
```
JetBrains Mono     → code, logs, data, hero numbers
IBM Plex Sans Cond → UI labels, buttons, tabs
DSEG7 Classic      → 7-segment readouts (uptime, tokens, cost)
VT323              → CRT sub-panel text
```

### Motion
- ALL animations use `steps()` — no smooth easing
- LED pulses use `steps(6)`
- Digit changes flip split-flap style

## API Endpoints (from hermes_bridge.py)

The pocket companion uses these existing endpoints:

| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|----------|
| `/health` | GET | Liveness check | CFG tab |
| `/status` | GET | model, provider, uptime, tokens, cost | INSTRUMENTS |
| `/sessions` | GET | Active session list | MEM tab |
| `/skills` | GET | Available skills with metadata | PADS tab |
| `/command` | POST | Run slash command | PADS tab |
| `/chat` | POST (SSE) | Send message, get stream | HAIL (transcribed voice) |
| `/transcribe` | POST | Audio → text via Whisper | HAIL voice input |
| `/db-sessions` | GET | Historical sessions | MEM tab |
| `/db-search` | GET | Search session history | MEM tab |

### Status response shape (from /status)
```json
{
  "model": "claude-opus-4-7",
  "provider": "anthropic",
  "uptime": 12345.6,
  "sessions": 3,
  "tokens_today": 12847,
  "cost_today": 3.42
}
```

### Skills response shape (from /skills)
```json
[
  {
    "name": "plan",
    "category": "software-development",
    "description": "Plan mode for Hermes..."
  }
]
```

## UI Layout

```
┌─────────────────────────────────┐
│ HERMES ▓ v2 ▓ model/provider   │  STATUS BAR: brand, model, clock
│ NOW: idle                       │  AMBIENT: current task strip
├─────────────────────────────────┤
│                                 │
│  ┌─── INSTRUMENTS ──────────┐  │
│  │  UPTIME    TOK/DAY  COST │  │  7-segment hero display
│  │  04:32:17  12,847  $3.42 │  │
│  │  ●  gateways  ●  cron    │  │  LED status dots
│  └───────────────────────────┘  │
│                                 │
│  ┌─── ACTIVITY ──────────────┐  │
│  │  ▸ skill ran: github-pr   │  │  scrollable feed, pull-to-refresh
│  │  ▸ cron: backup-daily     │  │  tap to expand
│  │  ▸ message received       │  │
│  │  ...                      │  │
│  └───────────────────────────┘  │
│                                 │
│       ┌───────────────┐         │
│       │   H A I L     │         │  HERO push-to-talk button
│       │   ● hold ●   │         │  press & hold = record
│       └───────────────┘         │
│                                 │
├─────────────────────────────────┤
│ [PADS] [FLOW] [MEM] [CFG]      │  BOTTOM NAV (sticky)
└─────────────────────────────────┘
```

### Tab Contents

**PADS** — Skill launcher grid (K.O. II pad style)
- Grid of chunky pads, color-coded by category
- Category stripe along top of each pad
- Tap to invoke (POST /command with skill name)
- Shows invocation feedback (pad lights up, result appears)

**FLOW** — Workflow status + quick triggers
- Running workflows (from /sessions or future /workflows endpoint)
- Status LEDs: teal=running, amber=waiting, signal=failed
- Tap to view details or interrupt
- Empty state: "NO ACTIVE FLOWS"

**MEM** — Memory search + recent sessions
- Search bar → /db-search?q=...
- Recent sessions from /db-sessions
- Read-only peek at agent context

**CFG** — Configuration
- Model selector (dropdown of available models)
- Provider selector
- Voice toggle (ElevenLabs out, Whisper in)
- Connection status (LED: teal=connected, signal=error, slate=offline)
- Bridge URL (editable, defaults to ws://<auto>)

## Interactions

### HAIL (Push-to-Talk)
1. Touch down on HAIL button → microphone activates, button pulses amber
2. Speaking → audio recorded via MediaRecorder (WebM/Opus)
3. Touch up → POST /transcribe with audio blob → get text
4. Text fed to POST /chat (SSE stream) → response renders in activity feed
5. If ElevenLabs enabled → POST /voice/speak → audio plays back

### Activity Feed
- Polls /status every 5s for instrument updates
- /events SSE endpoint when available (future)
- Pull-to-refresh reloads recent activity
- Items: tool calls, messages, cron runs, skill invocations
- Tap item to expand details

### Navigation
- Bottom nav tabs switch views (no page reload)
- Active tab has signal-orange indicator
- Home view = INSTRUMENTS + ACTIVITY + HAIL (default)

## Boundaries

**Always:**
- Use cassette-futurism palette tokens, no invented colors
- Use steps() for all motion, no smooth easing
- 44px minimum touch targets
- All labels ALL CAPS, 10-11px, letter-spacing 0.14em, --slate
- No screws or corner brackets below 400px

**Ask first:**
- Adding new bridge API endpoints
- Changing the design palette
- Adding framework dependencies

**Never:**
- Use pure black (#000) or pure white (#fff)
- Add a build step or bundler
- Implement auth (LAN-trusted for Phase 1)
- Make HAIL scroll away

## Success Criteria

1. Phone can open pocket.html on LAN and see Hermes status within 2s
2. All four tabs render with correct content
3. HAIL records audio, transcribes, and streams a response
4. PADS grid shows all skills from /skills endpoint
5. INSTRUMENTS display updates every 5s with real data
6. Design matches cassette-futurism skill (no AI-aesthetic defaults)
7. Touch targets are all ≥ 44px
8. Works on Safari iOS and Chrome Android

## Open Questions

- Should HAIL also support text input (type instead of speak)? → Likely yes, as fallback
- Should we add /events SSE endpoint to hermes_bridge.py for live activity? → Yes, future
- DSEG7 font: self-host or CDN? → Self-host in dashboard/static/ for offline resilience