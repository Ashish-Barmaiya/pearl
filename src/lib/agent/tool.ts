import { z } from "zod";

export interface Tool<TInput = unknown, TOutput = unknown> {
  name: string;

  description: string;

  parameters: z.ZodType<TInput>;

  execute(input: TInput): Promise<TOutput>;
}
