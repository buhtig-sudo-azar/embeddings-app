import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle, ThemeScript } from "@/components/learn/theme-toggle";
import { ScrollToTopBrain } from "@/components/learn/scroll-to-top";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Эмбеддинги и attention — как токены становятся смыслом",
  description:
    "Интерактивный курс: что идёт после токенизации — эмбеддинги, сходство векторов, word2vec, positional encoding, self-attention, multi-head attention, языковые модели, fine-tuning и RLHF. 10 модулей с живыми песочницами.",
  keywords: [
    "эмбеддинги",
    "embeddings",
    "attention",
    "трансформеры",
    "transformer",
    "GPT",
    "BERT",
    "RLHF",
    "fine-tuning",
    "NLP",
    "языковые модели",
    "интерактивный курс",
  ],
  authors: [{ name: "Эмбеддинги и attention" }],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: ["/icon.svg"],
  },
  openGraph: {
    title: "Эмбеддинги и attention — как токены становятся смыслом",
    description:
      "10 модулей: эмбеддинги, cosine similarity, word2vec, positional encoding, self-attention, multi-head, языковые модели, RLHF.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeToggle />
        {children}
        <ScrollToTopBrain />
      </body>
    </html>
  );
}
