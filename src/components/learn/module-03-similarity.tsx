"use client";

import { useState, useMemo } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WORD_VECS, GROUP_COLORS, cosine, dot, magnitude, euclidean, nearestNeighbors, type WordVec } from "@/lib/embeddings";
import { ArrowRight } from "lucide-react";

/**
 * SVG-размеры для визуализации пары векторов
 */
const SVG_SIZE = 360;
const ORIGIN = { x: SVG_SIZE / 2, y: SVG_SIZE / 2 };
const SCALE = 140; // 1 единица = 140 px

function vecToScreen(v: { x: number; y: number }) {
  return {
    x: ORIGIN.x + v.x * SCALE,
    y: ORIGIN.y - v.y * SCALE, // инверсия y
  };
}

function scoreColor(score: number): string {
  // score ∈ [-1, 1], красим от красного (−1) через серый (0) к зелёному (1)
  if (score >= 0.85) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 0.6) return "text-lime-600 dark:text-lime-400";
  if (score >= 0.3) return "text-amber-600 dark:text-amber-400";
  if (score >= 0) return "text-orange-600 dark:text-orange-400";
  return "text-rose-600 dark:text-rose-400";
}

function scoreLabel(score: number): string {
  if (score >= 0.85) return "очень похожи";
  if (score >= 0.6) return "похожи";
  if (score >= 0.3) return "слабо связаны";
  if (score >= 0) return "почти не связаны";
  return "противоположны";
}

