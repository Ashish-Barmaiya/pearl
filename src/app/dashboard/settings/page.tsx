"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Save, RotateCcw, KeyRound, Globe, Cpu, Check } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  loadSettings,
  saveSettings,
  inferProviderName,
  type ApiSettings,
} from "@/lib/settings";

const BASE_URL_PRESETS = [
  { label: "OpenAI", value: "https://api.openai.com/v1" },
  { label: "OpenRouter", value: "https://openrouter.ai/api/v1" },
  { label: "Anthropic", value: "https://api.anthropic.com/v1" },
  { label: "Moonshot", value: "https://api.moonshot.cn/v1" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<ApiSettings>({
    apiKey: "",
    baseURL: "https://api.openai.com/v1",
    model: "",
  });
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    toast.success("Settings saved", {
      description: "Your API credentials have been stored locally.",
    });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults: ApiSettings = {
      apiKey: "",
      baseURL: "https://api.openai.com/v1",
      model: "",
    };
    setSettings(defaults);
    saveSettings(defaults);
    toast.info("Settings reset", {
      description: "All credentials have been cleared.",
    });
  };

  const update = (field: keyof ApiSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const providerName = inferProviderName(settings.baseURL);

  if (!mounted) return null;

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex min-h-full items-start justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Page header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure your AI provider credentials. Keys are stored only in
              your browser — never sent to our servers.
            </p>
          </div>

          {/* Provider badge */}
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
              <Globe className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Provider</p>
              <p className="text-sm font-medium">{providerName}</p>
            </div>
            {settings.model && (
              <>
                <div className="mx-2 h-6 w-px bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="text-sm font-medium font-mono">
                    {settings.model}
                  </p>
                </div>
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Credentials</CardTitle>
              <CardDescription>
                Provide your OpenAI-compatible API key and endpoint. These values
                are used for every chat request.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* API Key */}
              <div className="space-y-2">
                <label
                  htmlFor="settings-api-key"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <KeyRound className="size-3.5 text-muted-foreground" />
                  API Key
                </label>
                <div className="relative">
                  <Input
                    id="settings-api-key"
                    type={showKey ? "text" : "password"}
                    value={settings.apiKey}
                    onChange={(e) => update("apiKey", e.target.value)}
                    placeholder="sk-••••••••••••••••••••••••"
                    className="pr-10 font-mono"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showKey ? "Hide API key" : "Reveal API key"}
                  >
                    {showKey ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your key is stored in LocalStorage and sent directly to the
                  provider.
                </p>
              </div>

              {/* Base URL */}
              <div className="space-y-2">
                <label
                  htmlFor="settings-base-url"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Globe className="size-3.5 text-muted-foreground" />
                  Base URL
                </label>
                <Input
                  id="settings-base-url"
                  type="text"
                  value={settings.baseURL}
                  onChange={(e) => update("baseURL", e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="font-mono"
                />
                <div className="flex flex-wrap gap-1.5">
                  {BASE_URL_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => update("baseURL", preset.value)}
                      className={`rounded-md border px-2.5 py-1 text-xs transition-all ${
                        settings.baseURL === preset.value
                          ? "border-primary/50 bg-primary/10 text-primary font-medium"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label
                  htmlFor="settings-model"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Cpu className="size-3.5 text-muted-foreground" />
                  Model
                </label>
                <Input
                  id="settings-model"
                  type="text"
                  value={settings.model}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder="gpt-4o, claude-sonnet-4, kimi-k2, ..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter any model identifier supported by your provider.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                id="settings-reset-button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button
                id="settings-save-button"
                onClick={handleSave}
                size="sm"
                disabled={!settings.apiKey.trim() || !settings.model.trim()}
              >
                {saved ? (
                  <Check className="size-3.5" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {saved ? "Saved" : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>

          {/* Security notice */}
          <div className="rounded-lg border border-dashed border-border/50 bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">
                🔒 Privacy Guarantee
              </span>{" "}
              — Your API key never leaves your browser except when making
              requests directly to your chosen provider endpoint. We do not
              store, log, or cache your credentials on any server.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
