"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// То же предложение, что в модуле 6 — для преемственности
const SENTENCE = ["кот", "сидит", "на", "окне"];

// 3 разные "головы" внимания — каждая улавливает свой тип связи.
// Каждая голова = матрица 4×4 (как в модуле 6).
type Head = {
  id: number;
  name: string;
  description: string;
  pattern: number[][];
  accent: string; // hex для иконки
};

const HEADS: Head[] = [
  {
    id: 0,
    name: "Синтаксис",
    description:
      "Эта голова улавливает грамматические связи: подлежащее↔сказуемое, предлог↔существительное. «Сидит» сильно смотрит на «кота» (подлежащее), «на» — на «окне» (предлог и его объект).",
    accent: "#10b981",
    pattern: [
      // кот →
      [0.20, 0.45, 0.10, 0.25],
      // сидит →
      [0.55, 0.15, 0.15, 0.15],
      // на →
      [0.05, 0.20, 0.15, 0.60],
      // окне →
      [0.20, 0.25, 0.40, 0.15],
    ],
  },
  {
    id: 1,
    name: "Кореференция",
    description:
      "Эта голова ищет, какие объекты связаны между собой по смыслу. «Кот» и «окне» сильно связаны (оба — участники сцены), «сидит» распределён равномерно (оно связывает всех).",
    accent: "#f59e0b",
    pattern: [
      // кот →
      [0.20, 0.20, 0.10, 0.50],
      // сидит →
      [0.30, 0.20, 0.10, 0.40],
      // на →
      [0.15, 0.25, 0.15, 0.45],
      // окне →
      [0.50, 0.25, 0.10, 0.15],
    ],
  },
  {
    id: 2,
    name: "Позиция",
    description:
      "Эта голова смотрит на соседние позиции — локальный контекст. Видно диагональ и соседние с ней клетки: каждый токен опирается на своих соседей слева/справа.",
    accent: "#ec4899",
    pattern: [
      // кот →
      [0.40, 0.45, 0.10, 0.05],
      // сидит →
      [0.35, 0.30, 0.30, 0.05],
      // на →
      [0.05, 0.35, 0.30, 0.30],
      // окне →
      [0.05, 0.10, 0.40, 0.45],
    ],
  },
];

