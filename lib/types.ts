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

export interface AutomationOpportunity {
  title: string;
  problem: string;
  solution: string;
  ai_capability: string;
  estimated_impact: string;
  request_to_specialist: string;
}

export interface Report {
  business_summary: string;
  automation_opportunities: AutomationOpportunity[];
  priority_recommendation: string;
  next_step: string;
}

export type Channel = "email" | "phone" | "telegram";

export interface LeadInfo {
  name: string;
  contact: string;
  channel: Channel;
  language: Language;
}

export interface LeadRequest extends LeadInfo {
  messages: ChatMessage[];
}
