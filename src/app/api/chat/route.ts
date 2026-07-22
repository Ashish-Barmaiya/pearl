import { createOpenAI } from "@ai-sdk/openai";
import { type UIMessage } from "ai";
import { runAgentLoop } from "@/lib/agent";
import { mapProviderError } from "@/lib/agent/errors";

interface ChatRequestBody {
  messages: UIMessage[];
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export async function POST(req: Request) {
  const { messages, apiKey, baseURL, model }: ChatRequestBody =
    await req.json();

  if (!apiKey?.trim()) {
    return Response.json(
      {
        error: {
          title: "API Key Required",
          message: "Configure your API key in Settings.",
        },
      },
      { status: 400 },
    );
  }

  if (!model?.trim()) {
    return Response.json(
      {
        error: {
          title: "Model Required",
          message: "Select a model in Settings.",
        },
      },
      { status: 400 },
    );
  }

  const provider = createOpenAI({
    apiKey: apiKey.trim(),
    baseURL: baseURL?.trim() || "https://api.openai.com/v1",
  });

  try {
    const result = await runAgentLoop({
      model: provider(model.trim()),
      messages,
      maxSteps: 5,
    });

    return result.toUIMessageStreamResponse({
      onError(error: unknown) {
        console.error("[AI STREAM ERROR]", error);

        const mapped = mapProviderError(error);

        return `${mapped.title}: ${mapped.message}`;
      },
    });
  } catch (error) {
    console.error("[CHAT ROUTE ERROR]", error);

    const mapped = mapProviderError(error);

    return Response.json(
      {
        error: mapped,
      },
      {
        status: mapped.status,
      },
    );
  }
}
