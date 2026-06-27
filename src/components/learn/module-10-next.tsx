"use client";

import { ModuleShell, TheoryBlock, SandboxBlock, GoalBlock, ConceptChip } from "@/components/learn/shell";
import { ACCENTS } from "@/components/learn/accents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowRight, ExternalLink, Code, BookOpen, Boxes, Wrench, Network, Layers, Cpu, Zap } from "lucide-react";

const TOKENIZATSIYA_URL = "https://tokenizatsiya-app.vercel.app/";
const ML_S_NULA_URL = "https://ml-s-nula.vercel.app/";

const RESOURCES: Array<{
  icon: typeof BookOpen;
  title: string;
  description: string;
  url: string;
  linkLabel: string;
  tag: string;
}> = [
  {
    icon: BookOpen,
    title: "The Annotated Transformer",
    description:
      "Оригинальная статья «Attention Is All You Need» (Vaswani et al., 2017) с пошаговым кодом на PyTorch и комментариями. Лучший способ понять трансформер «изнутри» — пройти построчно.",
    url: "http://nlp.seas.harvard.edu/annotated-transformer/",
    linkLabel: "nlp.seas.harvard.edu",
    tag: "Статья + код",
  },
  {
    icon: BookOpen,
    title: "The Illustrated Transformer — Jay Alammar",
    description:
      "Классическая визуальная статья с картинками, которая объясняет архитектуру трансформера по шагам: embeddings, attention, multi-head, residual. Обязательна к прочтению.",
    url: "https://jalammar.github.io/illustrated-transformer/",
    linkLabel: "jalammar.github.io",
    tag: "Визуальный гайд",
  },
  {
    icon: Code,
    title: "Andrej Karpathy — Let's build GPT from scratch",
    description:
      "Двухчасовое видео, где Карпата на Python с нуля реализует GPT-подобную модель на игрушечном датасете Shakespeare. Лучший способ «почувствовать» архитектуру руками.",
    url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
    linkLabel: "youtube.com — Karpathy",
    tag: "Видео",
  },
  {
    icon: BookOpen,
    title: "Word2vec — оригинальная статья",
    description:
      "Mikolov et al. (2013) «Efficient Estimation of Word Representations in Vector Space». Фундаментальная работа, с которой началась эра dense embeddings.",
    url: "https://arxiv.org/abs/1301.3781",
    linkLabel: "arxiv.org/abs/1301.3781",
    tag: "Статья",
  },
  {
    icon: Wrench,
    title: "Hugging Face Transformers — библиотека и курс",
    description:
      "Самая популярная библиотека для работы с трансформерами. Курс от HF бесплатно ведёт через все основные концепции с кодом на Python.",
    url: "https://huggingface.co/learn/nlp-course",
    linkLabel: "huggingface.co/learn",
    tag: "Библиотека + курс",
  },
  {
    icon: BookOpen,
    title: "Illustrated Guide to RLHF — HuggingFace",
    description:
      "Подробное объяснение RLHF от HuggingFace — с диаграммами, формулами, кодом. Разбирает reward model, PPO, DPO и проблемы alignment.",
    url: "https://huggingface.co/blog/rlhf",
    linkLabel: "huggingface.co/blog/rlhf",
    tag: "Гайд",
  },
  {
    icon: Code,
    title: "3Blue1Brown — Neural Networks видео",
    description:
      "Серия визуальных видео от 3Blue1Brown: neural networks, attention, GPT. Без кода, чистая интуиция через анимации. Идеально для тех, кто только начинает.",
    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi",
    linkLabel: "youtube.com — 3Blue1Brown",
    tag: "Видео-серия",
  },
  {
    icon: BookOpen,
    title: "Scaling Laws for Neural Language Models",
    description:
      "Kaplan et al. (2020) — статья OpenAI о scaling laws. Объясняет, почему качество модели предсказуемо растёт с размером, данными и вычислениями. Основа «bigger is better».",
    url: "https://arxiv.org/abs/2001.08361",
    linkLabel: "arxiv.org/abs/2001.08361",
    tag: "Статья",
  },
];

