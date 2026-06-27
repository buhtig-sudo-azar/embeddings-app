# Эмбеддинги и attention — как токены становятся смыслом

Интерактивное приложение: разберитесь, что идёт после токенизации — как
токены превращаются в векторы (эмбеддинги), как измеряется их сходство,
как устроен attention-механизм трансформеров, и как из базовой языковой
модели получается ChatGPT через SFT и RLHF.
**10 модулей с живыми песочницами.**

> Это приложение — продолжение двух курсов: [«Токенизация»](https://tokenizatsiya-app.vercel.app/)
> и [«ML с нуля»](https://ml-s-nula.vercel.app/).

## Возможности

- **10 интерактивных модулей** с живыми песочницами на React + TypeScript
- **2D-карта эмбеддингов** — наведи на слово, увиди его вектор и кластер
- **Cosine similarity в действии** — выбери два слова, увиди угол и метрики
- **Скользящее окно word2vec** — анимация skip-gram и CBOW
- **Heatmap positional encoding** — синусы и косинусы из оригинальной статьи
- **Матрица self-attention** — наведи, увидишь, кто на кого смотрит
- **Multi-head attention** — переключай головы и сравнивай паттерны
- **GPT vs BERT** — next-token prediction vs masked-token prediction
- **Base / SFT / RLHF** — сравнение трёх стадий обучения на одном промпте
- **Прогресс сохраняется** локально в `localStorage`
- **Светлая/тёмная тема** с переключателем
- **Адаптивный дизайн** — мобильные и десктопы
- **Доступность**: keyboard-friendly, `aria-label`, `prefers-reduced-motion`

## Модули

1. После токенов — что? Пайплайн языковой модели
2. Эмбеддинги: токены становятся векторами
3. Cosine similarity: как измерить «похожесть» векторов
4. Word2vec: как обучаются эмбеддинги
5. Positional encoding: почему важен порядок
6. Self-attention: сердце трансформеров
7. Multi-head attention: много голов лучше
8. Языковые модели: GPT vs BERT
9. Fine-tuning и RLHF: как базовая LM становится ChatGPT
10. Что изучать дальше — roadmap

## Технологии

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui**
- **lucide-react** для иконок

## Локальный запуск

```bash
bun install
bun run dev     # http://localhost:3000
bun run lint    # проверка кода
```

## Структура проекта

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx            # Hero + 10 модулей
│   └── globals.css
├── components/
│   ├── learn/
│   │   ├── theme-toggle.tsx
│   │   ├── scroll-to-top.tsx
│   │   ├── shell.tsx       # Обёртка модуля
│   │   ├── accents.ts      # Цвета модулей
│   │   ├── module-01-intro.tsx … module-10-next.tsx
│   └── ui/                 # shadcn/ui
└── lib/
    ├── embeddings.ts       # учебный словарь 2D-эмбеддингов + cosine/dot/euclidean
    ├── use-progress.tsx
    ├── use-local-storage.ts
    └── utils.ts
```

## Создатель

**создатель AZAR**

## Лицензия

Свободно для обучения и некоммерческого использования.
