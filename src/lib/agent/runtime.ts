import {
  streamText,
  type LanguageModel,
  type UIMessage,
  convertToModelMessages,
} from "ai";

import { toolRegistry, toSdkTools } from "./tool-registry";

export type AgentRuntimeStatus =
  "thinking" | "tool_call" | "generating" | "completed";

export interface RunAgentOptions {
  model: LanguageModel;
  messages: UIMessage[];
  maxSteps?: number;
  signal?: AbortSignal;
  onStatus?: (status: AgentRuntimeStatus) => void;
}

export async function runAgentLoop({
  model,
  messages,
  maxSteps = 5,
  signal,
  onStatus,
}: RunAgentOptions) {
  onStatus?.("thinking");

  const sdkTools = toSdkTools(toolRegistry.listTools());

  const modelMessages = await convertToModelMessages(messages);

  const SYSTEM_PROMPT = `
You are Pearl, an AI research assistant.

You have access to external tools.

Rules:

- Use tavilySearch whenever the answer depends on:
  - current events
  - recent news
  - live information
  - sports results
  - today's date or time
  - stock prices
  - weather
  - anything after your knowledge cutoff

- Never invent current information.

- If a search is unnecessary (math, programming, writing, explanations, reasoning), answer directly without using tools.

- After receiving tool results, synthesize them into a natural answer. Do not simply dump raw search results.
`;

  return streamText({
    model,
    system: SYSTEM_PROMPT,

    messages: modelMessages,

    tools: sdkTools,

    stopWhen: ({ steps }) => steps.length >= maxSteps,

    maxOutputTokens: 1024,

    abortSignal: signal,

    onStepFinish({ toolCalls }) {
      if (toolCalls.length > 0) {
        console.log("[Agent] Tool Calls:", toolCalls);
        onStatus?.("tool_call");
      }
    },

    onChunk({ chunk }) {
      if (chunk.type === "text-delta") {
        onStatus?.("generating");
      }
    },

    onFinish() {
      onStatus?.("completed");
    },
  });
}
