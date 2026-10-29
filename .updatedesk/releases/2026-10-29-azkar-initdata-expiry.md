---
project: azkar
public: false
type: fix
audience: team
title: Проверка входа из Mini App — срок действия и сравнение подписи
summary: Внутреннее исправление безопасности; для пользователей ничего не меняется.
user_impact:
  - Перехваченная строка initData больше не работает дольше суток.
  - Подпись Telegram сравнивается за постоянное время.
screenshots: []
checks:
  - 'cd bot && npm test — 3 проверки (верная подпись, испорченная, без hash, просрочка, будущая дата)'
  - 'node --check bot/server.js'
deploy_url: https://azkar.nurtech.dev
---

Notes for editor:
- What changed: проверка initData вынесена в bot/initdata.js: auth_date старше INITDATA_MAX_AGE_SEC (86400) или больше чем на 5 минут в будущем отклоняется, hash — timingSafeEqual.
- Where to verify: Mini App → сохранение настроек напоминаний.
- Risks: открытый больше суток Mini App при сохранении получит 401 — переоткрыть.
