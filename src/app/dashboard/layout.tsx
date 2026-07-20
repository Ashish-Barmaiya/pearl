import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <aside className="w-72 border-r p-6">
        <h1 className="text-2xl font-bold">Pearl</h1>

        <nav className="mt-8 flex flex-col gap-3">
          <Link href="/dashboard">Home</Link>
          <Link href="/dashboard/chat">Chat</Link>
          <Link href="/dashboard/reports">Reports</Link>
          <Link href="/dashboard/usage">Usage</Link>
          <Link href="/dashboard/billing">Billing</Link>
          <Link href="/dashboard/settings">Settings</Link>
        </nav>

        <div className="absolute bottom-8">
          <p>{user.email}</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
