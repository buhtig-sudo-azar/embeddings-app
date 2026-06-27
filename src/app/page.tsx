"use client";

import { ProgressProvider, useProgress } from "@/lib/use-progress";
import { MODULE_META, ACCENTS } from "@/components/learn/accents";
import { Module01Intro } from "@/components/learn/module-01-intro";
import { Module02Embeddings } from "@/components/learn/module-02-embeddings";
import { Module03Similarity } from "@/components/learn/module-03-similarity";
import { Module04Word2vec } from "@/components/learn/module-04-word2vec";
import { Module05Positional } from "@/components/learn/module-05-positional";
import { Module06SelfAttention } from "@/components/learn/module-06-self-attention";
import { Module07MultiHead } from "@/components/learn/module-07-multi-head";
import { Module08Lm } from "@/components/learn/module-08-lm";
import { Module09Finetuning } from "@/components/learn/module-09-finetuning";
import { Module10Next } from "@/components/learn/module-10-next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Brain,
  Sparkles,
  ArrowDown,
  ArrowLeft,
  Heart,
  Trash2,
  CheckCircle2,
  FlaskConical,
  Network,
} from "lucide-react";

const TOKENIZATSIYA_URL = "https://tokenizatsiya-app.vercel.app/";
const ML_S_NULA_URL = "https://ml-s-nula.vercel.app/";
const TRANSFORMERS_APP_URL = "https://transformers-architecture.vercel.app/";

function Hero() {
  const { completedCount, totalCount, hydrated, resetAll } = useProgress();
  const progressPct = hydrated ? (completedCount / totalCount) * 100 : 0;

  return (
    <section className="relative overflow-hidden border-b">
      {/* Декоративный фон */}
      <div className="hero-decoration absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute top-10 left-10 text-[200px] font-bold font-mono text-emerald-900 dark:text-emerald-400">
          →V←
        </div>
        <div className="absolute bottom-10 right-10 text-[150px] font-bold font-mono text-teal-900 dark:text-teal-400">
          QKV
        </div>
        <div className="absolute top-1/2 left-1/3 text-[120px] font-bold font-mono text-lime-900 dark:text-lime-400">
          A·V
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="max-w-2xl">
            <a
              href={TOKENIZATSIYA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mb-3 text-xs text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Назад к курсу «Токенизация»
            </a>
            <Badge
              variant="outline"
              className="mb-3 bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-300"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Продолжение: после токенов
            </Badge>
            <a
              href={TRANSFORMERS_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Badge
                variant="outline"
                className="mb-3 ml-2 bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-300 transition-colors"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Продолжение: архитектура трансформера →
              </Badge>
            </a>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Как токены становятся смыслом
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              10 модулей о том, что идёт после токенизации — эмбеддинги, cosine
              similarity, word2vec, positional encoding, self-attention,
              multi-head attention, языковые модели и fine-tuning/RLHF. С живыми
              песочницами: 2D-карта эмбеддингов, скользящее окно word2vec,
              матрица внимания, сравнение base/SFT/RLHF — прямо в браузере.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <a href="#module-1">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
                >
                  Начать с первого модуля
                  <ArrowDown className="h-4 w-4 ml-1.5" />
                </Button>
              </a>
              <a href="#module-6">
                <Button size="lg" variant="outline">
                  <FlaskConical className="h-4 w-4 mr-1.5" />
                  Сразу к self-attention
                </Button>
              </a>
            </div>
          </div>

          {/* Карточка прогресса */}
          <Card className="p-4 w-full sm:w-64 bg-card/95">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Твой прогресс
              </span>
              {hydrated && completedCount === totalCount && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div className="text-2xl font-bold font-mono">
              {hydrated ? completedCount : 0}
              <span className="text-base text-muted-foreground font-normal">
                {" "}
                / {totalCount}
              </span>
            </div>
            <Progress value={progressPct} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              модулей отмечено как пройденные
            </p>
            {hydrated && completedCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full mt-2 h-7 text-xs text-muted-foreground"
                onClick={resetAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Сбросить прогресс
              </Button>
            )}
          </Card>
        </div>

        {/* Бейджи характеристик */}
        <div className="flex flex-wrap gap-2 mt-8">
          <Badge variant="secondary" className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-300">
            <FlaskConical className="h-3 w-3 mr-1" />
            Живые песочницы: векторы, attention, RLHF
          </Badge>
          <Badge variant="secondary" className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800/60 dark:text-amber-300">
            <Brain className="h-3 w-3 mr-1" />
            От эмбеддингов до ChatGPT
          </Badge>
          <Badge variant="secondary" className="bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/50 dark:border-cyan-800/60 dark:text-cyan-300">
            <Network className="h-3 w-3 mr-1" />
            Прогресс сохраняется
          </Badge>
        </div>
      </div>
    </section>
  );
}

function ModuleNav() {
  const { isCompleted, hydrated } = useProgress();
  return (
    <nav
      className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b"
      aria-label="Навигация по модулям"
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-thin">
          {MODULE_META.map((m) => {
            const done = hydrated && isCompleted(m.id);
            const accent = ACCENTS[m.id];
            return (
              <a
                key={m.id}
                href={`#module-${m.id}`}
                className={cn(
                  "shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border",
                  done
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-300"
                    : cn("border-transparent hover:bg-muted", accent.text)
                )}
              >
                <span className="font-mono mr-1">{m.id}.</span>
                {m.short}
                {done && <CheckCircle2 className="inline h-3 w-3 ml-1" />}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function MainContent() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Module01Intro />
      <Module02Embeddings />
      <Module03Similarity />
      <Module04Word2vec />
      <Module05Positional />
      <Module06SelfAttention />
      <Module07MultiHead />
      <Module08Lm />
      <Module09Finetuning />
      <Module10Next />
    </main>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong className="text-foreground">Эмбеддинги и attention</strong> —
              интерактивный курс о том, как токены становятся смыслом
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            Сделано с <Heart className="h-3 w-3 fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400" /> для
            разработчиков, изучающих NLP
          </div>
        </div>
        <p className="text-xs mt-3 max-w-3xl">
          Все песочницы работают прямо в браузере на чистом React + TypeScript.
          Прогресс сохраняется локально в localStorage — твои ответы и метки
          не уходят на сервер. Это приложение — продолжение двух курсов:{" "}
          <a
            href={TOKENIZATSIYA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            «Токенизация»
          </a>{" "}
          и{" "}
          <a
            href={ML_S_NULA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            «ML с нуля»
          </a>
          .
        </p>

        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <span className="text-sm font-medium text-muted-foreground">
            создатель{" "}
            <span className="font-bold tracking-wide text-foreground">AZAR</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <ProgressProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Hero />
        <ModuleNav />
        <MainContent />
        <SiteFooter />
      </div>
    </ProgressProvider>
  );
}