export function Module03Similarity() {
  const accent = ACCENTS[3];
  const [a, setA] = useState<WordVec>(WORD_VECS[0]); // кот
  const [b, setB] = useState<WordVec>(WORD_VECS[1]); // собака

  const cos = useMemo(() => cosine(a, b), [a, b]);
  const dp = useMemo(() => dot(a, b), [a, b]);
  const magA = useMemo(() => magnitude(a), [a]);
  const magB = useMemo(() => magnitude(b), [b]);
  const euc = useMemo(() => euclidean(a, b), [a, b]);
  const neighbors = useMemo(() => nearestNeighbors(a, WORD_VECS, 5), [a]);

  const aScreen = vecToScreen(a);
  const bScreen = vecToScreen(b);

  return (
    <ModuleShell
      id={3}
      title="Cosine similarity: как измерить «похожесть» векторов"
      subtitle="Эмбеддинги — это векторы. Чтобы модель могла сказать «кот похож на собаку», нужно уметь измерять сходство двух векторов числом. Главный способ в NLP — косинус угла между ними."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        разобраться, почему cosine similarity — стандартная метрика сходства эмбеддингов, и увидеть её в действии.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          У нас есть два эмбеддинга — два вектора в N-мерном пространстве.
          Как численно ответить на вопрос «насколько они похожи»? Есть три
          классических способа, и у каждого свои недостатки:
        </p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong>Евклидово расстояние</strong> — <ConceptChip>|a − b| = √(Σ(aᵢ − bᵢ)²)</ConceptChip>.
            Привычная длина отрезка между точками. Но зависит от абсолютной
            длины векторов, а у эмбеддингов она не несёт смысла (зависит от
            инициализации и нормализации).
          </li>
          <li>
            <strong>Скалярное произведение</strong> — <ConceptChip>a · b = Σ aᵢ bᵢ</ConceptChip>.
            Не зависит от длины… ну почти: зависит от произведения длин. Если
            один вектор длинный, а другой короткий — скаляр будет большим
            даже для несвязанных слов.
          </li>
          <li>
            <strong>Cosine similarity</strong> — <ConceptChip>cos(a, b) = (a · b) / (|a| · |b|)</ConceptChip>.
            Это скалярное произведение, делённое на произведение длин. Результат —
            косинус угла между векторами, всегда в диапазоне <ConceptChip>[−1, 1]</ConceptChip>.
            1 = сонаправлены (очень похожи), 0 = ортогональны (не связаны), −1 = противонаправлены.
          </li>
        </ul>
        <p>
          В NLP почти всегда используют <strong>cosine</strong>, потому что
          он инвариантен к длине вектора: важно направление (т.е. «семантическая
          тема»), а не масштаб. Это позволяет сравнивать эмбеддинги из разных
          моделей, разных слоёв, разных эпох обучения.
        </p>
        <p>
          На практике для word2vec и GloVe значения cosine между связанными
          словами лежат в диапазоне <strong>0.5–0.85</strong>, между
          синонимами — <strong>0.85+</strong>, между случайными словами —
          около <strong>0.1–0.3</strong>, между антонимами иногда падает до
          нуля (редко отрицательный — для этого нужно, чтобы векторы были
          «противоположными», что в языковом пространстве почти не бывает).
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Сравни два слова: выбери из словаря">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Выбор слова A */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                Слово A
              </label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {WORD_VECS.map((w) => (
                  <button
                    key={w.word}
                    type="button"
                    onClick={() => setA(w)}
                    className={cn(
                      "px-2.5 py-1 rounded-md border text-xs font-mono transition-all",
                      a.word === w.word
                        ? "border-cyan-500 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200 font-bold"
                        : "border-cyan-200 bg-card hover:border-cyan-400 dark:border-cyan-800/60"
                    )}
                  >
                    {w.word}
                  </button>
                ))}
              </div>
            </div>

            {/* Выбор слова B */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                Слово B
              </label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {WORD_VECS.map((w) => (
                  <button
                    key={w.word}
                    type="button"
                    onClick={() => setB(w)}
                    className={cn(
                      "px-2.5 py-1 rounded-md border text-xs font-mono transition-all",
                      b.word === w.word
                        ? "border-cyan-500 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200 font-bold"
                        : "border-cyan-200 bg-card hover:border-cyan-400 dark:border-cyan-800/60"
                    )}
                  >
                    {w.word}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Визуализация двух векторов */}
          <div className="grid lg:grid-cols-[1fr_280px] gap-4">
            <Card className="p-3 border-cyan-200 dark:border-cyan-800/60">
              <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-auto" role="img" aria-label={`Векторы «${a.word}» и «${b.word}» из начала координат`}>
                {/* Оси */}
                <line x1={0} y1={ORIGIN.y} x2={SVG_SIZE} y2={ORIGIN.y} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />
                <line x1={ORIGIN.x} y1={0} x2={ORIGIN.x} y2={SVG_SIZE} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />

                {/* Угол между векторами */}
                <path
                  d={`M ${ORIGIN.x + 25} ${ORIGIN.y} A 25 25 0 0 ${cos >= 0 ? 0 : 1} ${ORIGIN.x + 25 * Math.cos(Math.acos(Math.max(-1, Math.min(1, cos))))} ${ORIGIN.y - 25 * Math.sin(Math.acos(Math.max(-1, Math.min(1, cos))))}`}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />

                {/* Вектор A */}
                <line
                  x1={ORIGIN.x}
                  y1={ORIGIN.y}
                  x2={aScreen.x}
                  y2={aScreen.y}
                  stroke={GROUP_COLORS[a.group].hex}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <circle cx={aScreen.x} cy={aScreen.y} r={6} fill={GROUP_COLORS[a.group].hex} stroke="white" strokeWidth={2} />
                <text x={aScreen.x + 10} y={aScreen.y + 4} fontSize={13} fontWeight={700} className="fill-foreground" fontFamily="ui-sans-serif, system-ui">
                  {a.word}
                </text>

                {/* Вектор B */}
                <line
                  x1={ORIGIN.x}
                  y1={ORIGIN.y}
                  x2={bScreen.x}
                  y2={bScreen.y}
                  stroke={GROUP_COLORS[b.group].hex}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <circle cx={bScreen.x} cy={bScreen.y} r={6} fill={GROUP_COLORS[b.group].hex} stroke="white" strokeWidth={2} />
                <text x={bScreen.x + 10} y={bScreen.y + 4} fontSize={13} fontWeight={700} className="fill-foreground" fontFamily="ui-sans-serif, system-ui">
                  {b.word}
                </text>

                {/* Начало координат */}
                <circle cx={ORIGIN.x} cy={ORIGIN.y} r={3} fill="currentColor" fillOpacity={0.5} />
              </svg>
            </Card>

            {/* Метрики */}
            <Card className="p-4 border-cyan-200 dark:border-cyan-800/60 h-fit space-y-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                  Cosine similarity
                </div>
                <div className={cn("text-3xl font-bold font-mono mt-1", scoreColor(cos))}>
                  {cos.toFixed(3)}
                </div>
                <div className={cn("text-xs font-medium mt-0.5", scoreColor(cos))}>
                  → {scoreLabel(cos)}
                </div>
              </div>

              <div className="border-t border-cyan-200/60 dark:border-cyan-800/40 pt-2 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">a · b</span>
                  <span>{dp.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">|a|</span>
                  <span>{magA.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">|b|</span>
                  <span>{magB.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">|a − b| (euclid)</span>
                  <span>{euc.toFixed(3)}</span>
                </div>
              </div>

              <div className="border-t border-cyan-200/60 dark:border-cyan-800/40 pt-2 text-xs leading-relaxed text-muted-foreground">
                Cosine — это <code className="px-1 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 font-mono text-cyan-700 dark:text-cyan-300">(a · b) / (|a| · |b|)</code>.
                Знаменатель убирает влияние длины — остаётся только угол.
              </div>
            </Card>
          </div>

          {/* Top-5 ближайших соседей слова A */}
          <Card className="p-4 border-cyan-200 dark:border-cyan-800/60">
            <div className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300 mb-2">
              Топ-5 ближайших соседей слова «{a.word}» (по cosine)
            </div>
            <div className="space-y-1.5">
              {neighbors.map((n, i) => (
                <div key={n.word.word} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground w-5">#{i + 1}</span>
                  <span className="font-medium w-20">{n.word.word}</span>
                  <div className="flex-1 h-2 rounded-full bg-cyan-50 dark:bg-cyan-950/40 overflow-hidden border border-cyan-200 dark:border-cyan-800/60">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                      style={{ width: `${Math.max(0, n.score) * 100}%` }}
                    />
                  </div>
                  <span className={cn("font-mono text-xs w-14 text-right", scoreColor(n.score))}>
                    {n.score.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Заметь: соседи «кота» — все животные. Это и есть работа эмбеддингов —
              группировать по смыслу.
            </p>
          </Card>
        </div>
      </SandboxBlock>

      <TheoryBlock accent={accent}>
        <p>
          Из песочницы видно главное: <strong>cosine similarity автоматически
          находит «родственников» слова</strong>. У «кота» в топе — собака,
          лошадь, корова (все животные). У «бежать» — прыгать, идти (все
          движения). У «радости» — грусть (да, именно: эмоционально заряженные
          слова, даже если полярность разная — у них похожий контекст: «я
          чувствую …», «он испытывает …»).
        </p>
        <p>
          Это свойство — <strong>семантическая близость через геометрию</strong> —
          и делает эмбеддинги основой современного NLP. Поиск по смыслу,
          рекомендации, классификация текстов, обнаружение дубликатов — всё
          это работает на cosine similarity между эмбеддингами. Даже
          векторная арифметика знаменитого <code className="px-1 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 font-mono">king − man + woman ≈ queen</code> —
          это тоже про неё.
        </p>
        <p>
          Следующий вопрос: <strong>откуда эти векторы берутся?</strong> Кто
          их вычисляет? Ответ — модель учится им в процессе обучения. Самый
          известный способ — word2vec, который мы разберём в модуле 4.
        </p>
      </TheoryBlock>
    </ModuleShell>
  );
}
