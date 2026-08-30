# 🐂 Red Bull Fan Tribute

> Unofficial fan tribute. Not affiliated with Red Bull GmbH.

Кинематографичный одностраничный сайт-посвящение бренду Red Bull и команде Oracle Red Bull Racing. Опыт, построенный на скролл-драйвераных анимациях, 3D-графике и интерактивных секциях.

---

## 🛠 Технологии

| Категория | Стек |
|---|---|
| **Фреймворк** | Next.js 16 (App Router) |
| **Язык** | TypeScript 5 |
| **Стилизация** | Tailwind CSS 4 + PostCSS |
| **3D графика** | Three.js (`@react-three/fiber`, `@react-three/drei`) |
| **Пост-обработка** | Bloom, Vignette, Noise |
| **Анимации** | GSAP 3 + ScrollTrigger |
| **Скролл** | Lenis (smooth scroll) |
| **Состояние** | Zustand 5 |
| **UI** | Radix UI + Lucide Icons |
| **Аудио** | Web Audio API (синтезированный звук) |

---

## ✨ Возможности

### 🎬 Секции (8 частей)

1. **Hero** — Полноэкранный интро с слоганом "GIVES YOU WINGS" и брендовым тикером
2. **The Can** — Интерактивная 3D банка Red Bull с четырьмя фазами: ORBIT, LAYERS, 360°, INSIDE
3. **Racing** — История Oracle Red Bull Racing (2005–2026), статистика трассы Red Bull Ring
4. **The Machine** — 3D машина RB22 с телеметрией, режимами X-MODE/Z-MODE и характеристиками
5. **The Pilots** — Карточки пилотов: Макс Ферстаппен (4× чемпион) и Исак Хаджар
6. **Universe** — Энциклопедия Red Bull: футбол (RB Leipzig, NYRB), хоккей, мотоспорт, Air Race
7. **Scale** — Масштаб бренда: €12.2B оборот, 171+ стран, 21,924 сотрудника, 39 лет
8. **Manifesto** — Манифест "GIVES YOU WINGS" и подписка на newsletter

### 🎨 Визуальные эффекты

- **WebGL сцена** — Персистентный канвас с камерой, плавно перемещающейся между секциями
- **3D модели** — Банка Red Bull и болид RB22 в формате GLB
- **GPU частицы** — Шейдерная система частиц (~2000 на десктопе) с flow-field анимацией
- **Пост-обработка** — Bloom, виньетка и шум (десктоп только)
- **Курсорный след** — Жёлтое свечение, следующее за указателем
- **Preloader** — Анимация загрузки с счётчиком и 3D камерой

### 🔊 Аудио

- Синтезированный звук через Web Audio API (без внешних файлов)
- Амбиентный дрон, UI-тики, шумовые переходы
- Кнопка управления звуком в навбаре (клавиша `M`)

### ⚡ Интерактивность

- **Lenis** — Плавный скролл с кастомными lerp-множителями
- **GSAP ScrollTrigger** — Закрепление секций (340% и 330% скролла для банки и болида)
- **Клавиатурная навигация** — Стрелки, PageUp/PageDown, Home/End, `M` для звука
- **Дот-навигация** — Точки навигации по секциям
- **Прогресс-бар** — Индикатор скролла
- **Toast-уведомления** — Обратная связь при подписке на newsletter

### ♿ Доступность

- Skip-to-content ссылка
- ARIA-атрибуты и семантический HTML
- Поддержка `prefers-reduced-motion`
- Focus-visible кольца жёлтого цвета
- Поддержка safe area inset для устройств с notch
- Клавиатурная навигация по всем элементам

---

## 📁 Структура проекта

```
app/
├── layout.tsx              # Корневой лейаут, шрифты, метаданные
├── page.tsx                # Один экран — рендерит <Experience />
├── globals.css             # Tailwind v4 + кастомная тема + утилиты
├── api/newsletter/route.ts # API эндпоинт для подписки
└── ...

components/
├── rb/
│   ├── Experience.tsx      # Обёртка всего опыта
│   ├── Hero.tsx            # Герой-секция
│   ├── CanSection.tsx      # 3D банка Red Bull
│   ├── F1Section.tsx       # Болид RB22
│   ├── UniverseSection.tsx # Энциклопедия Red Bull
│   ├── NumbersBand.tsx     # Статистика бренда
│   ├── FooterSection.tsx   # Футер + newsletter
│   ├── Navbar.tsx          # Фиксированная навигация
│   ├── PageFX.tsx          # Курсорный след, кнопка "наверх"
│   ├── Preloader.tsx       # Экран загрузки
│   ├── SceneCanvas.tsx     # R3F Canvas + камера
│   ├── ScrollChrome.tsx    # Прогресс-бар + доты
│   ├── SmoothScroll.tsx    # Lenis интеграция
│   └── three/
│       ├── GlbCan.tsx      # 3D банка (GLB)
│       ├── F1Car.tsx       # 3D болид (GLB)
│       └── EnergyParticles.tsx # Шейдерные частицы
├── ui/                     # shadcn/ui компоненты (30+)
└── ...

lib/
├── utils.ts                # Утилита cn() (clsx + tailwind-merge)
└── rb/
    ├── data.ts             # Все данные (пилоты, статистика, flavours)
    ├── scene.ts            # Zustand стор + sceneState
    └── sound.ts            # Синтезатор WebAudio

public/
├── models/
│   ├── redbull.glb
│   └── 2026_red_bull_racing_rb22.glb
└── images/                 # Логотипы, фото, карточки
```

---

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Открыть http://localhost:3000
```

---

## 📦 Сборка

```bash
# Production сборка
npm run build

# Запуск продакшен-сервера
npm start
```

---

## 🎯 Скриншоты

Проект включает в себя:
- Кинематографичные переходы между секциями
- Интерактивные 3D-объекты, вращающиеся при скролле
- Адаптивный дизайн для десктопа и мобильных устройств
- Уникальная цветовая система в стиле Red Bull (жёлтый #001EFF, синий #001EFF, чёрный, белый)

---

## ⚠️ Дисклеймер

Это неофициальный проект-посвящение. Не связан с Red Bull GmbH.

---

## 🙏 Благодарности

- [Red Bull](https://www.redbull.com) — за вдохновение
- [Oracle Red Bull Racing](https://www.redbullracing.com) — за гоночную страсть
- [Three.js](https://threejs.org) — за 3D на вебе
- [GSAP](https://greensock.com/gsap/) — за мощные анимации
- [Next.js](https://nextjs.org) — за фреймворк

---

*Сделано с ❤️ и 🐂*
