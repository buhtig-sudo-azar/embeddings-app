/**
 * Учебный словарь эмбеддингов для песочниц в модулях 2, 3 и 4.
 *
 * В реальных моделях эмбеддинги имеют размерность 256…12288 (GPT-4).
 * Здесь мы используем 2D, чтобы их можно было нарисовать на плоскости
 * и увидеть семантические кластеры глазами.
 *
 * Координаты подобраны так, чтобы четыре группы слов образовывали
 * визуально различимые кластеры:
 *   - животные (правый верх)
 *   - еда (левый верх)
 *   - эмоции (правый низ)
 *   - глаголы движения (левый низ)
 *
 * Внутри кластера похожие слова лежат рядом (кот ↔ собака),
 * между кластерами — далеко.
 */
export type WordVec = {
  word: string;
  /** Координаты в 2D — «обученный» эмбеддинг */
  x: number;
  y: number;
  /** Семантическая группа — для раскраски */
  group: "animal" | "food" | "emotion" | "motion";
  /** Русская подпись группы */
  groupLabel: string;
};

export const WORD_VECS: WordVec[] = [
  // Животные — правый верхний квадрант
  { word: "кот", x: 0.85, y: 0.78, group: "animal", groupLabel: "Животные" },
  { word: "собака", x: 0.78, y: 0.85, group: "animal", groupLabel: "Животные" },
  { word: "лошадь", x: 0.92, y: 0.65, group: "animal", groupLabel: "Животные" },
  { word: "корова", x: 0.70, y: 0.70, group: "animal", groupLabel: "Животные" },

  // Еда — левый верхний квадрант
  { word: "яблоко", x: -0.75, y: 0.80, group: "food", groupLabel: "Еда" },
  { word: "хлеб", x: -0.82, y: 0.68, group: "food", groupLabel: "Еда" },
  { word: "молоко", x: -0.65, y: 0.72, group: "food", groupLabel: "Еда" },
  { word: "мясо", x: -0.88, y: 0.55, group: "food", groupLabel: "Еда" },

  // Эмоции — правый нижний квадрант
  { word: "радость", x: 0.80, y: -0.75, group: "emotion", groupLabel: "Эмоции" },
  { word: "грусть", x: 0.70, y: -0.85, group: "emotion", groupLabel: "Эмоции" },
  { word: "страх", x: 0.88, y: -0.62, group: "emotion", groupLabel: "Эмоции" },

  // Глаголы движения — левый нижний квадрант
  { word: "бежать", x: -0.78, y: -0.72, group: "motion", groupLabel: "Движение" },
  { word: "прыгать", x: -0.70, y: -0.82, group: "motion", groupLabel: "Движение" },
  { word: "идти", x: -0.85, y: -0.60, group: "motion", groupLabel: "Движение" },
];

export const GROUP_COLORS: Record<WordVec["group"], { hex: string; tailwind: string; tailwindDark: string }> = {
  animal: { hex: "#10b981", tailwind: "bg-emerald-500", tailwindDark: "dark:bg-emerald-400" },
  food: { hex: "#f59e0b", tailwind: "bg-amber-500", tailwindDark: "dark:bg-amber-400" },
  emotion: { hex: "#ec4899", tailwind: "bg-pink-500", tailwindDark: "dark:bg-pink-400" },
  motion: { hex: "#06b6d4", tailwind: "bg-cyan-500", tailwindDark: "dark:bg-cyan-400" },
};

/**
 * Скалярное произведение двух векторов.
 * В 2D: a·b = a.x*b.x + a.y*b.y
 */
export function dot(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Длина (модуль) вектора.
 * |a| = sqrt(a.x² + a.y²)
 */
export function magnitude(a: { x: number; y: number }): number {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/**
 * Косинус угла между векторами — главная метрика сходства эмбеддингов.
 *
 *   cos(a, b) = (a · b) / (|a| · |b|)
 *
 * Возвращает значение от −1 (противоположные) до 1 (одинаковые).
 * 0 — ортогональные (не связаны).
 *
 * На практике для word2vec/GloVe значения лежат в [0.2, 0.9]:
 * 0.85+ — очень похожие, 0.5–0.7 — связанные, < 0.3 — разные.
 */
export function cosine(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const denom = magnitude(a) * magnitude(b);
  if (denom === 0) return 0;
  return dot(a, b) / denom;
}

/**
 * Евклидово расстояние — для сравнения с cosine.
 * Иногда используется, но в NLP реже: зависит от длины вектора,
 * которая у эмбеддингов не несёт смысла.
 */
export function euclidean(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Возвращает top-N ближайших соседей слова в словаре (исключая само слово).
 * Сортировка по убыванию cosine.
 */
export function nearestNeighbors(
  target: WordVec,
  vocab: WordVec[],
  n: number = 5
): Array<{ word: WordVec; score: number }> {
  return vocab
    .filter((w) => w.word !== target.word)
    .map((w) => ({ word: w, score: cosine(target, w) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
