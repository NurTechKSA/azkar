---
project: azkar
public: false
backfilled: true
type: internal
audience: team
title: 'Внутреннее: ротация журналов контейнера'
summary: 'На общем сервере ограничен размер журналов контейнера.'
user_impact:
  - 'Изменения внутренние'
screenshots: []
checks: []
deploy_url: https://azkar.nurtech.dev
commits: bcd234f..bcd234f
---

Notes for editor:
- What changed: Лимит 20m×3.
- Where to verify: https://azkar.nurtech.dev
- Risks: восстановлено по git log задним числом.
