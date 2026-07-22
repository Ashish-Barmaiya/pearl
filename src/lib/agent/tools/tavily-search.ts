import { z } from "zod";
import { type Tool } from "../tool";
import { tavilySearch, type NormalizedSearchResult } from "../../tavily";

export const tavilySearchTool: Tool<
  { query: string; maxResults?: number },
  NormalizedSearchResult[]
> = {
  name: "tavilySearch",
  description: "Search the web using Tavily API for current events, news, or factual information. Do NOT use this for math, programming explanations, general knowledge, or simple reasoning tasks.",
  parameters: z.object({
    query: z.string().describe("The search query"),
    maxResults: z.number().optional().default(5).describe("Maximum number of results to return"),
  }),
  async execute(args) {
    // The client handles timeouts, API key validation, and errors
    // Any thrown error here will be gracefully caught by the runtime's safe execution block
    return await tavilySearch({
      query: args.query,
      maxResults: args.maxResults,
    });
  },
};
