"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WORD_VECS, GROUP_COLORS, type WordVec } from "@/lib/embeddings";

/**
 * SVG-размеры для scatter plot.
 * Координаты слов лежат в диапазоне примерно [-1, 1] по обеим осям.
 */
const SVG_SIZE = 420;
const PADDING = 40;
const PLOT_SIZE = SVG_SIZE - PADDING * 2;

/** Конвертация координат вектора в экранные координаты SVG */
function toScreen(v: { x: number; y: number }): { sx: number; sy: number } {
  // x: [-1, 1] → [PADDING, PADDING + PLOT_SIZE]
  // y: [-1, 1] → [PADDING + PLOT_SIZE, PADDING] (инвертируем, т.к. SVG y растёт вниз)
  const sx = PADDING + ((v.x + 1) / 2) * PLOT_SIZE;
  const sy = PADDING + ((1 - v.y) / 2) * PLOT_SIZE;
  return { sx, sy };
}

export function Module02Embeddings() {
  const accent = ACCENTS[2];
  const [hovered, setHovered] = useState<WordVec | null>(null);
  const [selected, setSelected] = useState<WordVec>(WORD_VECS[0]);

  const activeWord = hovered ?? selected;

  return (
    <ModuleShell
      id={2}
      title="Эмбеддинги: токены становятся векторами"
      subtitle="После токенизации каждый ID превращается в вектор из N чисел. Это и есть эмбеддинг. Похожие по смыслу слова получают похожие векторы — и это закладывает основу для «понимания» языка."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        увидеть своими глазами, как эмбеддинги раскладывают слова по семантическим кластерам.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Самый наивный способ превратить ID в вектор — <strong>one-hot
          encoding</strong>. Если в словаре 50 000 токенов, то токен с ID 847
          превращается в вектор из 50 000 чисел, где 847-я позиция = 1, а все
          остальные = 0. Это работает, но у такого подхода две проблемы:
          размер (50K чисел на
          токен — это много) и отсутствие сходства (любые два one-hot вектора
          ортогональны, косинус = 0 — модель не видит, что «кот» и «собака»
          похожи).
        </p>
        <p>
          <strong>Эмбеддинг</strong> — это <em>плотный</em> вектор небольшой
          размерности (в GPT-3 — 12 288, в BERT-base — 768, в word2vec — 100–300).
          Каждое число в нём — некий «скрытый признак», выученный моделью по
          корпусу. Эти признаки не интерпретируемы напрямую (никто не знает,
          что означает 47-я координата), но <strong>в совокупности</strong> они
          кодируют смысл. Например, может оказаться, что одно измерение
          приблизительно отвечает за «одушевлённость», другое — за
          «пищевую пригодность», третье — за «эмоциональную окраску».
        </p>
        <p>
          Самое важное свойство эмбеддингов: <strong>похожие по смыслу токены
          лежат рядом</strong> в векторном пространстве. «Кот» и «собака»
          окажутся близко (оба — животные), «кот» и «яблоко» — далеко. Это
          свойство позволяет моделям обобщать: встретив «щенка» в обучении,
          модель «знает», что это похоже на «собаку» и «кота», даже если слово
          новое. Без эмбеддингов языковые модели были бы невозможны.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="2D-карта эмбеддингов: наведи на слово">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Это упрощённая карта 14 русских слов в 2D-пространстве. В
            реальности размерность — сотни или тысячи, но 2D достаточно, чтобы
            увидеть главное: слова разбиваются на <strong>кластеры по
            смыслу</strong>. Наведи курсор (или нажми) на точку, чтобы
            увидеть её эмбеддинг и группу.
          </p>

          <div className="grid lg:grid-cols-[1fr_280px] gap-4">
            {/* SVG-карта */}
            <Card className="p-3 border-teal-200 dark:border-teal-800/60">
              <svg
                viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                className="w-full h-auto"
                role="img"
                aria-label="2D scatter plot эмбеддингов 14 слов"
              >
                {/* Оси */}
                <line
                  x1={PADDING}
                  y1={SVG_SIZE / 2}
                  x2={SVG_SIZE - PADDING}
                  y2={SVG_SIZE / 2}
                  stroke="currentColor"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                />
                <line
                  x1={SVG_SIZE / 2}
                  y1={PADDING}
                  x2={SVG_SIZE / 2}
                  y2={SVG_SIZE - PADDING}
                  stroke="currentColor"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                />
                {/* Подписи осей */}
                <text x={SVG_SIZE - PADDING} y={SVG_SIZE / 2 - 6} textAnchor="end" className="fill-muted-foreground" fontSize={10} fontFamily="ui-monospace, monospace">
                  +x
                </text>
                <text x={SVG_SIZE / 2 + 6} y={PADDING + 4} className="fill-muted-foreground" fontSize={10} fontFamily="ui-monospace, monospace">
                  +y
                </text>

                {/* Сетка кластеров — полупрозрачные круги для визуальной группировки */}
                {(["animal", "food", "emotion", "motion"] as const).map((g) => {
                  const items = WORD_VECS.filter((w) => w.group === g);
                  if (items.length === 0) return null;
                  const cx = items.reduce((s, w) => s + w.x, 0) / items.length;
                  const cy = items.reduce((s, w) => s + w.y, 0) / items.length;
                  const c = toScreen({ x: cx, y: cy });
                  return (
                    <circle
                      key={g}
                      cx={c.sx}
                      cy={c.sy}
                      r={75}
                      fill={GROUP_COLORS[g].hex}
                      fillOpacity={0.06}
                      stroke={GROUP_COLORS[g].hex}
                      strokeOpacity={0.2}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {/* Точки слов */}
                {WORD_VECS.map((w) => {
                  const { sx, sy } = toScreen(w);
                  const isActive = activeWord?.word === w.word;
                  const color = GROUP_COLORS[w.group].hex;
                  return (
                    <g key={w.word}>
                      <circle
                        cx={sx}
                        cy={sy}
                        r={isActive ? 9 : 6}
                        fill={color}
                        fillOpacity={isActive ? 1 : 0.75}
                        stroke="white"
                        strokeWidth={isActive ? 2.5 : 1.5}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHovered(w)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setSelected(w)}
                      >
                        <title>{w.word}</title>
                      </circle>
                      <text
                        x={sx + 10}
                        y={sy + 4}
                        fontSize={11}
                        fontWeight={isActive ? 700 : 500}
                        className={cn(
                          "cursor-pointer transition-all fill-foreground",
                          isActive && "font-bold"
                        )}
                        fontFamily="ui-sans-serif, system-ui"
                        onMouseEnter={() => setHovered(w)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setSelected(w)}
                      >
                        {w.word}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </Card>

            {/* Боковая панель: детали выбранного слова */}
            <Card className="p-4 border-teal-200 dark:border-teal-800/60 h-fit">
              <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300 mb-2">
                Выбранное слово
              </div>
              <div className="text-2xl font-bold mb-1">{activeWord.word}</div>
              <div className="flex items-center gap-1.5 mb-3">
                <span
                  className={cn("inline-block h-3 w-3 rounded-full", GROUP_COLORS[activeWord.group].tailwind)}
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {activeWord.groupLabel}
                </span>
              </div>

              <div className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300 mb-1.5">
                Эмбеддинг (2D)
              </div>
              <div className="font-mono text-sm rounded-md bg-card border border-teal-200 dark:border-teal-800/60 p-2 mb-3">
                <span className="text-muted-foreground">[</span>
                <span className="text-foreground">{activeWord.x.toFixed(3)}</span>
                <span className="text-muted-foreground">, </span>
                <span className="text-foreground">{activeWord.y.toFixed(3)}</span>
                <span className="text-muted-foreground">]</span>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                В реальной модели здесь было бы 768 (BERT) или 12 288 (GPT-3)
                чисел. Мы показали 2 — чтобы можно было нарисовать. Но логика
                та же: координаты задают положение слова в смысловом
                пространстве.
              </div>
            </Card>
          </div>

          {/* Легенда групп */}
          <div className="flex flex-wrap gap-3 justify-center">
            {(["animal", "food", "emotion", "motion"] as const).map((g) => (
              <div key={g} className="flex items-center gap-1.5 text-xs">
                <span className={cn("inline-block h-3 w-3 rounded-full", GROUP_COLORS[g].tailwind)} />
                <span className="text-muted-foreground font-mono">
                  {WORD_VECS.find((w) => w.group === g)?.groupLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SandboxBlock>

      <TheoryBlock accent={accent}>
        <p>
          Несколько важных наблюдений из песочницы:
        </p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong>Кластеры = смысл.</strong> Слова сгруппированы не по
            алфавиту, не по длине, а по теме. Это и есть «понимание» на уровне
            эмбеддингов.
          </li>
          <li>
            <strong>Расстояние = сходство.</strong> «Кот» и «собака» близко
            (оба — домашние животные), «кот» и «лошадь» — чуть дальше (оба
            животные, но разные по роли), «кот» и «яблоко» — очень далеко.
          </li>
          <li>
            <strong>Размерность.</strong> Здесь 2D — для картинки. В
            реальности 768 (BERT-base), 1024 (BERT-large, GPT-2 small), 4096
            (Llama 2), 12 288 (GPT-3). Больше размерность — больше нюансов
            смысла можно закодировать.
          </li>
          <li>
            <strong>Эмбеддинги обучаются.</strong> Это не придуманные
            координаты — их вычисляет модель в процессе обучения. Как именно —
            тема модуля 4 (word2vec).
          </li>
        </ul>
        <p>
          В следующем модуле мы разберём, <strong>как численно измерить</strong>
          сходство двух эмбеддингов — то есть как модель решает, что «кот» и
          «собака» похожи, а «кот» и «яблоко» — нет.Spoiler: это называется
          cosine similarity.
        </p>
      </TheoryBlock>
    </ModuleShell>
  );
}
