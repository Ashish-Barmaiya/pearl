import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiProviderError } from "@/lib/agent";

interface ErrorMessageProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  let structuredError: AiProviderError | null = null;
  
  try {
    const parsed = JSON.parse(error.message);
    if (parsed.error) {
      structuredError = parsed.error;
    } else {
      structuredError = parsed;
    }
  } catch (e) {
    // If not JSON, we fallback
  }

  const title = structuredError?.title || "Unexpected Error";
  const message = structuredError?.message || error.message || "An unexpected error occurred while contacting the AI provider.";
  const actionText = structuredError?.action || "Try again later.";

  return (
    <div className="flex border border-destructive/50 bg-destructive/10 rounded-xl p-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl mx-auto">
      <div className="mt-0.5 text-destructive">
        <AlertCircle className="size-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-destructive">{title}</h3>
        <p className="text-sm mt-1 mb-2 leading-relaxed">{message}</p>
        <p className="text-sm font-medium text-muted-foreground">{actionText}</p>
        
        {onRetry && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCw className="size-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
