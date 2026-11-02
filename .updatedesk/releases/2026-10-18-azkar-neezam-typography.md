---
project: azkar
public: true
type: design
audience: users
title: "Типографика экрана чтения зикров по референсу neezam"
summary: "Привели иерархию текста на экране чтения зикров к референсу neezam и вынесли размеры, интерлиньяж и цвета в токены темы."
user_impact:
  - "Арабский текст на тёмной теме получил тёплый кремово-золотистый оттенок (#EAE3D2) и выверенный межстрочный интервал (--zikr-ar-lh: 2.2), оставаясь главным визуальным акцентом карточки."
  - "Перевод смысла и транскрипция переведены с антиквы (Georgia) на чистый гротеск (--zikr-tr-font: var(--sans), 15.5px, line-height 1.56), а строка источника аккуратно приглушена (--zikr-src-ink, 12.5px)."
  - "Проверены все ступени ползунка размера арабского (24–44px) и все 4 шрифта (Насх, Мусхаф / Amiri Quran, Простой, Классика) на светлой и тёмной темах без переполнений и срезов огласовок."
screenshots:
  - "artifacts/screens/azkar-neezam-typography.png"
checks:
  - "Headless Chrome CDP (390×844): проверка отсутствия горизонтального переполнения на всех 22 карточках утренних азкаров для светлой и тёмной тем, 4 шрифтов и размеров 24–44px"
deploy_url: "https://azkar.nurtech.dev/app"
---

## Что изменилось

- В `:root`, `@media (prefers-color-scheme: dark)` и `:root[data-theme="light"|"dark"]` добавлены единые токены типографики чтения (`--zikr-ar-lh`, `--zikr-ar-ink`, `--zikr-tl-size`, `--zikr-tl-lh`, `--zikr-tl-ink`, `--zikr-tr-font`, `--zikr-tr-size`, `--zikr-tr-lh`, `--zikr-tr-ink`, `--zikr-src-size`, `--zikr-src-lh`, `--zikr-src-ink`).
- Классы `.arabic`, `.translit`, `.translate`, `.src-row`, `.ar-preview`, карточка инфо-модалки и режим чтения Корана переведены на токены темы с защитой от переполнения (`overflow-wrap: break-word`).
- Значение ползунка `#arSize` по умолчанию синхронизировано с `--ar-size: 33px`.
