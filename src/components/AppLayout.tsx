import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
  Clock,
  ClipboardCheck,
  History,
  BarChart3,
  ScrollText,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useApp, canManageUsers, isSuperAdmin } from "@/lib/store";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/my-work-items", label: "My Work Items", icon: ClipboardCheck },
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/attendance", label: "Attendance", icon: Clock },
  { to: "/employees", label: "Employees", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/departments", label: "Departments", icon: Building2, roles: ["SUPER_ADMIN", "ADMIN"] },
  { to: "/history", label: "Task History", icon: History },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/audit", label: "Audit Log", icon: ScrollText, roles: ["SUPER_ADMIN"] },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, logout, state } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) {
    if (typeof window !== "undefined") navigate({ to: "/login" });
    return null;
  }

  const items = NAV.filter((n) => !n.roles || n.roles.includes(currentUser.role));
  const unread = state.notifications.filter((n) => n.userId === currentUser.id && !n.read).length;

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold">
          A
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight">AOTMS</div>
          <div className="text-[10px] uppercase tracking-widest opacity-60">Operations</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.to === "/notifications" && unread > 0 && (
                <span className="rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: currentUser.avatarColor }}
          >
            {currentUser.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium">{currentUser.fullName}</div>
            <div className="truncate text-[11px] opacity-70">{ROLE_LABELS[currentUser.role]}</div>
          </div>
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="rounded-md p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  const pageTitle = items.find((i) => pathname === i.to || pathname.startsWith(i.to + "/"))?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden md:block">{Sidebar}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{Sidebar}</div>
        </div>
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/80 backdrop-blur px-4 md:px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-base font-semibold">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-2">
            {isSuperAdmin(currentUser.role) && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent-foreground">
                <Shield className="h-3 w-3" /> Super Admin
              </span>
            )}
            <Link to="/notifications" className="relative rounded-md p-2 hover:bg-muted">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export const RBAC = { canManageUsers };
