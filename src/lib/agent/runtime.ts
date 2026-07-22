import { streamText, type LanguageModel, type UIMessage, convertToModelMessages, type StreamTextResult, type tool } from "ai";
import { toolRegistry, toSdkTools } from "./tool-registry";

export type AgentRuntimeStatus = "thinking" | "tool_call" | "generating" | "completed";

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
}: RunAgentOptions): Promise<any> {
  // Prime runtime event state
  onStatus?.("thinking");

  const agentTools = toSdkTools(toolRegistry.listTools());
  const modelMessages = await convertToModelMessages(messages);

  return streamText({
    model,
    messages: modelMessages,
    tools: agentTools,
    maxSteps,
    abortSignal: signal,
    onStepFinish: ({ toolCalls }: any) => {
      if (toolCalls && toolCalls.length > 0) {
        onStatus?.("tool_call");
      }
    },
    onChunk: ({ chunk }: any) => {
      if (chunk.type === "text-delta" && (chunk.textDelta || chunk.text)) {
        onStatus?.("generating");
      }
    },
    onFinish: () => {
      onStatus?.("completed");
    },
  } as any);
}
