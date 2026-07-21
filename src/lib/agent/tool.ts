import { z } from "zod";

export interface Tool {
  name: string;
  description: string;
  parameters?: z.ZodTypeAny;
  execute(input: any): Promise<unknown>;
}
