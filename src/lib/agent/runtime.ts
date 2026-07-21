import { streamText, type LanguageModel, type UIMessage, convertToModelMessages } from "ai";
import { toolRegistry } from "./tool-registry";
import { z } from "zod";

interface RunAgentOptions {
  model: LanguageModel;
  messages: UIMessage[];
  maxSteps?: number;
}

export async function runAgentLoop({ model, messages, maxSteps = 5 }: RunAgentOptions) {
  const registeredTools = toolRegistry.listTools();
  const sdkTools: Record<string, any> = {};

  for (const tool of registeredTools) {
    sdkTools[tool.name] = {
      description: tool.description,
      parameters: tool.parameters ?? z.object({}),
      execute: async (args: any) => {
        return tool.execute(args);
      },
    };
  }

  const modelMessages = await convertToModelMessages(messages);

  return streamText({
    model,
    messages: modelMessages,
    tools: sdkTools,
    maxSteps,
  });
}
