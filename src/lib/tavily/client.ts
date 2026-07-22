import type { TavilySearchOptions, TavilySearchResponse, NormalizedSearchResult } from "./types";

export class TavilyAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TavilyAPIError";
  }
}

export async function tavilySearch(
  options: TavilySearchOptions
): Promise<NormalizedSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new TavilyAPIError("TAVILY_API_KEY environment variable is not configured.");
  }

  const endpoint = "https://api.tavily.com/search";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: options.query,
        max_results: options.maxResults ?? 5,
        include_answers: false,
        include_raw_content: false,
        include_domains: [],
        exclude_domains: [],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new TavilyAPIError(`Tavily API responded with status ${response.status}: ${response.statusText}`);
    }

    const data: TavilySearchResponse = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new TavilyAPIError("Invalid response format received from Tavily API.");
    }

    return data.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
    }));
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new TavilyAPIError("Tavily search request timed out.");
    }
    if (error instanceof TavilyAPIError) {
      throw error;
    }
    throw new TavilyAPIError(`Failed to execute search: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
