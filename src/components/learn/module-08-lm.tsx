"use client";

import { useState, useMemo } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

// Учебный "bigram" словарь — для демонстрации next-token prediction.
// На самом деле bigram — это просто P(следующее | текущее).
// Здесь сделаем чуть умнее: возьмём короткий словарь и пропишем
// осмысленные вероятности для нескольких "контекстов".
type TokenStat = {
  token: string;
  /** условные вероятности следующего токена, сумма=1 */
  next: Array<{ token: string; p: number }>;
};

// Это небольшая toy-модель для иллюстрации. В реальности GPT считает
// P(next | вся предыдущая последовательность), а не только | last token.
const BIGRAM: Record<string, TokenStat> = {
  "кот": {
    token: "кот",
    next: [
      { token: "спит", p: 0.30 },
      { token: "сидит", p: 0.25 },
      { token: "мяукает", p: 0.20 },
      { token: "бежит", p: 0.15 },
      { token: "ест", p: 0.10 },
    ],
  },
  "собака": {
    token: "собака",
    next: [
      { token: "бежит", p: 0.35 },
      { token: "лает", p: 0.30 },
      { token: "спит", p: 0.20 },
      { token: "сидит", p: 0.10 },
      { token: "ест", p: 0.05 },
    ],
  },
  "солнце": {
    token: "солнце",
    next: [
      { token: "светит", p: 0.45 },
      { token: "греет", p: 0.25 },
      { token: "заходит", p: 0.15 },
      { token: "встаёт", p: 0.10 },
      { token: "спит", p: 0.05 },
    ],
  },
};

const TOKENS = Object.keys(BIGRAM);

type Mode = "gpt" | "bert";

const MASK_SENTENCE = ["кот", "сидит", "[MASK]", "окне"];

