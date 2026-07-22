export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
  responseTime: number;
}

export interface NormalizedSearchResult {
  title: string;
  url: string;
  content: string;
}

export interface TavilySearchOptions {
  query: string;
  maxResults?: number;
}
