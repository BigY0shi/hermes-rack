# HERMES PHONE APP — PROGRESS TRACKER
# Last updated: 2026-04-22 19:10 UTC
# If Hermes goes silent, this file tells you what was in progress.
# Auto-updated by Hermes during builds.

## CURRENT TASK
- Next up: Phase 1.2+1.3 — Android SDK install + project scaffold

## COMPLETED
- [x] terminal-v0.html: /model command handler (show current + switch)
- [x] terminal-v0.html: /clear command handler  
- [x] terminal-v0.html: model shown in status bar with [model] indicator
- [x] terminal-v0.html: slash commands auto-submit zero-arg commands
- [x] terminal-v0.html: modelListCache populated from bridge /status
- [x] terminal-v0.html: Activity ticker bar (polls /activity, cycles events, click opens console)
- [x] phone-api: Phase 0.2 all endpoints (agents, sessions, tasks, skills, memory, cron, screenshot, tmux, SSE)
- [x] phone-api: /api/activity + /activity alias endpoint
- [x] phone-api: POST /api/cron endpoint (create cron jobs)
- [x] phone-api: PUT /api/cron/{job_id} matches by name too (not just ID)
- [x] phone-api: Fallback mock agents when bridge offline (4 agents with full fields)
- [x] phone-api: All 29 tests PASSING (was 8 failing)

## PENDING
- [ ] Android: Set up Android SDK + SDK Manager
- [ ] Android: Phase 1.2+1.3 (theme + components combined)
- [ ] Android: Phase 2 (shell + navigation + foldable)
- [ ] Android: Phase 3-9 (12 panes)
- [ ] Android: Phase 10 (build + sign + install)