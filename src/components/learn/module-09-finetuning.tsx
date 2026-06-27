"use client";

import { useState } from "react";
import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

const PROMPT = "Объясни, что такое чёрная дыра, простыми словами.";

type Stage = "base" | "sft" | "rlhf";

const RESPONSES: Record<Stage, { model: string; stage: string; response: string; comment: string; tone: string }> = {
  base: {
    model: "Base GPT (pre-trained)",
    stage: "Pre-training",
    response:
      "Чёрная дыра — это область пространства-времени… (далее почти случайно переключается на формулы из учебника, потом на астрофизику, потом обрывается на полуслове. Модель не знает, что её задача — объяснить вам, а не сгенерировать «похожий на научный» текст).",
    comment:
      "Модель оптимизирована под next-token prediction по корпусу. Она продолжает текст «как в интернете», не зная, что вы ждёте связного объяснения.",
    tone: "Сырой internet-текст",
  },
  sft: {
    model: "GPT + SFT",
    stage: "Supervised Fine-Tuning",
    response:
      "Чёрная дыра — это объект в космосе с такой сильной гравитацией, что из неё не вырваться даже свету. Представьте, что вы сжали Землю до размеров ореха — тогда она стала бы чёрной дырой. Они образуются, когда у больших звёзд заканчивается топливо и они коллапсируют под собственным весом.",
    comment:
      "После SFT на тысячах пар (prompt → идеальный ответ) модель «знает» формат: отвечай связно, простым языком, на тему вопроса. Но стиль ещё сухой, как у учебника.",
    tone: "Чёткий, но сухой",
  },
  rlhf: {
    model: "GPT + SFT + RLHF",
    stage: "Reinforcement Learning from Human Feedback",
    response:
      "Чёрная дыра — это как космический пылесос, который затягивает всё подряд, даже свет. Представьте: звезда «погасла», и её ядро схлопнулось в точку под собственным весом. Гравитация у этой точки настолько дикая, что даже свет не может улететь — поэтому она и «чёрная». 😊\n\nКстати, если упасть в чёрную дыру, тебя сначала растянет как спагетти (это называют spaghettification), а потом сожмёт. Так что лучше держаться подальше!",
    comment:
      "После RLHF модель «чувствует», какие ответы людям нравятся: понятные, с примерами, иногда с лёгкой эмоцией. Это и есть ChatGPT-стиль — полезный, дружелюбный, безопасный.",
    tone: "Живой, дружелюбный",
  },
};

const STAGES: Array<{ id: Stage; label: string; description: string }> = [
  {
    id: "base",
    label: "1. Pre-training",
    description: "Обучение next-token prediction на терабайтах текста. Получается «база» — умная, но бесполезная.",
  },
  {
    id: "sft",
    label: "2. SFT",
    description: "Supervised Fine-Tuning: учим модель на парах (prompt → правильный ответ). Теперь она отвечает в правильном формате.",
  },
  {
    id: "rlhf",
    label: "3. RLHF",
    description: "Reinforcement Learning from Human Feedback: учим модель предпочитать ответы, которые выбрали люди. Получается ChatGPT.",
  },
];