export function Module08Lm() {
  const accent = ACCENTS[8];
  const [mode, setMode] = useState<Mode>("gpt");
  const [currentToken, setCurrentToken] = useState<string>("кот");
  const [showTopAll, setShowTopAll] = useState(false);

  const stats = BIGRAM[currentToken];
  const sortedNext = useMemo(
    () => [...stats.next].sort((a, b) => b.p - a.p),
    [stats]
  );
  const visible = showTopAll ? sortedNext : sortedNext.slice(0, 3);

  // Для BERT-режима: статичные предсказания для [MASK]
  const maskPredictions: Array<{ token: string; p: number }> = [
    { token: "на", p: 0.62 },
    { token: "под", p: 0.18 },
    { token: "у", p: 0.10 },
    { token: "возле", p: 0.06 },
    { token: "около", p: 0.04 },
  ];

  return (
    <ModuleShell
      id={8}
      title="Языковые модели: GPT vs BERT"
      subtitle="Эмбеддинги и attention — строительные блоки. Что с ними собирать? Языковую модель — модель, которая понимает вероятности последовательностей токенов. Есть два больших семейства: GPT (авторегрессионная) и BERT (маскированная)."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        увидеть разницу между двумя главными архитектурами LLM — и что у них общего.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          <strong>Языковая модель</strong> (Language Model, LM) — это модель,
          которая присваивает вероятность любой последовательности токенов:
          <code className="px-1 py-0.5 rounded bg-pink-50 dark:bg-pink-950/40 font-mono text-xs">P(w₁, w₂, …, wₙ)</code>.
          На практике её используют для двух задач: <strong>оценить</strong>,
          насколько текст «правдоподобен», и <strong>сгенерировать</strong> —
          предсказать следующий токен. Все современные LLM (GPT, BERT, Llama,
          Claude) — языковые модели, но с разными архитектурами и целями.
        </p>
        <p>
          По формуле условной вероятности:
        </p>
        <div className="rounded-md bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800/60 p-3 font-mono text-sm text-pink-900 dark:text-pink-100 text-center">
          P(w₁, …, wₙ) = ∏ P(wₜ | w₁, …, wₜ₋₁)
        </div>
        <p>
          То есть вероятность всего предложения равна произведению условных
          вероятностей каждого токена при условии предыдущих. Это и есть то,
          что предсказывает LM — <ConceptChip>P(wₜ | контекст)</ConceptChip>.
          Дальше пути расходятся:
        </p>
        <ol className="list-decimal list-inside space-y-1.5">
          <li>
            <strong>GPT (Generative Pre-trained Transformer, OpenAI, 2018+)</strong> —
            <em>авторегрессионная</em> LM. Обучается предсказывать следующий
            токен по предыдущим. Causal mask: каждый токен видит только
            прошлое. Генерация: автокоррекция — предсказал, добавил в
            контекст, предсказал следующий, и так далее. <strong>ChatGPT —
            это GPT-3.5/4, дообученный</strong> (модуль 9).
          </li>
          <li>
            <strong>BERT (Bidirectional Encoder Representations from
            Transformers, Google, 2018)</strong> — <em>маскированная</em> LM.
            Обучается предсказывать случайно заменённые на <ConceptChip>[MASK]</ConceptChip>
            токены, <strong>видя весь контекст с обеих сторон</strong>. Не
            может генерировать (нет causal mask), но отлично понимает текст:
            классификация, NER, QA, поиск. Основная модель в Embeddings-as-a-Service
            до 2022 года.
          </li>
        </ol>
        <p>
          Архитектурно: GPT — это <strong>decoder-only</strong> трансформер
          (стек из N блоков multi-head self-attention + feedforward, с causal
          mask). BERT — <strong>encoder-only</strong> (тот же стек, но без
          mask, bidirectional). Есть и третий вариант —
          <strong>encoder-decoder</strong> (как в оригинальном трансформере
          для перевода, T5, BART), но в чистом виде он сейчас режется в
          LLM-пространстве.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Сравни GPT (next-token) и BERT (masked-token)">
        <div className="space-y-4">
          {/* Переключатель режима */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300">
              Режим:
            </span>
            <Button
              size="sm"
              variant={mode === "gpt" ? "default" : "outline"}
              onClick={() => setMode("gpt")}
              className={mode === "gpt" ? "bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-600" : ""}
            >
              GPT: предсказать следующий
            </Button>
            <Button
              size="sm"
              variant={mode === "bert" ? "default" : "outline"}
              onClick={() => setMode("bert")}
              className={mode === "bert" ? "bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-600" : ""}
            >
              BERT: угадать [MASK]
            </Button>
          </div>

          {mode === "gpt" ? (
            <div className="space-y-4">
              {/* Выбор контекста */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300">
                  Последний токен контекста
                </label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TOKENS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCurrentToken(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-md border-2 text-sm font-mono transition-all",
                        currentToken === t
                          ? "border-pink-500 bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200 font-bold"
                          : "border-pink-200 bg-card hover:border-pink-400 dark:border-pink-800/60"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Контекст + предсказание */}
              <Card className="p-5 border-pink-200 dark:border-pink-800/60">
                <div className="flex items-center gap-2 text-sm font-mono mb-3 flex-wrap">
                  <span className="px-2 py-1 rounded border border-pink-300 bg-pink-50 dark:bg-pink-950/40 dark:border-pink-800/60">
                    {currentToken}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    P(следующий | «{currentToken}») =
                  </span>
                </div>
                <div className="space-y-1.5">
                  {visible.map((n, i) => (
                    <div key={n.token} className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground w-5">#{i + 1}</span>
                      <span className="font-medium font-mono w-20">{n.token}</span>
                      <div className="flex-1 h-5 rounded-full bg-pink-50 dark:bg-pink-950/40 overflow-hidden border border-pink-200 dark:border-pink-800/60">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-end pr-2"
                          style={{ width: `${n.p * 100}%` }}
                        >
                          <span className="text-[10px] font-mono font-bold text-white">
                            {n.p.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {sortedNext.length > 3 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-xs"
                    onClick={() => setShowTopAll((v) => !v)}
                  >
                    {showTopAll ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Скрыть хвост
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Показать все {sortedNext.length}
                      </>
                    )}
                  </Button>
                )}
              </Card>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Это toy-модель: настоящая GPT смотрит на <strong>всю</strong>
                предыдущую последовательность (тысячи токенов), а не только на
                последний токен, и распределение сильно зависит от контекста.
                Но принцип тот же: модель выдаёт вероятности, мы выбираем
                (или сэмплируем) — и получаем следующий токен.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* BERT-предложение с маской */}
              <Card className="p-5 border-pink-200 dark:border-pink-800/60">
                <div className="text-xs font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300 mb-3">
                  Предложение с замаскированным токеном
                </div>
                <div className="flex items-center gap-1.5 flex-wrap font-mono text-sm">
                  {MASK_SENTENCE.map((t, i) => (
                    <span
                      key={i}
                      className={cn(
                        "px-2.5 py-1.5 rounded-md border-2",
                        t === "[MASK]"
                          ? "border-pink-500 bg-pink-200 dark:bg-pink-800/60 dark:text-pink-100 text-pink-900 font-bold animate-pulse"
                          : "border-pink-200 bg-card dark:border-pink-800/60"
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  BERT видит <strong>и левый, и правый</strong> контекст
                  одновременно (bidirectional). Его задача — угадать, что
                  скрыто за <ConceptChip>[MASK]</ConceptChip>. В отличие от
                  GPT, он не генерирует слева направо, а «додумывает»
                  пропущенное.
                </p>
              </Card>

              {/* Предсказания для MASK */}
              <Card className="p-5 border-pink-200 dark:border-pink-800/60">
                <div className="text-xs font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300 mb-3">
                  Топ-5 предсказаний для [MASK]
                </div>
                <div className="space-y-1.5">
                  {maskPredictions.map((n, i) => (
                    <div key={n.token} className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground w-5">#{i + 1}</span>
                      <span className="font-medium font-mono w-20">{n.token}</span>
                      <div className="flex-1 h-5 rounded-full bg-pink-50 dark:bg-pink-950/40 overflow-hidden border border-pink-200 dark:border-pink-800/60">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-end pr-2"
                          style={{ width: `${n.p * 100}%` }}
                        >
                          <span className="text-[10px] font-mono font-bold text-white">
                            {n.p.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  BERT почти уверен, что это «на» — потому что в обучающем
                  корпусе предлог «на» часто встречается между глаголом
                  движения/положения и существительным места. <strong>Грамматика
                  и контекст</strong>, а не только статистика биграмм.
                </p>
              </Card>
            </div>
          )}
        </div>
      </SandboxBlock>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Card className="p-4 border-pink-200 dark:border-pink-800/60">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <Badge variant="outline" className="bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-200 border-pink-300 dark:border-pink-800/60">
              GPT
            </Badge>
            <span>Decoder-only</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Предсказывает следующий токен</li>
            <li>Видит только прошлое (causal mask)</li>
            <li>Может генерировать текст</li>
            <li>Pre-training: next-token prediction</li>
            <li>Примеры: GPT-2/3/4, Llama, Claude, Mistral</li>
          </ul>
        </Card>
        <Card className="p-4 border-pink-200 dark:border-pink-800/60">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <Badge variant="outline" className="bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-200 border-pink-300 dark:border-pink-800/60">
              BERT
            </Badge>
            <span>Encoder-only</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Предсказывает замаскированные токены</li>
            <li>Видит весь контекст (bidirectional)</li>
            <li>Не умеет генерировать</li>
            <li>Pre-training: MLM + NSP</li>
            <li>Примеры: BERT, RoBERTa, DeBERTa, DistilBERT</li>
          </ul>
        </Card>
      </div>

      <TheoryBlock accent={accent}>
        <p>
          Важный нюанс: <strong>базовый GPT или BERT — это не ChatGPT</strong>.
          Это просто pre-trained модель, которая умеет считать вероятности.
          Чтобы превратить её в полезного ассистента, нужны ещё два этапа —
          supervised fine-tuning (SFT) и reinforcement learning from human
          feedback (RLHF). Это огромная отдельная тема, без которой не было
          бы резкого скачка качества между GPT-3 (2020) и ChatGPT (2022).
        </p>
        <p>
          Поэтому следующий модуль — про <strong>fine-tuning и
          alignment</strong>. Мы увидим, что превращает «предсказатель
          следующего токена» в полезного, безопасного помощника.
        </p>
      </TheoryBlock>
    </ModuleShell>
  );
}
