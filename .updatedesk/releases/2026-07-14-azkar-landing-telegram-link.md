---
project: azkar
public: true
backfilled: true
type: fix
audience: users
title: 'Бот открывается с лендинга без блокировок'
summary: 'Кнопка на лендинге открывает бота напрямую, в обход блокируемого веб-адреса.'
user_impact:
  - 'Ссылка на бота работает стабильно'
screenshots: []
checks: []
deploy_url: https://azkar.nurtech.dev
commits: 1abf1e6..1abf1e6
---

Notes for editor:
- What changed: Ссылка через tg://.
- Where to verify: https://azkar.nurtech.dev
- Risks: восстановлено по git log задним числом.
