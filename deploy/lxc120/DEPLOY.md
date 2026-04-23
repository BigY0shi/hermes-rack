# LXC120 Deployment Playbook
# Proxmox container at 192.168.0.191, hostname: crewai

## Prerequisites (already done)
# - Docker CE 29.4.1 installed on LXC120
# - Docker Compose plugin available

## 1. Install uv (Python package manager)
```bash
sshpass -p "Dlink2012" ssh -o StrictHostKeyChecking=no root@192.168.0.191
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.local/bin/env
```

## 2. Scaffold Agno AgentOS
```bash
cd /root
uv venv --python 3.12
source .venv/bin/activate
uv pip install -U 'agno[infra]'

# Scaffold the Docker template
ag infra create --template agentos-docker --name agentos-docker
cd agentos-docker
```

## 3. Set API key (placeholder - replace with real key)
```bash
# Option A: Export in session
export OLLAMA_API_KEY=sk-your-key-here

# Option B: Write to .env file
cat > .env <<EOF
OLLAMA_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://agent:hermesagent@db:5432/agentstack
EOF
```

## 4. Merge with shared PostgreSQL

The scaffolded template likely defines its own DB. You want to share the pgvector image from our compose.

**Option A: Let Agno use its own ephemeral DB and keep the shared compose separate**
- Run `docker compose up -d --build` inside agentos-docker/ (it uses its own DB)
- Run our shared compose (`docker compose -f /root/docker-compose.yml up -d db flowise`)

**Option B: Merge into one compose file**
- Extract the `Dockerfile` and service from agentos-docker/docker-compose.yml
- Merge into /root/docker-compose.yml
- Add `depends_on` for db service

## 5. Build and run everything
```bash
# From agentos-docker directory:
docker compose up -d --build

# From /root (shared services):
docker compose -f docker-compose.yml up -d db flowise
```

## 6. Verify
```bash
sshpass -p "Dlink2012" ssh root@192.168.0.191 "docker ps"
```

Expected:
```
CONTAINER ID   IMAGE                     PORTS                    STATUS
every    pgvector/pgvector:pg16      0.0.0.0:5432->5432/tcp   Up
some     flowiseai/flowise:latest    0.0.0.0:3000->3000/tcp   Up
some     agentos-docker-app:latest   0.0.0.0:8000->8000/tcp   Up
```

## Known Issues

1. **agno/agentos:latest does NOT exist on Docker Hub.** It's a local build, not a published image. The `ag infra create` command scaffolds a Dockerfile that must be built locally.

2. **OLLAMA_API_KEY format:** The original compose had a malformed placeholder. Use proper env var syntax: `${OLLAMA_API_KEY:-}` for an empty default.

3. **pgvector:** The shared compose uses `pgvector/pgvector:pg16` which is confirmed published. Flowise uses it for persistence.

4. **CORS_ORIGINS='*'** in Flowise allows any origin. For production, restrict to your LAN IPs.

5. **FLOWISE_SECRETKEY_OVERWRITE** is set. This forces a specific JWT secret. Don't change unless you want to invalidate existing Flowise sessions.
