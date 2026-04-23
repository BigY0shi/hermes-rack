# Stage 0 — Rack Migration Plan

**Goal:** Move Hermes off the WSL laptop and onto a Proxmox LXC, running 24/7,
reachable via Tailscale, with the same identity (memory, skills, sessions,
credentials, gateway connections) as the current WSL install.

**Out of scope for Stage 0:** Control API, workflow engine, Pi dashboard, voice.
Those are Stages 1–7 (see design.md §5 + §8).

---

## 0. Context and assumptions

- **Source:** WSL Ubuntu on Windows laptop. Hermes lives at `~/.hermes/` with
  a venv at `~/.hermes/hermes-agent/venv/`.
- **Target:** Proxmox host with spare capacity. User will provision the LXC.
  Hardware budget: i7 10th gen, 64 GB DDR4, Arc B50 (not used in Stage 0).
- **Runtime inside LXC:** Debian 12 + Docker Compose. Hermes + future services
  all run as containers, with `/opt/hermes` bind-mounted into them.
- **Identity state to migrate:**
  - `~/.hermes/.env` — API keys and tokens
  - `~/.hermes/auth.json` — credential pool (OAuth + PKCE)
  - `~/.hermes/config.yaml` — settings
  - `~/.hermes/memory.md` — personal notes
  - `~/.hermes/user.md` — user profile
  - `~/.hermes/skills/` — custom skills
  - `~/.hermes/sessions.db` — conversation history (optional but desired)
  - `~/.hermes/cron/` — scheduled jobs
  - `~/.hermes/scripts/` — cron scripts
  - `~/.hermes/audio_cache/` — skip (ephemeral)
  - `~/.hermes/trajectories/` — skip (large, ephemeral)
- **Downtime expectation:** ≤ 15 minutes during cutover. Slack/TG gateways will
  reconnect automatically once the new host starts.

---

## 1. Deliverables (artifacts to build now, use later)

All artifacts land under `~/projects/hermes-rack/`:

1. `design.md` — master design doc (done).
2. `plans/0000-migration.md` — this plan.
3. `scripts/export-wsl.sh` — runs on WSL, tars the identity bundle to a single
   encrypted file.
4. `scripts/proxmox-create-lxc.sh` — commands / pct config to create the LXC
   (runs on Proxmox host).
5. `scripts/install-lxc.sh` — runs inside the LXC, installs Docker, Tailscale,
   Caddy, creates service user, sets up directory layout.
6. `scripts/import-lxc.sh` — runs inside the LXC, unpacks the identity bundle
   into `/opt/hermes/` with correct ownership/perms.
7. `docker/docker-compose.yml` — Stage-0 services: `hermes-gateway`, `hermes-cron`.
   (API / workflow / whisper added in later stages.)
8. `docker/Dockerfile.hermes` — single image used by gateway + cron.
9. `systemd/hermes-compose.service` — ensures compose is up on boot.
10. `docs/runbook.md` — cutover steps + rollback.

---

## 2. Target LXC spec

```
OS:       Debian 12 (bookworm) standard template
Hostname: hermes
Type:     unprivileged LXC
vCPU:     4 cores
RAM:      8 GB
Swap:     2 GB
Disk:     40 GB on local-zfs (or equivalent)
Features: nesting=1, keyctl=1  (required for Docker-in-LXC)
Network:  vmbr0 DHCP, IPv4 only for now
Tailscale auth key: pre-generated reusable/ephemeral=false, tag:hermes
```

`/opt/hermes` will be a bind-mount from host path (e.g. `/tank/hermes` or
`/var/lib/hermes-data`) so the container filesystem stays stateless and
identity survives LXC rebuilds.

---

## 3. Directory layout inside LXC

```
/opt/hermes/                 ← bind-mount from host
├── .env                     ← from WSL
├── auth.json                ← from WSL
├── config.yaml              ← from WSL (paths rewritten to /opt/hermes)
├── memory.md
├── user.md
├── sessions.db
├── skills/
├── cron/
├── scripts/
└── logs/

/opt/hermes-agent/           ← fresh checkout, not from WSL
└── <git clone of hermes-agent repo>

/etc/hermes/
├── docker-compose.yml
├── Dockerfile.hermes
└── caddy/Caddyfile          (Stage 1)
```

`HERMES_HOME=/opt/hermes` env var pins the agent to the mounted volume.

---

## 4. Step-by-step plan

### Step 1 — Author all scripts locally (today)

On WSL, build the artifacts above under `~/projects/hermes-rack/`. No network
actions; pure authoring.

### Step 2 — Dry-run the export on WSL

```
bash ~/projects/hermes-rack/scripts/export-wsl.sh --dry-run
```

Confirms:
- All expected identity files exist.
- Tarball size is reasonable (< 500 MB expected; sessions.db dominates).
- No surprises (huge trajectory dir, orphan caches).

### Step 3 — Provision LXC on Proxmox

```
bash ~/projects/hermes-rack/scripts/proxmox-create-lxc.sh
```

This script is a thin wrapper that prints `pct create …` + required
`/etc/pve/lxc/<id>.conf` tweaks for Docker-in-LXC (nesting, keyctl, cgroup).

### Step 4 — Bootstrap the LXC

Log in, run:

```
bash /tmp/install-lxc.sh
```

