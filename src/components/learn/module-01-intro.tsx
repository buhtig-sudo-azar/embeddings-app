"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowDown, Boxes, Network, Layers, Target, Sparkles } from "lucide-react";

const TOKENIZATSIYA_URL = "https://tokenizatsiya-app.vercel.app/";

// Этапы пайплайна — кликабельные
type StageId = "text" | "tokens" | "ids" | "embeddings" | "attention" | "output";

const STAGES: Array<{
  id: StageId;
  title: string;
  icon: typeof Boxes;
  short: string;
  example: string;
  description: string;
}> = [
  {
    id: "text",
    title: "Сырой текст",
    icon: Sparkles,
    short: "Text",
    example: "«кот сидит на окне»",
    description:
      "Исходная строка символов — то, что видит человек. Модель с этим работать не умеет: ей нужны числа.",
  },
  {
    id: "tokens",
    title: "Токены",
    icon: Layers,
    short: "Tokens",
    example: "[кот] [сидит] [на] [окне]",
    description:
      "Токенизатор (BPE / WordPiece) режет текст на подслова. Это была тема предыдущего курса — «Токенизация».",
  },
  {
    id: "ids",
    title: "ID токенов",
    icon: Boxes,
    short: "IDs",
    example: "[847, 2931, 12, 4092]",
    description:
      "Каждый токен заменяется на свой номер в словаре. Получается последовательность целых чисел. Но числа пока — просто метки: ID 847 не «больше» ID 12 по смыслу.",
  },
  {
    id: "embeddings",
    title: "Эмбеддинги",
    icon: Network,
    short: "Emb",
    example: "[ [0.31, −0.12, …], [0.05, 0.88, …], … ]",
    description:
      "Каждый ID превращается в вектор из N чисел (в GPT-3 — 12288 чисел на токен). Похожие токены получают похожие векторы. Это тема модулей 2–4.",
  },
  {
    id: "attention",
    title: "Attention",
    icon: Network,
    short: "Attn",
    example: "контекст(«окне») ← внимание к «кот», «сидит», «на»",
    description:
      "Self-attention смотрит на все токены сразу и решает, какие из них важны для каждого текущего. Так «окно» в «кот на окне» связывается с «кот», а не с окном в смысле «магазин». Темы модулей 5–7.",
  },
  {
    id: "output",
    title: "Предсказание",
    icon: Target,
    short: "Out",
    example: "следующий токен: «и» (p=0.42) / «спит» (p=0.18) / …",
    description:
      "Модель выдаёт распределение вероятностей для следующего токена. У GPT это авторегрессионно — следующий токен предсказывается по предыдущим. Темы модулей 8–9.",
  },
];

