export type Language = "uk" | "ru" | "en" | "de";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  language: Language;
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  done: boolean;
}
