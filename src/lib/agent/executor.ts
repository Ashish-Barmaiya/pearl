import { toolRegistry } from "./tool-registry";

export async function executeTool(name: string, input: unknown): Promise<unknown> {
  const tool = toolRegistry.getTool(name);
  if (!tool) {
    throw new Error(`Tool "${name}" not found in registry.`);
  }
  return tool.execute(input);
}
