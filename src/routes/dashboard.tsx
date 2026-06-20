import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, ListTodo, LogIn, LogOut, TrendingUp, Users, AlertCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const today = () => new Date().toISOString().slice(0, 10);

function Dashboard() {
  const { currentUser, state, checkIn, checkOut } = useApp();
  if (!currentUser) return <AppLayout><div /></AppLayout>;

  const myTasks = state.tasks.filter((t) => t.assignedToId === currentUser.id);
  const todayTasks = myTasks.filter((t) => t.dueDate === today());
  const pending = myTasks.filter((t) => ["ASSIGNED", "IN_PROGRESS"].includes(t.status));
  const completed = myTasks.filter((t) => ["COMPLETED", "APPROVED"].includes(t.status));
  const myAttToday = state.attendance.find((a) => a.userId === currentUser.id && a.date === today());

  const isLeadership = currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN";
  const approvedUsers = state.users.filter((u) => u.status === "APPROVED");
  const pendingApprovals = state.users.filter((u) => u.status === "PENDING").length;
  const allTasks = state.tasks;
  const tasksDone = allTasks.filter((t) => t.status === "COMPLETED").length;

  const taskStatusData = [
    { name: "Assigned", value: allTasks.filter((t) => t.status === "ASSIGNED").length, color: "#3b82f6" },
    { name: "In Progress", value: allTasks.filter((t) => t.status === "IN_PROGRESS").length, color: "#f59e0b" },
    { name: "Completed", value: tasksDone, color: "#10b981" },
    { name: "Postponed", value: allTasks.filter((t) => t.status === "POSTPONED").length, color: "#a855f7" },
    { name: "Pending Approval", value: allTasks.filter((t) => t.status === "PENDING_APPROVAL").length, color: "#ec4899" },
  ];

  const deptData = ["Human Resources", "Development", "Training", "Digital Marketing", "Business Development", "Management"].map((d) => ({
    name: d.split(" ")[0],
    employees: approvedUsers.filter((u) => u.department === d).length,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-sidebar to-primary p-6 text-sidebar-foreground">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-sm opacity-80">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
              <h2 className="mt-1 text-3xl font-bold">Welcome back, {currentUser.fullName.split(" ")[0]}</h2>
              <p className="mt-1 text-sm opacity-80">Here's what's happening across your workspace today.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => { if (myAttToday) return toast.info("Already checked in"); checkIn(); toast.success("Checked in"); }}
              >
                <LogIn className="mr-2 h-4 w-4" /> Check In {myAttToday?.checkIn && `(${myAttToday.checkIn})`}
              </Button>
              <Button
                variant="secondary"
                onClick={() => { if (!myAttToday) return toast.error("Check in first"); if (myAttToday.checkOut) return toast.info("Already checked out"); checkOut(); toast.success("Checked out"); }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Check Out {myAttToday?.checkOut && `(${myAttToday.checkOut})`}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={ListTodo} label="Today's Tasks" value={todayTasks.length} tint="info" />
          <Stat icon={Clock} label="Pending Tasks" value={pending.length} tint="warning" />
          <Stat icon={CheckCircle2} label="Completed" value={completed.length} tint="success" />
          <Stat icon={TrendingUp} label="Productivity" value={`${Math.min(100, completed.length * 20)}%`} tint="primary" />
        </div>

        {isLeadership && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Users} label="Total Employees" value={approvedUsers.length} tint="primary" />
            <Stat icon={AlertCircle} label="Pending Approvals" value={pendingApprovals} tint="warning" />
            <Stat icon={ListTodo} label="Tasks Assigned" value={allTasks.length} tint="info" />
            <Stat icon={CheckCircle2} label="Tasks Completed" value={tasksDone} tint="success" />
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>My tasks</CardTitle></CardHeader>
            <CardContent>
              {myTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No tasks assigned yet.</p>
              ) : (
                <ul className="divide-y">
                  {myTasks.slice(0, 6).map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{t.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{t.description}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PriorityBadge p={t.priority} />
                        <StatusBadge s={t.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Task distribution</CardTitle></CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskStatusData} dataKey="value" nameKey="name" outerRadius={70} innerRadius={40}>
                    {taskStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {isLeadership && (
          <Card>
            <CardHeader><CardTitle>Employees by department</CardTitle></CardHeader>
            <CardContent style={{ height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="employees" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: typeof Clock; label: string; value: number | string; tint: "primary" | "success" | "warning" | "info" }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
  } as const;
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${map[tint]}`}><Icon className="h-5 w-5" /></div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = { LOW: "bg-muted text-muted-foreground", MEDIUM: "bg-info/15 text-info", HIGH: "bg-warning/20 text-warning-foreground", CRITICAL: "bg-destructive/15 text-destructive" };
  return <Badge variant="outline" className={`${map[p]} border-transparent`}>{p}</Badge>;
}
function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    ASSIGNED: "bg-info/15 text-info",
    IN_PROGRESS: "bg-warning/20 text-warning-foreground",
    COMPLETED: "bg-success/15 text-success",
    POSTPONED: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
    PENDING_APPROVAL: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
    APPROVED: "bg-success/15 text-success",
    REJECTED: "bg-destructive/15 text-destructive",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return <Badge variant="outline" className={`${map[s] ?? ""} border-transparent`}>{s.replace("_", " ")}</Badge>;
}

export { PriorityBadge, StatusBadge };
