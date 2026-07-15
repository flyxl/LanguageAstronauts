export type QuestionType = "choice" | "listening" | "reading" | "spelling" | "speaking";

export interface ContentItem {
  contentId: string;
  kind: "vocab" | "dialogue";
  en: string;
  zh: string;
  audioRef?: string;
  ttsFallback?: boolean;
  questionTypes: QuestionType[];
  distractorTags?: string[];
  prompt?: string;
  answer?: string;
  speaker?: string;
}

export interface ContentUnit {
  id: string;
  title: string;
  items: ContentItem[];
}

export interface ContentCatalog {
  units: ContentUnit[];
}

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}