export function Module01Intro() {
  const accent = ACCENTS[1];
  const [active, setActive] = useState<StageId>("embeddings");
  const activeStage = STAGES.find((s) => s.id === active)!;

  return (
    <ModuleShell
      id={1}
      title="После токенов — что? Пайплайн языковой модели"
      subtitle="В прошлом курсе текст превратился в токены и ID. Но ID — это просто метки. Дальше происходит главное: токены становятся векторами, которые несут смысл. Этот курс — про то, как."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять, какие шаги идут после токенизации и где в этом пайплайне находятся темы этого курса.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          В курсе о токенизации ты остановился на том, что текст превращается
          в последовательность ID токенов — например, <code className="text-xs px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50">[847, 2931, 12, 4092]</code>.
          Но для языковой модели ID — это просто метки: токен с ID 847 не
          «больше» токена с ID 12 по смыслу, они просто разные. Чтобы модель
          могла понимать <strong>сходство</strong> и <strong>связи</strong>,
          ID нужно превратить во что-то непрерывное — в <strong>вектор</strong>.
        </p>
        <p>
          Этот курс проходит по оставшейся части пайплайна любой современной
          языковой модели — GPT, BERT, Llama, Claude, ChatGPT. Все они устроены
          одинаково на макро-уровне: <strong>текст → токены → ID → эмбеддинги →
          attention-слои → предсказание</strong>. Различаются только детали
          (размеры, количество слоёв, формат обучения).
        </p>
        <p>
          Каждый этап этого пайплайна — отдельная большая тема с собственным
          математическим аппаратом. Ниже — кликабельная схема: нажми на любой
          блок, чтобы увидеть, что происходит на этом шаге и какие модули
          нашего курса его разбирают.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Кликабельный пайплайн: от текста до предсказания">
        <div className="space-y-4">
          {/* Горизонтальная цепочка этапов */}
          <div className="flex flex-wrap items-stretch gap-1.5">
            {STAGES.map((s, i) => {
              const isActive = s.id === active;
              return (
                <div key={s.id} className="flex items-stretch">
                  <button
                    type="button"
                    onClick={() => setActive(s.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 transition-all min-w-[88px] sm:min-w-[110px]",
                      isActive
                        ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 shadow-md scale-105"
                        : "border-emerald-200 bg-card hover:border-emerald-400 dark:border-emerald-800/60 dark:hover:border-emerald-600"
                    )}
                  >
                    <s.icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase tracking-wide",
                        isActive ? "text-emerald-700 dark:text-emerald-300 font-bold" : "text-muted-foreground"
                      )}
                    >
                      {s.short}
                    </span>
                    <span className="text-xs font-semibold text-center leading-tight">
                      {s.title}
                    </span>
                  </button>
                  {i < STAGES.length - 1 && (
                    <div className="flex items-center px-0.5 text-emerald-400/60">
                      <ArrowRight className="h-4 w-4 hidden sm:block" />
                      <ArrowDown className="h-4 w-4 sm:hidden" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Подробности выбранного этапа */}
          <Card className="p-5 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
                <activeStage.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold">{activeStage.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {activeStage.description}
                </p>
              </div>
            </div>
            <div className="rounded-md bg-card border border-emerald-200 dark:border-emerald-800/60 p-3 font-mono text-sm break-all">
              <span className="text-xs text-emerald-700 dark:text-emerald-300 mr-2 uppercase tracking-wide">
                Пример:
              </span>
              <span className="text-foreground">{activeStage.example}</span>
            </div>
          </Card>

          {/* Легенда модулей */}
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-emerald-200 dark:border-emerald-800/60 p-3 bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Модули 2–4: векторы
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Эмбеддинги, cosine similarity, word2vec — как токен получает
                вектор и почему похожие слова лежат рядом.
              </p>
            </div>
            <div className="rounded-md border border-emerald-200 dark:border-emerald-800/60 p-3 bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Модули 5–7: attention
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Positional encoding, self-attention, multi-head — как модель
                решает, на какие токены смотреть.
              </p>
            </div>
            <div className="rounded-md border border-emerald-200 dark:border-emerald-800/60 p-3 bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Модули 8–9: модели
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Языковые модели (GPT/BERT), fine-tuning и RLHF — как из
                «предсказателя следующего токена» получается ChatGPT.
              </p>
            </div>
            <div className="rounded-md border border-emerald-200 dark:border-emerald-800/60 p-3 bg-emerald-50/50 dark:bg-emerald-950/30">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                Модуль 10: что дальше
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Roadmap следующих тем: scaling laws, MoE, multimodal, агенты.
                Ссылки на ресурсы.
              </p>
            </div>
          </div>
        </div>
      </SandboxBlock>

      <div className="rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/30 p-5 text-center">
        <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-semibold mb-2">
          Этот курс — продолжение двух предыдущих
        </div>
        <p className="text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
          Если ты ещё не проходил курс о токенизации — этапы «токены» и «ID»
          могут быть непонятны. Кликни ниже, чтобы открыть материнский курс.
        </p>
        <a href={TOKENIZATSIYA_URL} target="_blank" rel="noopener noreferrer">
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/50 dark:border-purple-800/60 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Открыть «Токенизация — как машины читают текст»
          </Badge>
        </a>
      </div>
    </ModuleShell>
  );
}
