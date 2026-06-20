import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

const DEMO = [
  { email: "ceo@aotms.com", label: "Super Admin (CEO)" },
  { email: "hr@aotms.com", label: "Admin (HR)" },
  { email: "cto@aotms.com", label: "CTO" },
  { email: "dev@aotms.com", label: "Developer" },
  { email: "trainer@aotms.com", label: "Trainer" },
  { email: "bdm@aotms.com", label: "BDM" },
  { email: "marketing@aotms.com", label: "Marketing" },
];

function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("ceo@aotms.com");
  const [password, setPassword] = useState("demo1234");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = login(email);
    if (!u) return toast.error("No account found with that email");
    if (u.status === "PENDING") return toast.warning("Your account is pending Super Admin approval");
    if (u.status === "REJECTED") return toast.error("Your registration was rejected");
    toast.success(`Welcome back, ${u.fullName}`);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">A</div>
          <div>
            <div className="text-sm font-bold">AOTMS</div>
            <div className="text-[11px] uppercase tracking-widest opacity-60">Operations</div>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Operations,<br/>orchestrated.</h2>
          <p className="mt-4 max-w-md text-sm opacity-80">
            Academy of Tech Masters runs on a single source of truth — attendance, tasks, approvals, and analytics
            in one enterprise workspace.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {["RBAC", "Audit Trail", "Real-Time"].map((t) => (
              <div key={t} className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3 text-xs font-medium">{t}</div>
            ))}
          </div>
        </div>
        <div className="text-xs opacity-60">© {new Date().getFullYear()} Academy of Tech Masters</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use one of the demo accounts to explore the system.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <p className="text-[11px] text-muted-foreground">Demo mode: any password accepted.</p>
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="mt-6">
            <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Quick demo accounts</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  onClick={() => setEmail(d.email)}
                  className="text-left rounded-md border bg-card px-3 py-2 text-xs hover:border-primary hover:bg-accent/10"
                >
                  <div className="font-medium">{d.label}</div>
                  <div className="text-muted-foreground">{d.email}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 text-sm text-muted-foreground">
            New to AOTMS? <Link to="/signup" className="font-semibold text-primary hover:underline">Request access</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
