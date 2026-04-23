# Hermes Rack Project — Design Document

**Project codename:** HERMES/DECK
**Host name:** `nix` (yes, after the dog)
**North star:** "A dashboard of a spaceship that's weathered, old, and lost to time."
**Owner:** yoshi
**Revised:** 2026-04-19

---

## 1. Vision

Move Hermes off the WSL laptop and onto a dedicated homelab machine running
**NixOS on bare metal**. The box is single-tenant: Hermes is the OS's reason
to exist. Build a Raspberry Pi 4B dashboard as the physical front-end, in a
cassette-futurism / Teenage Engineering aesthetic.

Eventual endgame: port the dashboard to a custom cyberdeck (Clockwork Pi
mainboard v3.14 + CM3+), probably a Buildroot/Alpine image or a stripped
NixOS image — decide at cyberdeck phase.

The dashboard is NOT a chat client. It is a **control console**: launch
skills, scaffold and monitor workflows, observe vitals, receive voice
notifications, push-to-talk to hail Hermes.

Hermes also owns the rack: it manages Incus containers/VMs, tracks system
health, and will eventually orchestrate offensive tooling for bug-bounty
work in isolated sandboxes.

---

## 2. Inspirations

Primary: Teenage Engineering OP-1, TP-7, TX-6, K.O. II.
Secondary: Nostromo / Alien: Isolation consoles, Moon (2009), Silent Running,
Apollo-era NASA panels, reel-to-reel broadcast decks.

Design language:
- **OP-1** → chunky tactile buttons, hero numerics, tape/REC/PLAY metaphors, playful color-coded sections.
- **TP-7** → reel-to-reel mysticism, monastic minimalism, one-job-one-knob clarity.
- **TX-6** → dense industrial info panels, every mm labeled, broadcast seriousness.
- **K.O. II** → grid of pads as a trigger surface (skills launcher).
- **Weathered spaceship** → phosphor-green/amber CRT glow inside sub-panels, subtle scanlines, worn silkscreen labels, scuffs, "running since 1984" patina.

---

## 3. Aesthetic Rules (locked)

### Palette
```
--bone         #E8DFC8   coffee-stained background
--paper        #F1E8D0   panel cream
--graphite     #2B2A28   primary text
--slate        #6B6A66   secondary text
--line         #C8BFA6   hairlines
--signal       #E8572C   TE signal-orange, active/alert
--amber        #D89B2A   warning / recording
--teal         #5B8A8A   ok / nominal
--phosphor     #5FA860   CRT green (ONLY inside CRT sub-panels)
--crt-bg       #0E1A12   CRT panel background
```

No pure black, no pure white. Ever.

### Typography (all free / OFL)
- **JetBrains Mono** — code, logs, data.
- **IBM Plex Sans Condensed** — UI labels (narrow condensed = pure TE).
- **DSEG7 Classic** — 7-segment hero numerics.
- **VT323** — CRT sub-panel text.

### Label rules
ALL CAPS, letter-spacing 0.1em, 10–11px, `--slate`, slightly faded silkscreen.
Examples: `CTX USE`, `TOKENS / DAY`, `REC`, `HAIL`.

### Panels
- Corner brackets `⌐¬ ∟⌐` instead of rounded rectangles.
- Visible Phillips screws in corners (SVG).
- Paper-grain texture, subtle bevel.

### Motion
- All animations are **mechanical** — `steps()` timing, no smooth easing.
- Digits flip split-flap style.
- VU meters tick in discrete 5%/10% steps.
- Loading spinners are chunky mechanical wheels.

### LEDs
- Off = dark recessed dot, On = glowing orb with CSS bloom.
- Amber pulse = warning, orange pulse = active, teal steady = nominal.

### CRT sub-panels
- Phosphor-green on near-black, scanlines, bloom, edge burn-in, 0.5% vertical jitter.

### Sound (Pi speakers)
- Mechanical click on button press.
- Low tape-hiss ambient bed under silence.
- Amber warning beep on errors.
- ElevenLabs for voice out, Whisper for voice in.
- Optional 0.5% wow+flutter on ElevenLabs for cassette feel.

---

## 4. Hardware Targets

