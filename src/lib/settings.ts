const STORAGE_KEY = "pearl-api-settings";

export interface ApiSettings {
  apiKey: string;
  baseURL: string;
  model: string;
}

const DEFAULT_SETTINGS: ApiSettings = {
  apiKey: "",
  baseURL: "https://api.openai.com/v1",
  model: "",
};

export function loadSettings(): ApiSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<ApiSettings>;
    return {
      apiKey: parsed.apiKey ?? DEFAULT_SETTINGS.apiKey,
      baseURL: parsed.baseURL ?? DEFAULT_SETTINGS.baseURL,
      model: parsed.model ?? DEFAULT_SETTINGS.model,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ApiSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isSettingsConfigured(settings: ApiSettings): boolean {
  return Boolean(settings.apiKey.trim() && settings.model.trim());
}

/**
 * Infer a human-readable provider name from the base URL.
 */
export function inferProviderName(baseURL: string): string {
  const url = baseURL.toLowerCase();

  if (url.includes("openrouter.ai")) return "OpenRouter";
  if (url.includes("anthropic.com")) return "Anthropic";
  if (url.includes("moonshot.cn")) return "Moonshot";
  if (url.includes("openai.com")) return "OpenAI";
  if (url.includes("groq.com")) return "Groq";
  if (url.includes("together.xyz") || url.includes("together.ai"))
    return "Together";
  if (url.includes("deepseek.com")) return "DeepSeek";
  if (url.includes("fireworks.ai")) return "Fireworks";
  if (url.includes("perplexity.ai")) return "Perplexity";
  if (url.includes("mistral.ai")) return "Mistral";

  try {
    const hostname = new URL(baseURL).hostname;
    return hostname.split(".").slice(-2, -1)[0] ?? "Custom";
  } catch {
    return "Custom";
  }
}
