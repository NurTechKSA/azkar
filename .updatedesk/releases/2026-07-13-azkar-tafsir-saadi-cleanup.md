---
project: azkar
public: true
backfilled: true
type: fix
audience: users
title: 'Чистый текст тафсира ас-Саади'
summary: 'Убраны тысячи артефактов переноса слов, тафсир переведён на выверенный текст.'
user_impact:
  - 'Тафсир читается без искажений'
screenshots: []
checks: []
deploy_url: https://azkar.nurtech.dev
commits: a20d92f..24c280c
---

Notes for editor:
- What changed: Очистка данных и откат неудачной замены.
- Where to verify: https://azkar.nurtech.dev
- Risks: восстановлено по git log задним числом.
