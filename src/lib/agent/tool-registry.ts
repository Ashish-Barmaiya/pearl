import { Tool } from "./tool";
import { z } from "zod";
import { tool, type Tool as SdkTool } from "ai";

class ToolRegistry {
  private tools = new Map<string, Tool<any, any>>();

  registerTool(tool: Tool<any, any>): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool<any, any> | undefined {
    return this.tools.get(name);
  }

  listTools(): Tool<any, any>[] {
    return Array.from(this.tools.values());
  }
}

export const toolRegistry = new ToolRegistry();

// ─── Tool Conversion helper ───────────────────────────────────────────────

export function toSdkTools(
  registeredTools: Tool<any, any>[]
): Record<string, any> {
  const convertedTools: Record<string, any> = {};

  for (const t of registeredTools) {
    convertedTools[t.name] = tool({
      description: t.description,
      parameters: t.parameters ?? z.any(),
      execute: async (args: any): Promise<any> => {
        try {
          return await t.execute(args);
        } catch (error) {
          // Safe execution: never crash the stream, return a structured error
          return {
            error: true,
            message: error instanceof Error ? error.message : String(error),
          };
        }
      },
    } as any);
  }

  return convertedTools;
}

// ─── Initial Mock Tool: Current Time ─────────────────────────────────────────

const currentTimeTool: Tool<Record<string, never>, string> = {
  name: "currentTime",
  description: "Returns the current date and time in ISO format. Use this whenever the user asks for the current date or time.",
  parameters: z.object({}),
  async execute(): Promise<string> {
    return new Date().toISOString();
  },
};

toolRegistry.registerTool(currentTimeTool);
