# Hermes Rack Secret Management

## Quick Start

```bash
cd ~/projects/hermes-rack

# Edit an existing encrypted file:
sops secrets/bridges.yaml

# Create a new encrypted file:
sops secrets/filename.yaml
```

`sops` opens an editor, you edit plaintext, save and exit -- it re-encrypts automatically.

## Age Key Location

- **Private key:** `~/.config/sops/age/keys.txt` -- BACK THIS UP TO PAPER NOW.
- **Public key:** `age1w7guzvsr4d56wjezymdz2c06ed6pnxnnl6n2uts02p2rf2xtj35s0693dh`

Never commit `keys.txt`. It decrypts everything.

## Secret Categories

| File | Contents | Access |
|------|-----------|--------|
| `secrets/bridges.yaml` | Bridge API keys, internal endpoints | All bridge services |
| `secrets/providers.yaml` | OpenRouter, Anthropic, OpenAI, Gemini keys | Hermes agent only |
| `secrets/infra.yaml` | SSH keys, DB passwords, WireGuard configs | COO/agent only |
| `secrets/bounty/` | Bug-bounty creds, separated namespace | Bounty workflows only |
| `secrets/google_workspace.yaml` | Client secrets, OAuth tokens | Google Workspace bridge only |

## Rules

1. **Never commit plaintext secrets.** Git-track only encrypted `.yaml` files.
2. **Never send secrets in chat.** SOPS only.
3. **Rotate age key yearl**y-ish or on suspected compromise.
4. **Paper backup** the private key. If `~/.config/sops/age/` is lost, you lose all secrets.
5. **Bridge secrets** are mostly empty right now (LAN-local, no auth).
6. **Migration to NixOS:** sops-nix reads these same files. The `.sops.yaml` rules transfer directly.

## For Bridge Developers

Bridge servers read env vars, not this repo directly. Bridge secrets are injected via:
```bash
export HOMELAB_API_KEY=$(sops -d --extract '["homelab_api"]["key"]' secrets/bridges.yaml)
```

Or hardcoded as empty strings in dev, since bridges run on 127.0.0.1 with no inbound auth.
