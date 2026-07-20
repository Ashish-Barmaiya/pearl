import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

interface ChatRequestBody {
  messages: UIMessage[];
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export async function POST(req: Request) {
  const { messages, apiKey, baseURL, model }: ChatRequestBody =
    await req.json();

  if (!apiKey || !apiKey.trim()) {
    return new Response(
      JSON.stringify({ error: "API key is required. Configure it in Settings." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!model || !model.trim()) {
    return new Response(
      JSON.stringify({ error: "Model is required. Configure it in Settings." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const provider = createOpenAI({
    apiKey: apiKey.trim(),
    baseURL: baseURL?.trim() || "https://api.openai.com/v1",
  });

  const result = streamText({
    model: provider(model.trim()),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
