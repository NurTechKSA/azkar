---
project: azkar
public: true
backfilled: true
type: feature
audience: users
title: 'Обратный отсчёт до намаза и сброс прогресса по намазам'
summary: 'На главной виден отсчёт до ближайшего намаза, подсвечивается текущая сессия, а счётчик после намаза начинается заново каждый раз.'
user_impact:
  - 'Всегда видно, что читать сейчас'
  - 'Прогресс сбрасывается после фаджра и каждого намаза'
screenshots: []
checks: []
deploy_url: https://azkar.nurtech.dev
commits: b611746..a6ae544
---

Notes for editor:
- What changed: Подсветка текущей сессии, сохранение настроек отображения.
- Where to verify: https://azkar.nurtech.dev
- Risks: восстановлено по git log задним числом.
