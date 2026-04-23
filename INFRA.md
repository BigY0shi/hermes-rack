# Homelab Infrastructure Topology

## Proxmox Cluster

| Node | IP:Port | Role | Access |
|------|---------|------|--------|
| pve-01 | 192.168.0.205:8006 | Compute | Read |
| pve-02 | 192.168.0.177:8006 | Compute | Read |
| pve-03 | 192.168.0.48:8006 | Admin / Control | Full admin |

The admin API key is stored in `secrets/bridges.yaml` (SOPS encrypted).

## Access Notes

- All nodes are on the LAN (192.168.0.0/24)
- No public internet exposure
- API uses HTTPS on port 8006 with self-signed certs (verify=False or add to trust store)
- The `hermes` user has admin privileges on .48 only

## Planned VMs (Evaluation Phase)

| VM | Node | Purpose | Status |
|----|------|---------|--------|
| flowise-ai | TBD | Visual agent prototype | Planning |
| agno-agentos | TBD | Code-first agent framework | Planning |
| hybrid-eval | TBD | Both frameworks combined | Planning |

## Bridge Targets

- CLI Bridge: http://127.0.0.1:4040 (WSL local)
- Perplexity Bridge: http://127.0.0.1:4050 (WSL local)
- VoltAgent: http://127.0.0.1:3141 (WSL local)
- Homelab API: https://192.168.0.48:8006 (Proxmox)
