---
project: azkar
public: true
backfilled: true
type: fix
audience: users
title: 'Исправлена навигация назад и шторка'
summary: 'Свайп и кнопка «назад» больше не приводят к чёрному экрану, шторка информации закрывается надёжно.'
user_impact:
  - 'Нет чёрного экрана при возврате'
screenshots: []
checks: []
deploy_url: https://azkar.nurtech.dev
commits: 1272462..e664e53
---

Notes for editor:
- What changed: Блокировка прокрутки при свайпе, правка стека.
- Where to verify: https://azkar.nurtech.dev
- Risks: восстановлено по git log задним числом.