Installs: docker, docker-compose-plugin, tailscale, caddy, git, rsync, python3,
creates `hermes` service user (uid 1000), creates `/opt/hermes`, clones
`hermes-agent` into `/opt/hermes-agent`, builds the Docker image.

### Step 5 — Tailscale join

```
sudo tailscale up --authkey=<key> --hostname=hermes --ssh
```

Confirm MagicDNS: `ping hermes.<tailnet>.ts.net` from laptop.

### Step 6 — Cutover (≤ 15 min downtime)

1. On WSL: `hermes gateway stop` (or kill PID 11943 equivalent).
2. On WSL: `bash export-wsl.sh --out /mnt/c/Users/yoshi/Desktop/hermes-bundle.tar.gz.age --passphrase`.
3. Scp bundle to Proxmox host or LXC directly over tailnet.
4. In LXC: `bash import-lxc.sh /path/to/bundle.tar.gz.age`.
5. In LXC: `cd /etc/hermes && docker compose up -d`.
6. Verify: `docker compose logs -f hermes-gateway` shows Slack + TG connected.
7. Test: send a DM from Slack, confirm response from the new host.

### Step 7 — Verification checklist

- [ ] `docker compose ps` shows gateway + cron healthy.
- [ ] Slack bot responds to a fresh message.
- [ ] Telegram bot responds.
- [ ] `/model` picker shows 5+ providers (the bug from last session stays fixed).
- [ ] A scheduled cron job fires at the expected time.
- [ ] Memory entries from WSL session are readable by new agent.
- [ ] `session_search` returns sessions from WSL history.
- [ ] Tailscale SSH into LXC works.
- [ ] `systemctl status hermes-compose` is active (enabled).
- [ ] Reboot LXC, confirm everything comes back clean.

### Step 8 — Decommission WSL Hermes

Only after a full week of stability on the rack:

- Rename `~/.hermes/` → `~/.hermes.retired/` on WSL.
- Disable WSL `hermes` shortcut.
- Keep the retired dir around for 30 days, then delete.

---

## 5. Rollback plan

If the LXC Hermes misbehaves:

1. `docker compose down` in LXC.
2. Re-enable WSL Hermes: unrename `~/.hermes.retired/`, launch `hermes`.
3. Slack/TG reconnect within ~30s.
4. Total rollback time: < 5 min.

The WSL install is the immutable fallback until we are confident in the rack.

---

## 6. Risks and tradeoffs

| Risk | Mitigation |
|---|---|
| Docker-in-LXC permission weirdness | Use `nesting=1` + `keyctl=1`; fall back to VM if blocked. |
| Token collision (two gateways alive at once) | Strict cutover: stop WSL before starting LXC. |
| sessions.db FTS5 corruption on copy while open | Stop WSL agent first; copy cold file. |
| Tailscale auth key expires before use | Use reusable auth key valid for 24h. |
| `.env` paths pointing at WSL-specific dirs | `import-lxc.sh` rewrites `/home/yoshi/...` → `/opt/hermes/...` on import. |
| Skill scripts with absolute `/mnt/c/` paths | Scan skills dir on import; warn on any match; user decides per-skill. |
| Credential pool OAuth tokens refreshing from LXC | Tokens should work; refresh URLs are internet-reachable. Watch for Anthropic PKCE rebinding. |
| Arc B50 passthrough if we add Ollama later | Deferred to Stage 7 or later; not a Stage-0 risk. |

---

## 7. Files likely to change / create

- `~/projects/hermes-rack/design.md` (already created)
- `~/projects/hermes-rack/plans/0000-migration.md` (this file)
- `~/projects/hermes-rack/scripts/export-wsl.sh`
- `~/projects/hermes-rack/scripts/proxmox-create-lxc.sh`
- `~/projects/hermes-rack/scripts/install-lxc.sh`
- `~/projects/hermes-rack/scripts/import-lxc.sh`
- `~/projects/hermes-rack/docker/docker-compose.yml`
- `~/projects/hermes-rack/docker/Dockerfile.hermes`
- `~/projects/hermes-rack/systemd/hermes-compose.service`
- `~/projects/hermes-rack/docs/runbook.md`

No changes to the live WSL Hermes install during the authoring phase. The only
WSL-side change at migration time is a `hermes gateway stop` + `export-wsl.sh`.

---

## 8. Validation

Before declaring Stage 0 done:

1. Full reboot of the LXC, everything up clean.
2. Slack + Telegram bots both responsive.
3. Memory / skills / sessions preserved.
4. `session_search` returns pre-migration sessions.
5. A cron job fires on schedule.
6. Tailscale reachable from Pi (even before dashboard exists).
7. Host nightly snapshot of the LXC confirmed.

Only then do we move to Stage 1 (Control API).

---

## 9. Open questions for user

- **Storage for `/opt/hermes` bind mount** — existing ZFS pool? Create new
  dataset? Path?
- **Tailscale tailnet** — already have one running, or do we set up fresh?
- **Backup destination** — second disk in the rack, a NAS, or off-site?
- **Proxmox node name + LXC ID** — any preference, or pick sensible defaults?
- **Static LAN IP or DHCP** — DHCP is fine since Tailscale handles routing,
  but user may prefer a reserved lease.
- **Slack workspace** — confirm the current bot token will migrate cleanly
  (it should; tokens are workspace-bound not host-bound).
