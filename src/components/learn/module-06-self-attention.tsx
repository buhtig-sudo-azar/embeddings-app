"use client";

import { useState, useMemo } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Учебное предложение (4 токена для квадратной матрицы 4×4)
const SENTENCE = ["кот", "сидит", "на", "окне"];

// Вручную подобранные attention-веса для каждой строки (query).
// Каждая строка — softmax-распределение (сумма = 1), показывающее,
// куда «смотрит» токен на этой позиции.
// Это упрощённая демонстрация — реальные веса вычисляются как softmax(QK^T / √d_k).
const ATTENTION: number[][] = [
  // кот → : на себя чуть, на "сидит" много (что делает), на "на" мало, на "окне" много (где)
  [0.15, 0.40, 0.05, 0.40],
  // сидит → : на "кто" (кот) сильно, на себя чуть, на "на" средне, на "окне" средне
  [0.50, 0.15, 0.20, 0.15],
  // на → : на "сидит" (что делает), на себя чуть, на "окне" (где) много
  [0.10, 0.35, 0.10, 0.45],
  // окне → : на "кот" (чей), на "сидит" (что делает), на "на" средне, на себя много
  [0.25, 0.30, 0.20, 0.25],
];

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((s, v) => s + v, 0);
  return exps.map((v) => v / sum);
}

/** Цвет attention-веса: от белого (0) к насыщенному оранжевому (1) */
function weightColor(w: number): string {
  // w ∈ [0, 1]
  const r = Math.round(255 - (255 - 234) * w);
  const g = Math.round(255 - (255 - 88) * w);
  const b = Math.round(255 - (255 - 12) * w);
  return `rgb(${r}, ${g}, ${b})`;
}

