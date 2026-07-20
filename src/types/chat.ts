export interface ChatRequest {
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];

  apiKey: string;

  model: string;

  baseURL?: string;
}
