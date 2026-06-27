import type { Accent } from "@/components/learn/shell";

/**
 * Палитра акцентов для 10 модулей об эмбеддингах и attention.
 *
 * Избегаем blue/indigo и фиолетового (фирменного цвета tokenizatsiya-app,
 * чтобы визуально не путаться). Палитра построена вокруг холодных
 * зелёно-бирюзовых и тёплых янтарно-розовых тонов — чтобы каждый
 * модуль имел свой узнаваемый цвет, но все вместе они отличали
 * «эмбеддинги-приложение» от материнского tokenizatsiya (там пурпур)
 * и от ml-s-nula (там бирюза).
 */
export const ACCENTS: Record<number, Accent> = {
  1: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
    bgSoft: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800/60",
    ring: "ring-emerald-300 dark:ring-emerald-700",
    chip: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800/60",
  },
  2: {
    text: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-200",
    bgSoft: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800/60",
    ring: "ring-teal-300 dark:ring-teal-700",
    chip: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/50 dark:text-teal-200 dark:border-teal-800/60",
  },
  3: {
    text: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-200",
    bgSoft: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-200 dark:border-cyan-800/60",
    ring: "ring-cyan-300 dark:ring-cyan-700",
    chip: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-200 dark:border-cyan-800/60",
  },
  4: {
    text: "text-lime-700 dark:text-lime-300",
    bg: "bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-200",
    bgSoft: "bg-lime-50 dark:bg-lime-950/40",
    border: "border-lime-200 dark:border-lime-800/60",
    ring: "ring-lime-300 dark:ring-lime-700",
    chip: "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/50 dark:text-lime-200 dark:border-lime-800/60",
  },
  5: {
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
    bgSoft: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800/60",
    ring: "ring-amber-300 dark:ring-amber-700",
    chip: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-800/60",
  },
  6: {
    text: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200",
    bgSoft: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-800/60",
    ring: "ring-orange-300 dark:ring-orange-700",
    chip: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800/60",
  },
  7: {
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200",
    bgSoft: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800/60",
    ring: "ring-rose-300 dark:ring-rose-700",
    chip: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-200 dark:border-rose-800/60",
  },
  8: {
    text: "text-pink-700 dark:text-pink-300",
    bg: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-200",
    bgSoft: "bg-pink-50 dark:bg-pink-950/40",
    border: "border-pink-200 dark:border-pink-800/60",
    ring: "ring-pink-300 dark:ring-pink-700",
    chip: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-800/60",
  },
  9: {
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    bg: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-200",
    bgSoft: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    border: "border-fuchsia-200 dark:border-fuchsia-800/60",
    ring: "ring-fuchsia-300 dark:ring-fuchsia-700",
    chip: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/50 dark:text-fuchsia-200 dark:border-fuchsia-800/60",
  },
  10: {
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200",
    bgSoft: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800/60",
    ring: "ring-red-300 dark:ring-red-700",
    chip: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800/60",
  },
};

export const MODULE_META: Array<{
  id: number;
  short: string;
  title: string;
}> = [
  { id: 1, short: "Введение", title: "После токенов — что?" },
  { id: 2, short: "Эмбеддинги", title: "Токены становятся векторами" },
  { id: 3, short: "Сходство", title: "Cosine similarity" },
  { id: 4, short: "Word2vec", title: "Как обучаются эмбеддинги" },
  { id: 5, short: "Позиция", title: "Positional encoding" },
  { id: 6, short: "Self-attention", title: "Сердце трансформеров" },
  { id: 7, short: "Multi-head", title: "Многоголовое внимание" },
  { id: 8, short: "Языковые модели", title: "GPT и BERT" },
  { id: 9, short: "Fine-tuning", title: "SFT, RLHF, instruction tuning" },
  { id: 10, short: "Дальше", title: "Что изучать дальше" },
];
