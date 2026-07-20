"use client";

import Link from "next/link";
import { KeyRound, ArrowRight } from "lucide-react";

export function SettingsGate() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <KeyRound className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Configure your API credentials to begin.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Pearl needs an API key and model to generate responses. Your
          credentials are stored locally and never sent to our servers.
        </p>
        <Link
          href="/dashboard/settings"
          className="mt-6 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          Open Settings
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