### The rack box (`nix`)
- **CPU:** i7 10th gen
- **RAM:** 64 GB DDR4
- **GPU:** Intel Arc B50 (reserved for future local-model work, not Phase 1)
- **Storage:** TBD (recommend: 2× SSD, one for `/`, one for `/var/lib/hermes` + Incus storage)
- **Network:** Ethernet only, LAN-attached, no public exposure
- **OS:** NixOS 24.05 or latest stable, flake-based

### Phase 1 — desk dashboard
- Raspberry Pi 4B (owned).
- 10.1" HDMI touchscreen with built-in speakers.
- Touch + Bluetooth keyboard.
- USB mic for push-to-talk.
- Pi OS Lite, read-only rootfs, Chromium kiosk.

### Phase 2 — cyberdeck
- Clockwork Pi mainboard v3.14 + Compute Module 3+.
- OS decided at cyberdeck phase — likely stripped NixOS image or Buildroot.

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  BARE METAL — `nix` — NixOS 24.05 (flake-managed)                   │
│                                                                     │
│  systemd services (declared in modules/*.nix):                      │
│    ├── hermes-gateway.service    Slack/TG/Discord outbound WS       │
│    ├── hermes-cron.service       scheduled jobs                     │
│    ├── hermes-api.service        FastAPI control plane (Stage 1)    │
│    ├── hermes-workflow.service   DAG runner (Stage 4)               │
│    ├── whisper.service           PTT transcription (Stage 5)        │
│    ├── caddy.service             TLS + reverse proxy (LAN certs)    │
│    ├── incus.service             container/VM manager for sandboxes │
│    └── rustdesk-server.service   (optional, for human remote)       │
│                                                                     │
│  State:                                                             │
│    /var/lib/hermes/              ← identity (secrets, memory, etc.) │
│    /var/lib/incus/               ← sandbox container storage        │
│    /nix/store/                   ← immutable system, flake-managed  │
│                                                                     │
│  Secrets (sops-nix, encrypted at rest in the flake repo):           │
│    secrets/hermes.yaml           Slack/TG tokens, LLM API keys      │
│    secrets/bounty.yaml           bug-bounty creds (separate ns)     │
│    secrets/infra.yaml            Incus, HA, UniFi tokens            │
│                                                                     │
│  Incus containers (spawned on demand by Hermes):                    │
│    kali-lab          offensive tooling, Agent Zer0 / HexStrike      │
│    dragon-os         SDR work                                       │
│    burner-vm         throwaway env for sketchy software             │
│    (network-isolated on their own bridge, no lateral to host)       │
└─────────────────────────────────────────────────────────────────────┘
              ▲                                       ▲
              │ LAN (RFC1918)                         │ LAN
              │                                       │
┌─────────────┴───────────────┐           ┌───────────┴──────────────┐
│  RASPBERRY PI 4B            │           │  YOUR LAPTOP / PHONE     │
│  Pi OS Lite, Chromium       │           │  Browser → dashboard     │
│  kiosk → nix.local/dash     │           │  RustDesk → nix          │
└─────────────────────────────┘           └──────────────────────────┘
```

### Networking (Phase 1)
- **LAN-only.** Pi, laptop, rack all on the home LAN.
- **mDNS** (`nix.local`) via avahi for friendly hostnames.
- **RustDesk** for remote human access (you already self-host or will).
- **No mesh VPN yet.** Deferred — when you want dashboard from outside the
  house, we add Nebula or Headscale as a second network plane.
- **Caddy** terminates TLS on the LAN using internal CA (mkcert-style or
  NixOS's `security.pki.certificateFiles`), so `https://nix.local` works
  without cert warnings.

### Sandbox network isolation (for bug bounty)
- Incus-managed bridge `incusbr-work` — RFC1918, no route to host LAN.
- Egress via the host's default gateway only (or via a dedicated interface
  if/when you want to tunnel through a bounty-program VPN).
- Kali/HexStrike/Agent Zer0 containers attach to `incusbr-work` only.
- Hermes reaches them via `incus exec` on the host, not over the bridge.
- No Incus container can reach `/var/lib/hermes` or any host service.

---

## 6. Why NixOS, why bare metal, why not Proxmox

- **NixOS on bare metal** because the box is single-tenant (mine), and the
  flake gives us reproducibility without hypervisor overhead. The "snapshot"
  is the git commit; the "rollback" is `nixos-rebuild --rollback`.
- **Not Proxmox** because it's a hypervisor appliance designed for multi-VM
  clusters. Overkill and hostile to direct customization for a single-tenant
  agent host.
- **Not Incus-as-host** because Incus is a container/VM manager, not an OS.
  It runs ON NixOS as a service, giving us sandboxes when we need them.
- **Not Kali/Dragon/Parrot as host** because rolling offensive distros are
  bad 24/7 servers. We spin those up as sandboxes on demand instead.

Hermes runs as a **systemd service on the host**, not containerized, because:
- The box is mine; containment-for-containment's-sake adds no value.
- NixOS's declarative model IS the reproducibility layer.
- Direct access to `incus`, `systemctl`, `zpool`, hardware sensors, etc.
- A dedicated `hermes` system user provides process isolation without Docker.

---

## 7. Control API (spec v0.1)

FastAPI service. Systemd unit. Bound to LAN interface (not 0.0.0.0).
Auth: Caddy does basic-auth or mutual-TLS on the LAN; no tokens on the Pi.

```
GET    /health
GET    /status              → model, provider, uptime, tokens_today, cost_today
GET    /gateways            → per-platform connection state
GET    /sessions?limit=50
GET    /sessions/{id}/messages
GET    /memory
GET    /skills              → list with metadata + categories
POST   /skills/{name}/run   → invoke skill, returns run_id
GET    /runs/{run_id}       → status + logs + outputs
GET    /cron
POST   /cron/{id}/run
GET    /workflows
POST   /workflows
POST   /workflows/{id}/run
GET    /activity            → recent tool-call rate, for VU meters
POST   /chat
POST   /voice/transcribe    → audio → text (Whisper local)
POST   /voice/speak         → text → audio URL (ElevenLabs)
WS     /events              → live stream: status, tool_call, node_transition, message

# Host/infra (Stage 1.5)
GET    /infra/nodes         → host info (uptime, load, disks, temps)
GET    /infra/incus/instances
POST   /infra/incus/instances/{name}/snapshot
POST   /infra/incus/instances/{name}/start
POST   /infra/incus/instances/{name}/stop
POST   /infra/incus/instances            → create (from template)
DELETE /infra/incus/instances/{name}
GET    /infra/sensors                    → temps, fans, power
```

---

## 8. Dashboard UI Layout (10.1", 1280×800)

(Unchanged from prior version — see §3 for aesthetic rules.)

```
┌──────────────────────────────────────────────────────────────────────┐
│ HERMES ▓ v2.x ▓ model/provider │ UPTIME  TOK/DAY  COST │ LEDs  CLOCK │  STATUS BAR
│ NOW: <current task or IDLE …………………………………………………………………………………>            │  AMBIENT
├───────────────┬──────────────────────────────────────┬───────────────┤
│ LAUNCH PADS   │  WORKFLOWS                           │ INSTRUMENTS   │
│  [pad grid]   │   [ COMPOSE | RUN | HISTORY ]        │  VU / CRT /   │
│               │                                      │  7-SEG / LEDs │
├───────────────┴──────────────────────────────────────┴───────────────┤
│ [F1 PADS] [F2 FLOW] [F3 MEM] [F4 CRON] [F5 LOGS] [F6 VOICE] [F7 CFG] │
└──────────────────────────────────────────────────────────────────────┘
```

### Hero components to build early
1. `SevenSegment` — DSEG7 split-flap transitions.
2. `VuMeter` — stepped, discrete.
3. `Led` — off / on / pulse variants × signal/amber/teal.
4. `Panel` — corner brackets, screws, paper-grain, optional CRT.
5. `SilkscreenButton` — chunky, category stripe.
6. `CassetteCard` — session / run representation.
7. `CrtScreen` — phosphor + scanlines + bloom wrapper.
8. `FunctionRow` — F-key tabs.

---

## 9. Workflow Engine (MVP → full DAG)

### MVP (Stage 4)
- Linear chain: skill A → skill B → skill C.
- JSON DAG in `/var/lib/hermes/workflows/<slug>.json`.
- Python state machine, publishes transitions to `/events` WS.
- Status per node: pending | running | done | failed | skipped.
- Mermaid rendered client-side.

### Full (Stage 6)
- DAG: branching, parallel, conditional, loops, human-in-the-loop.
- Node types: `skill`, `agent`, `tool`, `conditional`, `parallel`, `human`, `wait`.
- Resumable, SQLite-persisted.
- ~400 lines of Python. No Prefect/Temporal/LangGraph.

---

## 10. Voice

### Out
ElevenLabs voice per event (workflow done, cron failed, new message).
Toggle per event type in F6 VOICE panel. Optional cassette warble FX.

### In
PTT button on Pi → USB mic → Whisper (local, on `nix`) → Hermes → reply via
ElevenLabs → monitor speakers. "HAIL" pad on dashboard triggers the same flow.

---

## 11. Security Model

- **LAN-only in Phase 1.** No inbound public ports. Ever.
- **Caddy** terminates TLS with an internal CA for `nix.local` hostnames.
- **Secrets** in sops-nix, encrypted with an age key held on your keyring
  (plus a paper backup). The flake repo can live on GitHub (encrypted) or
  stay local.
- **`hermes` system user** runs the agent. `root` is reserved for host admin.
- **Incus sandboxes** on isolated bridge; zero lateral movement to `nix`.
- **Bug-bounty credential namespace** is distinct: `secrets/bounty.yaml` is
  only decryptable by the Hermes agent when a bounty workflow runs, via a
  separate sops rule.
- **NixOS generations** = free rollback. Snapshots are git commits.
- **No Tailscale / ZeroTier / external mesh** in Phase 1.

---

## 12. Flake Repo Layout

```
nix/                                  ← flake repo, git-tracked
├── flake.nix                         ← inputs, outputs, nixosConfigurations.nix
├── flake.lock
├── hosts/
│   └── nix/
│       ├── configuration.nix         ← host-level (hardware, users, net)
│       └── hardware-configuration.nix
├── modules/
│   ├── hermes.nix                    ← Hermes agent systemd units + state dir
│   ├── hermes-api.nix                ← FastAPI service (Stage 1)
│   ├── hermes-workflow.nix           ← workflow runner (Stage 4)
│   ├── caddy.nix                     ← reverse proxy + internal CA
│   ├── incus.nix                     ← container manager + bridges
│   ├── whisper.nix                   ← local transcription (Stage 5)
│   ├── rustdesk.nix                  ← optional self-hosted relay
│   └── monitoring.nix                ← Prometheus node_exporter, optional
├── secrets/
│   ├── hermes.yaml                   ← sops-encrypted
│   ├── bounty.yaml                   ← sops-encrypted
│   └── infra.yaml                    ← sops-encrypted
├── pkgs/
│   └── hermes-agent/                 ← nix derivation for hermes-agent
│       └── default.nix
└── README.md
```

---

## 13. Open questions (tracked)

- [x] OS → **NixOS, flake-based**
- [x] Chat vs workflows on dashboard → **Workflows tab**
- [x] Skill launcher → **yes, K.O. II grid**
- [x] Workflow engine → **build fresh**
- [x] Mono font → **JetBrains Mono (free)**
- [x] Voice → **ElevenLabs + Whisper**
- [x] Secrets → **sops-nix**
- [x] Service-plumbing VPN → **LAN-only for Phase 1**
- [ ] Frontend framework → pending (SvelteKit recommended)
- [ ] Storage layout on `nix` (single disk, mirror, ZFS?) → pending
- [ ] Backup destination → pending
- [ ] Incus bridge IP range → default (`10.x`) unless you want a specific range
- [ ] Pi hostname → `deck` / `console` / something else?
- [ ] Cyberdeck OS → deferred

---

## 14. Non-goals

- No Proxmox, no Umbrel, no Coolify, no CasaOS.
- No k8s.
- No Prefect / Temporal / LangGraph.
- No public internet exposure in Phase 1.
- No multi-user.
- No local LLM hosting in Phase 1 (Arc B50 deferred).
- No running offensive distros as host OS.
