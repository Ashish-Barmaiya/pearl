import { z } from "zod";

export interface Tool<TParams = unknown, TOutput = unknown> {
  name: string;
  description: string;
  parameters?: z.ZodTypeAny;
  execute(input: TParams): Promise<TOutput>;
}
