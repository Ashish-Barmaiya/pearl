export interface AiProviderError {
  code: string;
  title: string;
  message: string;
  action: string;
  status: number;
}

export function mapProviderError(error: any): AiProviderError {
  const defaultError: AiProviderError = {
    code: "UNKNOWN_ERROR",
    title: "Unexpected Error",
    message: "An unexpected error occurred while contacting the AI provider.",
    action: "Try again later.",
    status: 500,
  };

  if (!error) return defaultError;

  // Extract string message for text analysis
  const errMsg = (error.message || error.toString() || "").toLowerCase();
  const statusCode = error.statusCode || error.status || error.response?.status;

  // Try parsing raw response body if available
  let rawBody = "";
  try {
    rawBody = (error.responseBody || "").toLowerCase();
  } catch (e) {}

  const combinedText = errMsg + " " + rawBody;

  // 1. Invalid API Key
  if (
    statusCode === 401 ||
    combinedText.includes("invalid api key") ||
    combinedText.includes("api key is invalid") ||
    combinedText.includes("unauthorized")
  ) {
    return {
      code: "INVALID_API_KEY",
      title: "Invalid API Key",
      message: "The supplied API key was rejected.",
      action: "Verify your API key in Settings.",
      status: 401,
    };
  }

  // 2. Insufficient Credits (Often 402, or specific strings)
  if (
    statusCode === 402 ||
    combinedText.includes("insufficient_quota") ||
    combinedText.includes("credit") ||
    combinedText.includes("balance")
  ) {
    // Attempt to extract provider reasoning
    let extractedMessage =
      "Your provider account does not have enough credits.";
    if (
      combinedText.includes("openrouter") &&
      combinedText.includes("credit")
    ) {
      extractedMessage =
        "This request exceeds your available OpenRouter credits.";
    }
    return {
      code: "INSUFFICIENT_CREDITS",
      title: "Insufficient Credits",
      message: extractedMessage,
      action: "Top up your account or switch to another provider/model.",
      status: 402,
    };
  }

  // 3. Rate Limited
  if (
    statusCode === 429 ||
    combinedText.includes("rate limit") ||
    combinedText.includes("too many requests")
  ) {
    return {
      code: "RATE_LIMITED",
      title: "Rate Limited",
      message: "The provider is temporarily rate limiting requests.",
      action: "Wait a few moments and try again.",
      status: 429,
    };
  }

  // 4. Context Too Large
  if (
    statusCode === 413 ||
    combinedText.includes("context length") ||
    combinedText.includes("context window") ||
    combinedText.includes("maximum context") ||
    combinedText.includes("exceeds")
  ) {
    return {
      code: "CONTEXT_TOO_LARGE",
      title: "Context Too Large",
      message: "This conversation exceeds the model's context window.",
      action: "Start a new conversation.",
      status: 400,
    };
  }

  // 5. Model Not Found
  if (
    statusCode === 404 ||
    combinedText.includes("model not found") ||
    combinedText.includes("does not exist")
  ) {
    return {
      code: "MODEL_NOT_FOUND",
      title: "Model Not Found",
      message: "The selected model does not exist or is unavailable.",
      action: "Verify the model name in Settings.",
      status: 404,
    };
  }

  // 6. Provider Timeout
  if (
    statusCode === 408 ||
    statusCode === 504 ||
    combinedText.includes("timeout") ||
    error.name === "TimeoutError"
  ) {
    return {
      code: "PROVIDER_TIMEOUT",
      title: "Provider Timeout",
      message: "The provider took too long to respond.",
      action: "Retry or try another provider.",
      status: 504,
    };
  }

  // 7. Network Error
  if (
    combinedText.includes("fetch failed") ||
    combinedText.includes("network error") ||
    combinedText.includes("enoent") ||
    combinedText.includes("enotfound")
  ) {
    return {
      code: "NETWORK_ERROR",
      title: "Connection Error",
      message: "Unable to reach the AI provider.",
      action: "Check your internet connection or provider status.",
      status: 503,
    };
  }

  // Fallback to unknown but potentially safe extraction
  return defaultError;
}
