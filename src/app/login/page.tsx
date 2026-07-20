"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signIn() {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        onClick={signIn}
        className="rounded-md bg-black px-5 py-3 text-white"
      >
        Continue with Google
      </button>
    </main>
  );
}