function weightColor(w: number, accent: string): string {
  // w ∈ [0, 1], alpha-ramp от прозрачного к цвету
  // Используем простой серый→насыщенный цвет
  const alpha = Math.min(1, Math.max(0, w * 1.4));
  return `${accent}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
}

export function Module07MultiHead() {
  const accent = ACCENTS[7];
  const [headIdx, setHeadIdx] = useState(0);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const head = HEADS[headIdx];
  const activeRow = hoveredRow ?? 0;
  const activeCol = hoveredCol ?? 0;

  return (
    <ModuleShell
      id={7}
      title="Multi-head attention: много голов лучше"
      subtitle="Один self-attention улавливает один тип связей. Но язык многомерен: синтаксис, кореференция, позиция, эмоция… Поэтому в трансформере используют несколько параллельных «голов» — каждая со своими Q/K/V."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        увидеть, как разные головы внимания улавливают разные типы связей в одном предложении.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Если один self-attention «голова» смотрит только на один аспект
          связей в предложении, этого мало. В реальном языке одновременно
          работают десятки типов отношений: подлежащее↔сказуемое, прилагательное↔существительное,
          предлог↔объект, анафора (местоимение↔антецедент), пунктуация,
          семантическая близость, синтаксические деревья, и многое другое.
          Чтобы покрыть это всё, в трансформере используют <strong>multi-head
          attention</strong>:
        </p>
        <div className="rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 p-3 font-mono text-sm text-rose-900 dark:text-rose-100">
          MultiHead(Q, K, V) = Concat(head₁, …, headₕ) · W<sup>O</sup>
          <br />
          где headᵢ = Attention(Q · Wᵢ<sup>Q</sup>, K · Wᵢ<sup>K</sup>, V · Wᵢ<sup>V</sup>)
        </div>
        <p>
          То есть: есть <ConceptChip>h</ConceptChip> независимых наборов матриц
          W<sup>Q</sup>, W<sup>K</sup>, W<sup>V</sup> — каждый со своими
          весами. Каждая голова независимо считает свой self-attention. Затем
          результаты конкатенируются (склеиваются вдоль размерности) и
          умножаются на ещё одну обучаемую матрицу W<sup>O</sup> — чтобы
          вернуть к исходной размерности d_model.
        </p>
        <p>
          В оригинальном трансформере (Vaswani et al., 2017) было
          <strong> h = 8 голов</strong>, каждая с размерностью d_model / h = 64.
          В GPT-3 — 96 голов по 128 размерности каждая. В GPT-4 — предположительно
          120 голов. В Llama 2-70B — 64 головы. Больше голов — больше типов
          связей модель может уловить, но и больше вычислений (хотя суммарная
          размерность остаётся той же).
        </p>
        <p>
          Интересный факт: анализ обученных моделей показывает, что многие
          головы специализируются. В BERT нашлись головы, которые почти
          идеально предсказывают синтаксическое дерево; в GPT — головы,
          отвечающие за «предыдущее слово», «следующее слово», «определение
          термина» и т.п. Это emergent behavior — никто не говорил модели
          «стань синтаксическим парсером», она выучила это сама.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Три головы внимания — переключай и сравнивай">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Три головы для того же предложения «кот сидит на окне». Каждая
            улавливает свой тип связей. Переключай и сравнивай — обратите
            внимание, как по-разному распределяется внимание.
          </p>

          {/* Переключатель голов */}
          <div className="flex flex-wrap gap-2">
            {HEADS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHeadIdx(h.id)}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2",
                  headIdx === h.id
                    ? "border-rose-500 bg-rose-100 dark:bg-rose-900/50 shadow-sm"
                    : "border-rose-200 bg-card hover:border-rose-400 dark:border-rose-800/60"
                )}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: h.accent }}
                />
                <span className={cn(
                  "text-sm font-semibold",
                  headIdx === h.id ? "text-rose-700 dark:text-rose-300" : "text-foreground"
                )}>
                  Голова {h.id + 1}: {h.name}
                </span>
              </button>
            ))}
          </div>

          {/* Описание текущей головы */}
          <Card className="p-4 border-rose-200 dark:border-rose-800/60">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-block h-4 w-4 rounded-full"
                style={{ backgroundColor: head.accent }}
              />
              <span className="font-semibold">Голова {head.id + 1}: {head.name}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {head.description}
            </p>
          </Card>

          {/* Матрица внимания текущей головы */}
          <Card className="p-5 border-rose-200 dark:border-rose-800/60">
            {/* Заголовок столбцов */}
            <div className="flex items-center mb-1">
              <div className="w-24 shrink-0 text-xs text-muted-foreground text-right pr-3">
                query \\ key
              </div>
              <div className="flex-1 flex">
                {SENTENCE.map((word, col) => (
                  <div
                    key={col}
                    onMouseEnter={() => setHoveredCol(col)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className={cn(
                      "flex-1 text-center text-sm font-mono py-2 cursor-pointer transition-colors",
                      activeCol === col
                        ? "font-bold"
                        : "text-muted-foreground"
                    )}
                    style={activeCol === col ? { color: head.accent } : {}}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>

            {/* Строки */}
            {SENTENCE.map((word, row) => (
              <div key={row} className="flex items-center">
                <div
                  onMouseEnter={() => setHoveredRow(row)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    "w-24 shrink-0 text-right pr-3 text-sm font-mono py-2 cursor-pointer transition-colors",
                    activeRow === row ? "font-bold" : "text-muted-foreground"
                  )}
                  style={activeRow === row ? { color: head.accent } : {}}
                >
                  {word}
                </div>
                <div className="flex-1 flex gap-1">
                  {head.pattern[row].map((w, col) => {
                    const isActive = activeRow === row && activeCol === col;
                    return (
                      <div
                        key={col}
                        onMouseEnter={() => {
                          setHoveredRow(row);
                          setHoveredCol(col);
                        }}
                        onMouseLeave={() => {
                          setHoveredRow(null);
                          setHoveredCol(null);
                        }}
                        className={cn(
                          "flex-1 h-16 rounded-md border-2 flex items-center justify-center transition-all",
                          isActive
                            ? "border-foreground scale-105 shadow-md"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: weightColor(w, head.accent) }}
                      >
                        <span className="font-mono text-xs font-bold text-white drop-shadow">
                          {w.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between mt-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">0.0</span>
                <div
                  className="h-3 w-32 rounded"
                  style={{ background: `linear-gradient(to right, ${head.accent}00, ${head.accent}ff)` }}
                />
                <span className="text-muted-foreground">1.0</span>
              </div>
              <span className="text-muted-foreground font-mono">Σ по строке ≈ 1.0</span>
            </div>
          </Card>

          {/* Подсказки — что характерно для этой головы */}
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            {HEADS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHeadIdx(h.id)}
                className={cn(
                  "text-left rounded-md border p-3 transition-all",
                  headIdx === h.id
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 shadow-sm"
                    : "border-rose-200 dark:border-rose-800/60 hover:border-rose-400 bg-card"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: h.accent }}
                  />
                  <span className="font-semibold">Голова {h.id + 1}: {h.name}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {h.id === 0 && "Грамматика: «сидит»↔«кот» (глагол↔подлежащее)."}
                  {h.id === 1 && "Сцена: «кот»↔«окне» — главные участники сцены."}
                  {h.id === 2 && "Соседи: каждый опирается на ±1 слово."}
                </p>
              </button>
            ))}
          </div>
        </div>
      </SandboxBlock>

      <TheoryBlock accent={accent}>
        <p>
          Из песочницы видно главное: <strong>одни и те же токены, разные
          головы — разные картины внимания</strong>. Голова «Синтаксис»
          фокусируется на грамматических связях, «Кореференция» — на
          участниках сцены, «Позиция» — на локальном контексте. Все три
          картины верны одновременно — просто это разные аспекты одного
          предложения.
        </p>
        <p>
          В реальном трансформере все h голов считаются параллельно — это
          просто h независимых матричных умножений. Их результаты
          конкатенируются и смешиваются через W<sup>O</sup>. Итоговый
          эмбеддинг токена «окне» учитывает <strong>и</strong> то, что он
          связан с «котом» (сцена), <strong>и</strong> то, что он стоит после
          предлога «на» (синтаксис), <strong>и</strong> то, что он в конце
          предложения (позиция). Богатство представления растет
          экспоненциально с числом голов.
        </p>
        <p>
          Это последний «механический» модуль про attention. Теперь у нас
          есть всё: токены → эмбеддинги → позиция → multi-head attention.
          Следующий шаг — собрать это всё в <strong>языковую модель</strong>,
          которая предсказывает следующий токен. Этому посвящён модуль 8: GPT
          против BERT.
        </p>
      </TheoryBlock>
    </ModuleShell>
  );
}
