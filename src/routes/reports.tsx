import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

export const Route = createFileRoute("/reports")({ component: Reports });

function Reports() {
  const { state } = useApp();
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.status === "COMPLETED").length;
  const pending = state.tasks.filter((t) => ["ASSIGNED", "IN_PROGRESS"].includes(t.status)).length;
  const approved = state.users.filter((u) => u.status === "APPROVED").length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const attendedToday = state.attendance.filter((a) => a.date === todayStr).length;
  const attendancePct = approved ? Math.round((attendedToday / approved) * 100) : 0;
  const productivity = total ? Math.round((completed / total) * 100) : 0;

  const weekly = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString("en", { weekday: "short" }), tasks: Math.round(Math.random() * 6) + 2, completed: Math.round(Math.random() * 5) + 1 };
  });
  const monthly = Array.from({ length: 4 }).map((_, i) => ({ week: `W${i + 1}`, productivity: 60 + Math.round(Math.random() * 30) }));

  const Metric = ({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) => (
    <Card><CardContent className="p-5"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-bold">{value}{suffix}</div></CardContent></Card>
  );

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">Daily, weekly, and monthly performance metrics.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Tasks Assigned" value={total} />
          <Metric label="Tasks Completed" value={completed} />
          <Metric label="Tasks Pending" value={pending} />
          <Metric label="Attendance" value={attendancePct} suffix="%" />
        </div>

        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <Card><CardHeader><CardTitle>Today's productivity</CardTitle></CardHeader>
              <CardContent className="space-y-2 p-6">
                <div className="text-4xl font-bold">{productivity}%</div>
                <p className="text-sm text-muted-foreground">Based on {completed} completed of {total} assigned tasks.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="weekly">
            <Card><CardHeader><CardTitle>Weekly task throughput</CardTitle></CardHeader>
              <CardContent style={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="monthly">
            <Card><CardHeader><CardTitle>Productivity score</CardTitle></CardHeader>
              <CardContent style={{ height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="productivity" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
