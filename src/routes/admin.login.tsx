import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shield, ArrowRight, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — reedmoon" },
      { name: "description", content: "Admin login portal for reedmoon store management." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const normalizedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    const isValidUser = normalizedUser === "admin" || normalizedUser === "admin@gmail.com";
    const isValidPass =
      trimmedPass === "reedmoon" || trimmedPass === "bluemask" || trimmedPass === "123admin123";

    if (isValidUser && isValidPass) {
      localStorage.setItem("bm_is_admin", "true");
      navigate({ to: "/admin" });
    } else {
      setError("Invalid username or password. Check your credentials.");
    }
  };

  return (
    <main className="bm min-h-screen flex w-full">
      {/* Left: Branding/Visual */}
      <div className="hidden lg:flex w-1/2 bg-secondary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--bm-blue)_0%,_transparent_70%)] opacity-20" />
        <div className="relative z-10 text-center">
          <Shield className="w-24 h-24 text-primary mx-auto mb-8" />
          <h2 className="text-4xl font-bold text-foreground">reedmoon Admin</h2>
          <p className="text-muted-foreground mt-4">Secure Store Management System</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to manage the storefront.</p>
          </div>

          {error && (
            <div className="bg-rose-950/20 border border-rose-900/40 text-rose-400 text-sm p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="w-full bg-secondary border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-secondary border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <Button type="submit" className="bm-btn bm-btn-primary w-full mt-4 justify-center">
              Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Back to storefront
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
