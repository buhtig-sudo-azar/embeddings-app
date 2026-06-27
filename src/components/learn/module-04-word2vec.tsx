"use client";

import { useState, useEffect, useRef } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";

// Учебное предложение для демонстрации скользящего окна
const SENTENCE = ["кот", "сидит", "на", "тёплом", "окне", "и", "спит"];

const WINDOW_SIZE = 2; // радиус контекста — 2 слова в каждую сторону

type Mode = "skipgram" | "cbow";

export function Module04Word2vec() {
  const accent = ACCENTS[4];
  const [mode, setMode] = useState<Mode>("skipgram");
  const [centerIdx, setCenterIdx] = useState(2); // начинаем с "на"
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Автоматическое воспроизведение: сдвигаем centerIdx каждые 1.5 секунды
  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(() => {
      setCenterIdx((prev) => (prev + 1) % SENTENCE.length);
    }, 1500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, centerIdx]);

  function step(delta: number) {
    setPlaying(false);
    setCenterIdx((prev) => (prev + delta + SENTENCE.length) % SENTENCE.length);
  }

  function reset() {
    setPlaying(false);
    setCenterIdx(2);
  }

  // Контекстные слова для текущего центра
  const contextWords = SENTENCE.filter((_, i) => {
    if (i === centerIdx) return false;
    return Math.abs(i - centerIdx) <= WINDOW_SIZE;
  });

  // Пары (центр → контекст) для skip-gram
  const skipgramPairs: Array<{ center: string; context: string; centerIdx: number; contextIdx: number }> = [];
  for (let i = Math.max(0, centerIdx - WINDOW_SIZE); i <= Math.min(SENTENCE.length - 1, centerIdx + WINDOW_SIZE); i++) {
    if (i !== centerIdx) {
      skipgramPairs.push({
        center: SENTENCE[centerIdx],
        context: SENTENCE[i],
        centerIdx,
        contextIdx: i,
      });
    }
  }

  return (
    <ModuleShell
      id={4}
      title="Word2vec: как обучаются эмбеддинги"
      subtitle="Вектор «кота» не придуман людьми — его вычисляет модель. Самый известный способ — word2vec (Mikolov, 2013). Идея проста: «похожие слова встречаются в похожем контексте». Реализация — скользящее окно по корпусу."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, как из корпуса текстов модель сама выучивает векторы слов — без учителя.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          В 2013 году Tomas Mikolov с коллегами из Google опубликовал статью
          «Efficient Estimation of Word Representations in Vector Space» —
          это и есть <strong>word2vec</strong>. Идея опирается на лингвистическое
          наблюдение 1957 года (J.R. Firth): <em>«вы узнаёте слово по его
          компании»</em>. То есть слова, встречающиеся в похожих контекстах,
          имеют похожий смысл — а значит, должны иметь похожие векторы.
        </p>
        <p>
          Word2vec предлагает две архитектуры, обе на основе скользящего окна
          по тексту:
        </p>
        <ol className="list-decimal list-inside space-y-1.5">
          <li>
            <strong>CBOW</strong> (Continuous Bag-of-Words). По контексту
            (нескольким окружающим словам) предсказывается центральное слово.
            Например: <code className="px-1 py-0.5 rounded bg-lime-50 dark:bg-lime-950/40 font-mono">[кот, сидит, ___, тёплом, окне] → "на"</code>.
            Быстрее обучается, лучше работает на частых словах.
          </li>
          <li>
            <strong>Skip-gram</strong>. Наоборот: по центральному слову
            предсказывается контекст. <code className="px-1 py-0.5 rounded bg-lime-50 dark:bg-lime-950/40 font-mono">"на" → "кот", "сидит", "тёплом", "окне"</code>.
            Медленнее, но лучше работает на редких словах и небольших корпусах.
            Именно skip-gram использовали в оригинальной статье.
          </li>
        </ol>
        <p>
          Обе архитектуры — это маленькие нейросети (один скрытый слой без
          нелинейности). Входной слой — one-hot вектор слова, скрытый слой —
          матрица размером <ConceptChip>V × D</ConceptChip> (V — размер словаря,
          D — размерность эмбеддинга, обычно 100–300), выходной — снова softmax
          над словарём. После обучения веса скрытого слоя <strong>и есть
          эмбеддинги</strong>: строка матрицы для слова «кот» — это его вектор.
        </p>
        <p>
          Ключевой трюк: модель учится предсказывать контекст, но <strong>побочным
          продуктом</strong> оказывается матрица эмбеддингов, в которой похожие
          слова получают похожие строки — потому что для правильного
          предсказания контекста «кот» и «собака» должны вести себя одинаково
          (оба встречаются рядом с «лежит», «спит», «миска», «корм»). Это и
          называется <strong>обучением без учителя</strong> — никаких меток не
          нужно, только сырой текст.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Скользящее окно word2vec в действии">
        <div className="space-y-4">
          {/* Переключатель режима */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-lime-700 dark:text-lime-300">
              Архитектура:
            </span>
            <Button
              size="sm"
              variant={mode === "skipgram" ? "default" : "outline"}
              onClick={() => setMode("skipgram")}
              className={mode === "skipgram" ? "bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-600" : ""}
            >
              Skip-gram
            </Button>
            <Button
              size="sm"
              variant={mode === "cbow" ? "default" : "outline"}
              onClick={() => setMode("cbow")}
              className={mode === "cbow" ? "bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-600" : ""}
            >
              CBOW
            </Button>
            <span className="text-xs text-muted-foreground ml-2">
              окно = ±{WINDOW_SIZE} слова
            </span>
          </div>

          {/* Контролы */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => step(-1)}>
              <SkipBack className="h-3.5 w-3.5 mr-1" />
              Назад
            </Button>
            <Button
              size="sm"
              onClick={() => setPlaying((p) => !p)}
              className="bg-lime-600 hover:bg-lime-700 dark:bg-lime-700 dark:hover:bg-lime-600"
            >
              {playing ? (
                <>
                  <Pause className="h-3.5 w-3.5 mr-1" />
                  Пауза
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Пуск
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={() => step(1)}>
              <SkipForward className="h-3.5 w-3.5 mr-1" />
              Вперёд
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Сброс
            </Button>
            <span className="text-xs text-muted-foreground ml-auto font-mono">
              позиция {centerIdx + 1} / {SENTENCE.length}
            </span>
          </div>

          {/* Визуализация окна */}
          <Card className="p-5 border-lime-200 dark:border-lime-800/60 overflow-x-auto">
            <div className="flex items-center gap-1.5 min-w-max justify-center py-2">
              {SENTENCE.map((word, i) => {
                const isCenter = i === centerIdx;
                const isInContext = !isCenter && Math.abs(i - centerIdx) <= WINDOW_SIZE;
                const isOutside = !isCenter && !isInContext;
                return (
                  <div key={i} className="flex items-center">
                    <div
                      className={cn(
                        "px-3 py-2.5 rounded-lg border-2 font-mono text-sm transition-all duration-300",
                        isCenter && "border-lime-500 bg-lime-200 dark:bg-lime-800/60 font-bold text-lime-900 dark:text-lime-100 scale-110 shadow-md",
                        isInContext && "border-lime-300 bg-lime-50 dark:bg-lime-950/40 dark:border-lime-700/60 text-lime-700 dark:text-lime-300",
                        isOutside && "border-border bg-card text-muted-foreground opacity-50"
                      )}
                    >
                      {word}
                    </div>
                    {i < SENTENCE.length - 1 && <div className="w-2" />}
                  </div>
                );
              })}
            </div>

            {/* Легенда */}
            <div className="flex flex-wrap gap-3 justify-center mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded border-2 border-lime-500 bg-lime-200 dark:bg-lime-800/60" />
                <span className="text-muted-foreground">центральное слово</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded border-2 border-lime-300 bg-lime-50 dark:bg-lime-950/40" />
                <span className="text-muted-foreground">контекст (в окне)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded border-2 border-border bg-card opacity-50" />
                <span className="text-muted-foreground">вне окна</span>
              </div>
            </div>
          </Card>

          {/* Что модель учится предсказывать в этом шаге */}
          <Card className="p-4 border-lime-200 dark:border-lime-800/60 bg-lime-50/30 dark:bg-lime-950/20">
            <div className="text-xs font-semibold uppercase tracking-wide text-lime-700 dark:text-lime-300 mb-2">
              Шаг обучения {mode === "skipgram" ? "(skip-gram: центр → контекст)" : "(CBOW: контекст → центр)"}
            </div>

            {mode === "skipgram" ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Модель видит центральное слово <strong className="text-lime-700 dark:text-lime-300">«{SENTENCE[centerIdx]}»</strong> и
                  должна предсказать каждое слово из контекста. Для каждой пары
                  обновляются векторы так, чтобы <code className="px-1 py-0.5 rounded bg-lime-100 dark:bg-lime-900/50 font-mono text-xs">P(контекст | центр)</code> росла.
                </p>
                <div className="space-y-1.5">
                  {skipgramPairs.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-mono">
                      <span className="px-2 py-1 rounded border border-lime-500 bg-lime-200 dark:bg-lime-800/60 dark:text-lime-200 font-bold">
                        {p.center}
                      </span>
                      <span className="text-muted-foreground">→ предсказать →</span>
                      <span className="px-2 py-1 rounded border border-lime-300 bg-lime-50 dark:bg-lime-950/40 dark:text-lime-300">
                        {p.context}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Модель видит контекст <strong className="text-lime-700 dark:text-lime-300">[{contextWords.join(", ")}]</strong> и
                  должна предсказать центральное слово <strong className="text-lime-700 dark:text-lime-300">«{SENTENCE[centerIdx]}»</strong>.
                  Все слова контекста усредняются (bag-of-words) и подаются на вход.
                </p>
                <div className="flex items-center gap-2 text-sm font-mono flex-wrap">
                  <span className="text-muted-foreground">вход:</span>
                  <span className="px-2 py-1 rounded border border-lime-300 bg-lime-50 dark:bg-lime-950/40 dark:text-lime-300">
                    [{contextWords.join(" + ")}]
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="px-2 py-1 rounded border border-lime-500 bg-lime-200 dark:bg-lime-800/60 dark:text-lime-200 font-bold">
                    {SENTENCE[centerIdx]}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <p className="text-xs text-muted-foreground leading-relaxed">
            На реальном корпусе (например, Википедия — несколько миллиардов
            слов) такое окно проезжает по всему тексту. Каждый шаг — небольшое
            обновление весов. Через несколько эпох векторы «кот» и «собака»
            оказываются рядом — потому что у них похожий контекст. Это и есть
            то, как word2vec «учит» смысл без учителя.
          </p>
        </div>
      </SandboxBlock>

      <TheoryBlock accent={accent}>
        <p>
          Несколько важных деталей, которые часто упускают:
        </p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong>Без учителя.</strong> Никаких меток не нужно — только
            сырой текст. Это огромное преимущество: текстов в интернете
            терабайты, а разметка дорогая.
          </li>
          <li>
            <strong>Глобальная статистика.</strong> Word2vec учитывает только
            локальный контекст (окно ±2..10 слов). Альтернатива — GloVe
            (Pennington, 2014), которая использует глобальную матрицу
            совстречаемостей. В современных LLM эмбеддинги не обучают
            отдельно — они выучиваются как побочный продукт pre-training
            (там задача «предсказать следующий токен», но идея та же).
          </li>
          <li>
            <strong>Знаменитая аналогия</strong> <code className="px-1 py-0.5 rounded bg-lime-50 dark:bg-lime-950/40 font-mono">king − man + woman ≈ queen</code> —
            появилась именно в оригинальной статье word2vec. Она показывает,
            что в выученном пространстве работают линейные операции над
            смыслом.
          </li>
          <li>
            <strong>Смещения.</strong> В этом же пространстве работают и
            негативные закономерности: <code className="px-1 py-0.5 rounded bg-lime-50 dark:bg-lime-950/40 font-mono">doctor − man + woman ≈ nurse</code> —
            модель впитывает предубеждения корпуса. Это серьёзная проблема,
            над которой работают исследователи alignment.
          </li>
        </ul>
        <p>
          На этом мы закрываем тему «эмбеддинги» в узком смысле. Дальше —
          следующая большая тема: <strong>attention</strong>. Но прежде чем
          разбирать attention, нужно понять одну важную вещь: токены в
          трансформере <em>не имеют порядка</em>. Это исправляет positional
          encoding — модуль 5.
        </p>
      </TheoryBlock>
    </ModuleShell>
  );
}
