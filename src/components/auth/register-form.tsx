"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "./google-sign-in-button";

export function RegisterForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.username.length < 3) { setError("Username must be at least 3 characters"); return; }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.displayName, form.username);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
      <h1 className="text-2xl font-bold mb-2">Create your account</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Start automating your affiliate marketing</p>

      <GoogleSignInButton />

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-500">or</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}
        <Input label="Full Name" placeholder="John Doe" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} required />
        <Input label="Username" placeholder="johndoe" value={form.username} onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} helperText="Used for your public store URL" required />
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} helperText="Minimum 6 characters" required />
        <Button type="submit" loading={loading} className="w-full">Create Account</Button>
      </form>
    </div>
  );
}