const NEXT_TOPICS: Array<{
  icon: typeof Code;
  title: string;
  short: string;
  description: string;
}> = [
  {
    icon: Cpu,
    title: "Scaling laws",
    short: "Scale",
    description:
      "Эмпирические законы: качество LM предсказуемо растёт с размером модели, объёмом данных и вычислений. Это дало уверенность вкладывать сотни миллионов в обучение GPT-3, GPT-4.",
  },
  {
    icon: Zap,
    title: "Mixture of Experts (MoE)",
    short: "MoE",
    description:
      "Архитектура, где только часть параметров активируется для каждого токена. Позволяет обучать модели на триллионы параметров при разумной стоимости инференса. Используется в GPT-4, Mixtral, DeepSeek-V3.",
  },
  {
    icon: Layers,
    title: "Multimodal LLM",
    short: "MM",
    description:
      "Модели, которые работают не только с текстом, но и с картинками (GPT-4V, Claude 3), аудио, видео. Эмбеддинги разных модальностей приводятся к общему пространству.",
  },
  {
    icon: Network,
    title: "Agents и tool use",
    short: "Agent",
    description:
      "LLM как «мозг» агента, который вызывает инструменты (поиск, код, API), планирует многошаговые задачи. Это следующий уровень после chat — AutoGPT, ReAct, function calling.",
  },
  {
    icon: BookOpen,
    title: "Mechanistic interpretability",
    short: "Interp",
    description:
      "Reverse-engineering обученных моделей: что именно выучила каждая голова, каждый нейрон? Anthropic Circuits, Transformer Circuits Thread. Самое «научное» направление в LLM.",
  },
  {
    icon: Code,
    title: "Efficient inference",
    short: "Infer",
    description:
      "Квантизация (4-bit, 8-bit), KV-cache, speculative decoding, FlashAttention. Без этого LLM на 70B+ параметров было бы невозможно запускать локально.",
  },
];

export function Module10Next() {
  const accent = ACCENTS[10];

  return (
    <ModuleShell
      id={10}
      title="Что изучать дальше — roadmap после этого курса"
      subtitle="Мы прошли путь от токенов до ChatGPT. Что осталось за кадром? Вот шесть больших направлений, в которые логично идти следующими."
      accent={accent}
    >
      <GoalBlock accent={accent}>
        составить план дальнейшего изучения LLM — после того, как понятны эмбеддинги, attention и fine-tuning.
      </GoalBlock>

      <TheoryBlock accent={accent}>
        <p>
          Этот курс закрыл фундамент: токены → эмбеддинги → positional
          encoding → self-attention → multi-head → языковые модели → SFT/RLHF.
          Этого достаточно, чтобы читать статьи про LLM и понимать, о чём
          речь. Но это не вся картина — есть как минимум шесть больших тем,
          которые либо развивают то, что мы разобрали, либо открывают
          совершенно новые направления.
        </p>
        <p>
          Важный момент: <strong>этот курс — практический фундамент</strong>.
          Дальше лучше всего не читать статьи, а <strong>строить</strong> —
          маленький GPT с нуля (Karpathy), дообучать маленькую модель на
          своих данных (HuggingFace SFTTrainer), интегрировать LLM с
          инструментами. Теория без рук редко закрепляется.
        </p>
      </TheoryBlock>

      <SandboxBlock accent={accent} title="Шесть направлений — куда расти дальше">
        <div className="grid sm:grid-cols-2 gap-3">
          {NEXT_TOPICS.map((t) => (
            <Card key={t.short} className="p-4 border-red-200 dark:border-red-800/60">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200">
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{t.title}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {t.short}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </SandboxBlock>

      <SandboxBlock accent={accent} title="Кураторские ресурсы для углубления">
        <div className="grid sm:grid-cols-2 gap-3">
          {RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-4 border-red-200 dark:border-red-800/60 hover:border-red-400 hover:shadow-md transition-all h-full">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm line-clamp-2">{r.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {r.tag}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {r.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-red-700 dark:text-red-300 mt-2 font-mono">
                      <ExternalLink className="h-3 w-3" />
                      {r.linkLabel}
                    </div>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </SandboxBlock>

      <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50/50 dark:border-red-800/60 dark:bg-red-950/30 p-5 text-center">
        <div className="text-xs uppercase tracking-wide text-red-700 dark:text-red-300 font-semibold mb-2">
          Возврат к материнским курсам
        </div>
        <p className="text-sm text-muted-foreground mb-4 max-w-xl mx-auto">
          Это приложение — продолжение двух курсов. Если хочешь вернуться к
          ним — кнопки ниже ведут на их главные страницы.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <a href={TOKENIZATSIYA_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-600"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              Токенизация
            </Button>
          </a>
          <a href={ML_S_NULA_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="outline"
              className="border-teal-500 text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              ML с нуля
            </Button>
          </a>
        </div>
      </div>
    </ModuleShell>
  );
}
