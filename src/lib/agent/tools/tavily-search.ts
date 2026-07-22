import { z } from "zod";

import type { Tool } from "../tool";
import { tavilySearch, type NormalizedSearchResult } from "../../tavily";

const TavilySearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Search query cannot be empty.")
    .describe("The search query."),

  maxResults: z
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .describe("Maximum number of search results to return."),
});

export const tavilySearchTool: Tool<
  z.infer<typeof TavilySearchSchema>,
  NormalizedSearchResult[]
> = {
  name: "tavilySearch",

  description: `
Search the public web for current or rapidly changing information.

Use this tool whenever the user's request depends on information that may have changed after the model's knowledge cutoff.

Examples:
- latest news
- current events
- recent releases
- sports results
- stock prices
- weather
- today's information
- company announcements
- documentation that changes frequently

Do NOT use this tool for:
- programming explanations
- mathematics
- logical reasoning
- writing assistance
- language translation
- historical facts that are unlikely to change
`,

  parameters: TavilySearchSchema,

  async execute({ query, maxResults }) {
    return tavilySearch({
      query,
      maxResults,
    });
  },
};