export function Module06SelfAttention() {
  const accent = ACCENTS[6];
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 3 });

  const activeRow = hoveredRow ?? selectedCell.row;
  const activeCol = hoveredCol ?? selectedCell.col;
  const activeWeight = ATTENTION[activeRow][activeCol];

  // Сумма весов по строке (должна быть 1 после softmax)
  const rowSum = ATTENTION[activeRow].reduce((s, v) => s + v, 0);

  return (
    <ModuleShell
      id={6}
      title="Self-attention: сердце трансформеров"
      subtitle="Self-attention — механизм, который смотрит на все токены сразу и для каждого решает, какие другие важны. Это и есть «понимание контекста»: «окно» рядом с «котом» — это окно в доме, а не окно браузера."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        увидеть, как self-attention строит матрицу «кто на кого смотрит» — и почему это даёт модели контекст.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Допустим, у нас есть эмбеддинги 4 токенов: <code className="px-1 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 font-mono text-xs">[кот, сидит, на, окне]</code>.
          Каждое слово в isolation имеет фиксированный смысл. Но в реальности
          смысл слова <strong>зависит от контекста</strong>: «окно» может быть
          оконным проёмом, программой, временной паузой, Opportunities. Чтобы
          модель выбрала правильное значение, нужно «посмотреть» на соседей.
          Это и делает self-attention.
        </p>
        <p>
          Для каждого токена создаются три новых вектора (через умножение
          эмбеддинга на три обучаемые матрицы):
        </p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong>Query (Q)</strong> — «что я ищу?». Для «окне» query может
            кодировать «ищу одушевлённое существо, которое на мне находится».
          </li>
          <li>
            <strong>Key (K)</strong> — «что я предлагаю?». Для «кота» key
            может кодировать «я — одушевлённое существо».
          </li>
          <li>
            <strong>Value (V)</strong> — «что я передаю, если на меня
            обратили внимание». Сама «суть» токена, которую он отдаёт в
            общий котёл.
          </li>
        </ul>
        <p>
          Дальше — простая формула:
        </p>
        <div className="rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 p-3 font-mono text-sm text-orange-900 dark:text-orange-100 text-center">
          Attention(Q, K, V) = softmax( Q · K<sup>T</sup> / √d<sub>k</sub> ) · V
        </div>
        <p>
          По шагам: скалярное произведение Q·K<sup>T</sup> даёт матрицу
          «совпадений» query↔key (кто кого ищет). Делим на √d<sub>k</sub> —
          это стабилизирует градиенты (без деления произведения растут с
          размерностью, и softmax насыщается). Softmax по строкам
          превращает «совпадения» в вероятности — сумма = 1. И, наконец,
          умножение на V даёт взвешенную сумму value-векторов: новый
          эмбеддинг токена, в который подмешано «понимание контекста».
        </p>
        <p>
          Результат: новый эмбеддинг «окне» теперь «знает» про «кота» и
          «сидит» — он перестал быть статичным словарным значением и стал
          контекстуализированным. И это происходит для всех токенов
          одновременно — отсюда и параллелизм трансформеров.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Матрица внимания: наведи, чтобы увидеть связь">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Это матрица self-attention для предложения «кот сидит на окне».
            Строки — <strong>кто смотрит</strong> (query), столбцы — <strong>на
            кого смотрит</strong> (key). Значение в клетке — weight (доля
            внимания). Сумма по строке = 1 (softmax). Наведи на клетку, чтобы
            увидеть связь.
          </p>

          <Card className="p-5 border-orange-200 dark:border-orange-800/60">
            {/* Заголовок столбцов — на кого смотрим */}
            <div className="flex items-center">
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
                        ? "text-orange-700 dark:text-orange-300 font-bold"
                        : "text-muted-foreground"
                    )}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>

            {/* Строки матрицы */}
            {SENTENCE.map((word, row) => (
              <div key={row} className="flex items-center">
                <div
                  onMouseEnter={() => setHoveredRow(row)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={cn(
                    "w-24 shrink-0 text-right pr-3 text-sm font-mono py-2 cursor-pointer transition-colors",
                    activeRow === row
                      ? "text-orange-700 dark:text-orange-300 font-bold"
                      : "text-muted-foreground"
                  )}
                >
                  {word}
                </div>
                <div className="flex-1 flex gap-1">
                  {ATTENTION[row].map((w, col) => {
                    const isActive = activeRow === row && activeCol === col;
                    const inActiveRow = activeRow === row;
                    const inActiveCol = activeCol === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onMouseEnter={() => {
                          setHoveredRow(row);
                          setHoveredCol(col);
                        }}
                        onMouseLeave={() => {
                          setHoveredRow(null);
                          setHoveredCol(null);
                        }}
                        onClick={() => setSelectedCell({ row, col })}
                        className={cn(
                          "flex-1 h-16 rounded-md border-2 flex flex-col items-center justify-center transition-all",
                          isActive
                            ? "border-orange-500 scale-105 shadow-md z-10"
                            : inActiveRow || inActiveCol
                              ? "border-orange-300 dark:border-orange-700/60"
                              : "border-transparent"
                        )}
                        style={{ backgroundColor: weightColor(w) }}
                      >
                        <span
                          className={cn(
                            "font-mono text-xs font-bold",
                            w > 0.3 ? "text-white" : "text-foreground"
                          )}
                        >
                          {w.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Легенда */}
            <div className="flex items-center justify-center gap-3 mt-4 text-xs">
              <span className="text-muted-foreground">0.0</span>
              <div
                className="h-3 w-40 rounded"
                style={{ background: "linear-gradient(to right, rgb(255,255,255), rgb(234,88,12))" }}
              />
              <span className="text-muted-foreground">1.0</span>
            </div>
          </Card>

          {/* Описание выбранной связи */}
          <Card className="p-4 border-orange-200 dark:border-orange-800/60 bg-orange-50/30 dark:bg-orange-950/20">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-sm font-mono">
                <span className="text-orange-700 dark:text-orange-300 font-bold">«{SENTENCE[activeRow]}»</span>
                <span className="text-muted-foreground mx-1.5">→</span>
                <span className="text-orange-700 dark:text-orange-300 font-bold">«{SENTENCE[activeCol]}»</span>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800/60 font-mono">
                weight: {activeWeight.toFixed(3)}
              </Badge>
              <Badge variant="outline" className="bg-card font-mono">
                в долях: {(activeWeight * 100).toFixed(1)}%
              </Badge>
              <Badge variant="outline" className="bg-card font-mono">
                Σ по строке: {rowSum.toFixed(3)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {activeWeight > 0.35 ? (
                <>
                  Сильная связь: токен <strong>«{SENTENCE[activeRow]}»</strong> уделяет много
                  внимания токену <strong>«{SENTENCE[activeCol]}»</strong> — при формировании
                  своего нового контекстуализированного эмбеддинга он опирается
                  на него.
                </>
              ) : activeWeight > 0.15 ? (
                <>
                  Средняя связь: <strong>«{SENTENCE[activeRow]}»</strong> частично
                  опирается на <strong>«{SENTENCE[activeCol]}»</strong>.
                </>
              ) : (
                <>
                  Слабая связь: <strong>«{SENTENCE[activeRow]}»</strong> почти
                  игнорирует <strong>«{SENTENCE[activeCol]}»</strong> в этом контексте.
                </>
              )}
            </p>
          </Card>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-md border border-orange-200 dark:border-orange-800/60 p-3 bg-orange-50/50 dark:bg-orange-950/30">
              <div className="font-semibold text-orange-700 dark:text-orange-300 mb-1">
                Почему «сидит» смотрит на «кота»?
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Глаголу нужно подлежащее. Query у «сидит» ищет одушевлённое
                существительное — key у «кота» подходит. Это и есть «понимание
                синтаксиса» через геометрию векторов.
              </p>
            </div>
            <div className="rounded-md border border-orange-200 dark:border-orange-800/60 p-3 bg-orange-50/50 dark:bg-orange-950/30">
              <div className="font-semibold text-orange-700 dark:text-orange-300 mb-1">
                Почему «кот» смотрит на «окне»?
              </div>
              <p className="text-muted-foreground leading-relaxed">
                «Кот» в этом контексте — «кот, который на окне». Новый
                эмбеддинг «кота» подмешивает value «окне» — модель «знает»,
                о каком коте речь.
              </p>
            </div>
          </div>
        </div>
      </SandboxBlock>

      <TheoryBlock accent={accent}>
        <p>
          Несколько тонкостей, которые важно понимать:
        </p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong>Веса — не данные, а выученные.</strong> В нашей песочнице
            они заданы вручную для наглядности. В реальной модели они
            вычисляются из Q и K, которые — результат умножения эмбеддингов
            на обучаемые матрицы. То есть модель <em>учится</em> «кому на кого
            смотреть» через gradient descent.
          </li>
          <li>
            <strong>Causal mask.</strong> В GPT (авторегрессионная модель)
            токены не могут смотреть «в будущее» — иначе модель видит ответ
            при обучении. Поэтому матрицу забивают −∞ выше диагонали, и после
            softmax там получается 0. Это называется causal masking.
          </li>
          <li>
            <strong>Сложность O(n²).</strong> Каждый токен смотрит на каждый —
            значит, матрица n×n. Для n=2048 это 4M ячеек, для n=128K (у
            GPT-4-Turbo) — 16 миллиардов. Это основное узкое место
            трансформеров на длинном контексте.
          </li>
          <li>
            <strong>Attention — это не вся история.</strong> В реальном
            трансформере self-attention — лишь один из подкомпонентов блока;
            есть ещё feedforward layer, residual connections, layer norm. Но
            именно attention даёт «понимание контекста».
          </li>
        </ul>
        <p>
          Один self-attention «голова» может уловить один тип связей —
          например, подлежащее↔сказуемое. Но в языке много разных типов
          связей одновременно (синтаксис, кореференция, смысл, позиция…).
          Поэтому используют <strong>multi-head attention</strong> — много
          параллельных self-attention, каждая со своими Q/K/V. Об этом —
          модуль 7.
        </p>
      </TheoryBlock>
    </ModuleShell>
  );
}
