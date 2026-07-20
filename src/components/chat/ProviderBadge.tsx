"use client";

import { Globe } from "lucide-react";
import { inferProviderName, type ApiSettings } from "@/lib/settings";

interface ProviderBadgeProps {
  settings: ApiSettings;
}

export function ProviderBadge({ settings }: ProviderBadgeProps) {
  const providerName = inferProviderName(settings.baseURL);

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 text-xs animate-in fade-in duration-300">
      <Globe className="size-3 text-muted-foreground" />
      <span className="font-medium">{providerName}</span>
      <span className="text-muted-foreground">·</span>
      <span className="font-mono text-muted-foreground">{settings.model}</span>
    </div>
  );
}