export function Module09Finetuning() {
  const accent = ACCENTS[9];
  const [stage, setStage] = useState<Stage>("rlhf");

  const resp = RESPONSES[stage];

  return (
    <ModuleShell
      id={9}
      title="Fine-tuning и RLHF: как базовая LM становится ChatGPT"
      subtitle="Pre-trained GPT предсказывает следующий токен — но не отвечает на вопросы. Превращение в полезного ассистента занимает ещё два этапа: SFT (supervised fine-tuning) и RLHF (reinforcement learning from human feedback). Без них не было бы ChatGPT."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        понять три стадии обучения современной LLM-ассистента — и увидеть разницу на одном примере.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          К 2020 году у OpenAI была GPT-3 — мощная базовая языковая модель
          на 175 млрд параметров. Но если спросить её в лоб «Объясни, что
          такое чёрная дыра», она <strong>не отвечала на вопрос</strong>.
          Она продолжала текст «как в интернете»: могла выдать формулу,
          кусок статьи из Википедии, обрывок форума — что угодно, лишь бы это
          было похоже на типичный интернет-текст после такого промпта.
          Модель не понимала, что её задача — помочь <em>вам</em>.
        </p>
        <p>
          ChatGPT (ноябрь 2022) стал прорывом не потому, что модель стала
          умнее — базовая архитектура осталась той же. Прорыв случился
          благодаря двум дополнительным этапам обучения:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Supervised Fine-Tuning (SFT)</strong>. Нанимают людей
            (часто — экспертов в предметных областях), пишут тысячи пар
            <code className="px-1 py-0.5 rounded bg-fuchsia-50 dark:bg-fuchsia-950/40 font-mono text-xs">(prompt → идеальный ответ)</code>.
            Модель дообучается на этих парах — учится формату «вопрос →
            связный ответ», стилю, структуре. Это просто supervised learning
            — как и pre-training, только на маленьком, качественном датасете
            (десятки тысяч примеров).
          </li>
          <li>
            <strong>Reinforcement Learning from Human Feedback (RLHF)</strong>.
            Это сложнее. Берём уже SFT-модель, генерируем для каждого промпта
            несколько ответов (сэмплируем). Просим людей-рейтеров
            <strong>отранжировать</strong> ответы от лучшего к худшему. На
            этих ранжированиях обучаем отдельную маленькую модель —
            <ConceptChip>reward model</ConceptChip>, которая предсказывает
            «насколько этот ответ понравится людям». Затем оптимизируем саму
            LLM — методом PPO (Proximal Policy Optimization) — так, чтобы
            reward model давала ей высокие оценки.
          </li>
        </ol>
        <p>
          Суть RLHF: <strong>модель учится максимизировать «человеческое
          одобрение»</strong>, а не просто likelihood текста. Это и даёт
          ощущение, что ChatGPT «понимает», чего вы хотите — отвечать
          понятно, дружелюбно, безопасно, на тему. Без RLHF модель остаётся
          сухой и часто бесполезной.
        </p>
        <p>
          Современные варианты: <strong>DPO</strong> (Direct Preference
          Optimization, 2023) — упрощение RLHF без отдельной reward model.
          <strong>RLAIF</strong> (RL from AI Feedback) — вместо людей
          ранжирует другая LLM (Constitutional AI у Anthropic). Это дешевле,
          но рискованнее. В RLAIF, например, обучен Claude.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Один промпт — три модели. Сравни ответы">
        <div className="space-y-4">
          {/* Промпт */}
          <Card className="p-4 border-fuchsia-200 dark:border-fuchsia-800/60 bg-fuchsia-50/30 dark:bg-fuchsia-950/20">
            <div className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300 mb-1">
              Промпт пользователя
            </div>
            <p className="text-sm font-medium">{PROMPT}</p>
          </Card>

          {/* Переключатель стадии */}
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStage(s.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md border-2 text-sm transition-all",
                  stage === s.id
                    ? "border-fuchsia-500 bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-200 font-bold"
                    : "border-fuchsia-200 bg-card hover:border-fuchsia-400 dark:border-fuchsia-800/60"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Ответ текущей модели */}
          <Card className="p-5 border-fuchsia-200 dark:border-fuchsia-800/60">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-900/50 dark:text-fuchsia-200 dark:border-fuchsia-800/60 font-mono"
                >
                  {resp.model}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{resp.stage}</span>
              </div>
              <Badge variant="outline" className="font-mono">
                {resp.tone}
              </Badge>
            </div>
            <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
              {resp.response}
            </div>
            <div className="mt-4 pt-3 border-t border-fuchsia-200/60 dark:border-fuchsia-800/40 text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">Что произошло: </span>
              {resp.comment}
            </div>
          </Card>

          {/* Пайплайн обучения — визуально */}
          <Card className="p-5 border-fuchsia-200 dark:border-fuchsia-800/60">
            <div className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300 mb-3">
              Три стадии обучения (нажми, чтобы выбрать)
            </div>
            <div className="space-y-2">
              {STAGES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStage(s.id)}
                  className={cn(
                    "w-full text-left rounded-md border-2 p-3 transition-all",
                    stage === s.id
                      ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30 shadow-sm"
                      : "border-fuchsia-200 bg-card hover:border-fuchsia-400 dark:border-fuchsia-800/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        stage === s.id
                          ? "bg-fuchsia-600 text-white"
                          : "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-200"
                      )}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm">{s.label}</div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </SandboxBlock>

      <TheoryBlock accent={accent}>
        <p>
          Несколько тонкостей про RLHF и alignment:
        </p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong>Sycophancy.</strong> После RLHF модель часто становится
            «поддакивающей»: если в промпте есть намёк на ответ, модель
            соглашается, даже если промпт неверный. Это побочный эффект —
            люди-рейтеры выше оценивают ответы, которые им «нравятся», а не
            обязательно правильные. Борьба с этим — открытая проблема.
          </li>
          <li>
            <strong>Safety training.</strong> Часть RLHF — учить модель
            отказываться от вредных запросов (как сделать оружие, наркотики,
            др.). Это иногда вызывает «ложные срабатывания» — модель
            отказывается от безобидных запросов, потому что они похожи на
            вредные. Тоже открытая проблема.
          </li>
          <li>
            <strong>Reward hacking.</strong> Модель может найти способ
            «обмануть» reward model — выдавать ответы, которые выглядят
            хорошо по формальным признакам, но на самом деле бесполезны.
            Это классическая проблема RL, в LLM она тоже есть.
          </li>
          <li>
            <strong>Preference data дорогая.</strong> Качественный датасет
            для RLHF — это тысячи часов работы людей-экспертов. Поэтому
            сейчас активно развиваются методы типа DPO и RLAIF, которые
            требуют меньше человеческих меток.
          </li>
        </ul>
        <p>
          На этом мы прошли весь основной путь: от сырого текста к токенам,
          от токенов к эмбеддингам, от эмбеддингов к attention, от attention
          к языковым моделям, от базовой LM — к ChatGPT-стилю. Дальше —
          модуль 10: <strong>что изучать после этого курса</strong>. Roadmap
          тем, которые логично идут следующими.
        </p>
      </TheoryBlock>
    </ModuleShell>
  );
}
