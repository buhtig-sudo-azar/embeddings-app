"use client";

import { useState, useMemo } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const D_MODEL = 16; // размерность модели (в реальности 256-12288, здесь 16 для картинки)
const MAX_POS = 24; // сколько позиций показать

/**
 * Синусоидальное positional encoding из оригинальной статьи
 * "Attention Is All You Need" (Vaswani et al., 2017):
 *
 *   PE(pos, 2i)   = sin(pos / 10000^(2i / d_model))
 *   PE(pos, 2i+1) = cos(pos / 10000^(2i / d_model))
 *
 * где pos — позиция токена в последовательности,
 * i — индекс измерения (пары sin/cos), 0 ≤ i < d_model / 2.
 */
function pe(pos: number, dim: number, dModel: number): number {
  const pairIdx = Math.floor(dim / 2);
  const denom = Math.pow(10000, (2 * pairIdx) / dModel);
  if (dim % 2 === 0) {
    return Math.sin(pos / denom);
  } else {
    return Math.cos(pos / denom);
  }
}

/** Перевод значения [-1, 1] в цвет (от синего к красному через белый) */
function valueToColor(v: number): string {
  // v ∈ [-1, 1]
  const t = (v + 1) / 2; // [0, 1]
  // холодный → тёплый: 0 = синий (30, 80, 200), 0.5 = бледный, 1 = красный (200, 50, 60)
  if (t < 0.5) {
    const k = t * 2; // [0, 1]
    const r = Math.round(30 + (245 - 30) * k);
    const g = Math.round(80 + (240 - 80) * k);
    const b = Math.round(200 + (200 - 200) * k);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const k = (t - 0.5) * 2; // [0, 1]
    const r = Math.round(245 + (200 - 245) * k);
    const g = Math.round(240 + (60 - 240) * k);
    const b = Math.round(200 + (60 - 200) * k);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function Module05Positional() {
  const accent = ACCENTS[5];
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const [hoveredDim, setHoveredDim] = useState<number | null>(null);

  // Матрица PE: MAX_POS × D_MODEL
  const matrix = useMemo(() => {
    const rows: number[][] = [];
    for (let pos = 0; pos < MAX_POS; pos++) {
      const row: number[] = [];
      for (let dim = 0; dim < D_MODEL; dim++) {
        row.push(pe(pos, dim, D_MODEL));
      }
      rows.push(row);
    }
    return rows;
  }, []);

  // Текущий «профиль»: строка и столбец под наведением
  const profilePos = hoveredPos !== null ? matrix[hoveredPos] : matrix[0];
  const profileDim = hoveredDim !== null
    ? matrix.map((row) => row[hoveredDim])
    : matrix.map((row) => row[0]);

  return (
    <ModuleShell
      id={5}
      title="Positional encoding: почему важен порядок"
      subtitle="Трансформер обрабатывает все токены одновременно — для него «кот сидит на окне» и «окно сидит на коте» выглядят одинаково. Чтобы модель видела порядок, к эмбеддингу каждого токена добавляют вектор позиции."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, зачем трансформерам нужно явно кодировать позицию и как выглядит синусоидальное PE.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          RNN и LSTM обрабатывают токены последовательно — каждый новый
          токен видит результат предыдущего. Поэтому порядок «зашит» в
          архитектуру. Трансформер — <strong>другой</strong>: он скармливает
          модели всю последовательность разом и считает attention между всеми
          парами токенов одновременно. Это быстрее (параллелится на GPU), но
          появляется проблема: модель <strong>не видит порядок</strong>.
        </p>
        <p>
          Если не добавить информацию о позиции, то для трансформера фразы
          «кот сидит на окне» и «окно сидит на коте» — абсолютно
          неразличимы: тот же набор токенов, те же attention-связи. Это
          катастрофа для понимания языка. Решение: к эмбеддингу каждого
          токена прибавить <strong>вектор позиции</strong> —
          <code className="px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 font-mono text-xs"> input = token_emb + pos_emb</code>.
          Тогда одинаковые токены на разных позициях получают разные входы.
        </p>
        <p>
          В оригинальной статье «Attention Is All You Need» (Vaswani et al.,
          2017) использовали <strong>синусоидальное</strong> positional
          encoding:
        </p>
        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-3 font-mono text-sm text-amber-900 dark:text-amber-100">
          <div>PE(pos, 2i)   = sin(pos / 10000<sup>(2i / d_model)</sup>)</div>
          <div>PE(pos, 2i+1) = cos(pos / 10000<sup>(2i / d_model)</sup>)</div>
        </div>
        <p>
          Здесь <ConceptChip>pos</ConceptChip> — позиция токена (0, 1, 2, …),
          <ConceptChip>i</ConceptChip> — индекс измерения (0, 1, …, d_model/2 − 1),
          <ConceptChip>d_model</ConceptChip> — размерность эмбеддинга (в GPT-3 — 12 288).
          Каждая пара измерений (2i, 2i+1) образует синус/косинус одной
          частоты. Низкие индексы — высокая частота (быстро меняется с
          позицией), высокие — низкая (медленно).
        </p>
        <p>
          Почему именно синусы? Во-первых, PE ограничено в <ConceptChip>[−1, 1]</ConceptChip> —
          не ломает масштаб эмбеддингов. Во-вторых, для любой позиции
          <ConceptChip>pos + k</ConceptChip> её PE — линейная функция PE(pos)
          (через матрицу поворота). Это значит, что модель может научиться
          «сдвигать внимание на k слов» — относительные позиции работают.
          В-третьих, PE экстраполируется на длины, которых не было в обучении
          (важно для длинного контекста).
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Heatmap синусоидального PE: наведи на ячейку">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Это матрица positional encoding: по горизонтали — индексы
            измерений (0..15), по вертикали — позиции токенов (0..23). Каждая
            клетка — значение PE. Синие — отрицательные, красные —
            положительные. Наведи на любую клетку, чтобы увидеть значение и
            профиль строки/столбца.
          </p>

          <Card className="p-4 border-amber-200 dark:border-amber-800/60 overflow-x-auto">
            <div className="min-w-max">
              {/* Заголовок-размерности */}
              <div className="flex">
                <div className="w-14 shrink-0" />
                <div className="flex">
                  {Array.from({ length: D_MODEL }).map((_, dim) => (
                    <div
                      key={dim}
                      onMouseEnter={() => setHoveredDim(dim)}
                      onMouseLeave={() => setHoveredDim(null)}
                      className={cn(
                        "w-9 text-center text-[10px] font-mono py-1 cursor-pointer transition-colors",
                        hoveredDim === dim
                          ? "text-amber-700 dark:text-amber-300 font-bold"
                          : "text-muted-foreground"
                      )}
                    >
                      {dim}
                    </div>
                  ))}
                </div>
              </div>

              {/* Строки матрицы */}
              {matrix.map((row, pos) => (
                <div key={pos} className="flex items-center">
                  <div
                    onMouseEnter={() => setHoveredPos(pos)}
                    onMouseLeave={() => setHoveredPos(null)}
                    className={cn(
                      "w-14 shrink-0 text-right pr-2 text-[10px] font-mono py-1 cursor-pointer transition-colors",
                      hoveredPos === pos
                        ? "text-amber-700 dark:text-amber-300 font-bold"
                        : "text-muted-foreground"
                    )}
                  >
                    pos={pos}
                  </div>
                  <div className="flex">
                    {row.map((v, dim) => (
                      <div
                        key={dim}
                        onMouseEnter={() => {
                          setHoveredPos(pos);
                          setHoveredDim(dim);
                        }}
                        onMouseLeave={() => {
                          setHoveredPos(null);
                          setHoveredDim(null);
                        }}
                        className="w-9 h-9 border border-white/30 dark:border-black/30 cursor-pointer relative group"
                        style={{ backgroundColor: valueToColor(v) }}
                        title={`pos=${pos}, dim=${dim}: ${v.toFixed(3)}`}
                      >
                        {(hoveredPos === pos && hoveredDim === dim) && (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white drop-shadow">
                            {v.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Легенда */}
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="text-muted-foreground">−1</span>
            <div
              className="h-3 w-48 rounded"
              style={{ background: "linear-gradient(to right, rgb(30,80,200), rgb(245,240,200), rgb(200,60,60))" }}
            />
            <span className="text-muted-foreground">+1</span>
          </div>

          {/* Профили */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-4 border-amber-200 dark:border-amber-800/60">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-2">
                Профиль позиции {hoveredPos ?? 0} (строка)
              </div>
              <div className="flex items-end gap-0.5 h-24">
                {profilePos.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${((v + 1) / 2) * 100}%`,
                      backgroundColor: valueToColor(v),
                      minHeight: "2px",
                    }}
                    title={`dim=${i}: ${v.toFixed(3)}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Это вектор, который прибавляется к эмбеддингу токена на этой
                позиции. Разные позиции → разные векторы → модель различает
                «кот на окне» и «окно на коте».
              </p>
            </Card>

            <Card className="p-4 border-amber-200 dark:border-amber-800/60">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-2">
                Профиль измерения {hoveredDim ?? 0} (столбец)
              </div>
              <div className="flex items-end gap-0.5 h-24">
                {profileDim.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${((v + 1) / 2) * 100}%`,
                      backgroundColor: valueToColor(v),
                      minHeight: "2px",
                    }}
                    title={`pos=${i}: ${v.toFixed(3)}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Это волна определённой частоты. Низкие dim — быстрые волны
                (различают соседние позиции), высокие — медленные (различают
                далёкие).
              </p>
            </Card>
          </div>
        </div>
      </SandboxBlock>

      <TheoryBlock accent={accent}>
        <p>
          Если посмотреть на heatmap, видно характерную картину: левые
          столбцы (низкие dim) колеблются быстро — у них короткая длина
          волны, поэтому соседние позиции сильно различаются. Правые столбцы
          (высокие dim) — почти однообразные длинные волны; они различают
          далёкие позиции, но не соседние. Всё вместе даёт модели
          «отпечаток пальца» для каждой позиции — уникальный и при этом
          плавно меняющийся.
        </p>
        <p>
          В современных LLM используют и другие схемы positional encoding:
        </p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong>Learned PE</strong> — вместо формулы, матрица позиций
            выучивается во время training (как обычные веса). Использовалось
            в BERT и GPT-2. Просто, но не экстраполируется на длины больше
            обучающих.
          </li>
          <li>
            <strong>RoPE</strong> (Rotary Position Embedding, Su et al. 2021) —
            позиция «закручивается» прямо в Q и K через вращение в
            комплексной плоскости. Используется в Llama, Llama 2, Llama 3,
            Mistral. Хороший баланс между качеством и экстраполяцией.
          </li>
          <li>
            <strong>ALiBi</strong> (Press et al. 2021) — вместо явных PE,
            attention-логиты получают аддитивный bias, зависящий от
            расстояния между токенами. Используется в MPT, BLOOM. Хорошо
            экстраполируется на длинный контекст.
          </li>
        </ul>
        <p>
          Но все эти схемы решают одну и ту же задачу — сообщить модели,
          <strong>на какой позиции находится токен</strong>. Без этого
          трансформер был бы «мешком слов» — не лучше наивного Bayes-классификатора.
          С PE он начинает видеть структуру предложения — и теперь готов к
          следующему шагу: attention.
        </p>
      </TheoryBlock>
    </ModuleShell>
  );
}
