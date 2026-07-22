import { tool, type Tool as AISDKTool } from "ai";
import { z } from "zod";

import type { Tool } from "./tool";
import { tavilySearchTool } from "./tools/tavily-search";

class ToolRegistry {
  private readonly tools = new Map<string, Tool>();

  registerTool(toolDefinition: Tool): void {
    if (this.tools.has(toolDefinition.name)) {
      throw new Error(`Tool "${toolDefinition.name}" is already registered.`);
    }

    this.tools.set(toolDefinition.name, toolDefinition);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  listTools(): Tool[] {
    return [...this.tools.values()];
  }
}

export const toolRegistry = new ToolRegistry();

export function toSdkTools(registeredTools: Tool[]): Record<string, AISDKTool> {
  const sdkTools: Record<string, AISDKTool> = {};

  for (const toolDefinition of registeredTools) {
    sdkTools[toolDefinition.name] = tool({
      description: toolDefinition.description,

      inputSchema: toolDefinition.parameters ?? z.object({}),

      execute: async (input) => {
        console.log(`[Tool] ${toolDefinition.name}`, input);

        const result = await toolDefinition.execute(input);

        console.log(`[Tool] ${toolDefinition.name} completed`);

        return result;
      },
    });
  }

  return sdkTools;
}

toolRegistry.registerTool(tavilySearchTool);
