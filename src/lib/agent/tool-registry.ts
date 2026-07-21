import { Tool } from "./tool";
import { z } from "zod";

class ToolRegistry {
  private tools = new Map<string, Tool>();

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }
}

export const toolRegistry = new ToolRegistry();

// ─── Initial Mock Tool: Current Time ─────────────────────────────────────────

const currentTimeTool: Tool = {
  name: "currentTime",
  description: "Returns the current date and time in ISO format. Use this whenever the user asks for the current date or time.",
  parameters: z.object({}),
  async execute() {
    return new Date().toISOString();
  },
};

toolRegistry.registerTool(currentTimeTool);
