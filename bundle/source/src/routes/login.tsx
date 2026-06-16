import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Sparkles, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LangSwitch } from "@/components/lang-switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in or sign up — Career GPS AI" },
      { name: "description", content: "Sign in to your Career GPS AI account or create a new one." },
    ],
  }),
  component: Login,
});

function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"signin" | "signup">("signup");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Enter a valid email");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-hero text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold">Career GPS AI</span>
        </Link>
        <LangSwitch />
      </div>

      <div className="mx-auto mt-10 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">
          {mode === "signup" ? t("signup") : t("login")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("tagline")}</p>

        <div className="mt-6 inline-flex rounded-full border border-border p-1 text-xs font-semibold">
          <button
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-1.5 ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t("signup")}
          </button>
          <button
            onClick={() => setMode("signin")}
            className={`rounded-full px-4 py-1.5 ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {t("login")}
          </button>
        </div>

        <form
          onSubmit={submit}
          className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium">Your name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="mt-1.5 h-11"
                maxLength={120}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-0 px-1 shadow-none focus-visible:ring-0"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="border-0 px-1 shadow-none focus-visible:ring-0"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="h-12 w-full bg-gradient-hero text-white shadow-glow"
          >
            {loading ? t("loggingIn") : t("continue")}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms & Privacy.
        </p>
      </div>
    </main>
  );
}
