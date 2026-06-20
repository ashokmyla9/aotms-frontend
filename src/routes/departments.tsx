import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp, canManageUsers } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEPARTMENTS, ROLE_LABELS } from "@/lib/types";

export const Route = createFileRoute("/departments")({ component: Departments });

function Departments() {
  const { currentUser, state } = useApp();
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return <AppLayout><div className="text-sm text-muted-foreground">Restricted.</div></AppLayout>;
  }
  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Departments</h2>
          <p className="text-sm text-muted-foreground">Organisational structure across the academy.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DEPARTMENTS.map((d) => {
            const members = state.users.filter((u) => u.department === d && u.status === "APPROVED");
            return (
              <Card key={d}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{d}</CardTitle>
                  <Badge variant="outline">{members.length} {members.length === 1 ? "member" : "members"}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No members yet.</p>
                  ) : (
                    members.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: m.avatarColor }}>
                          {m.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{m.fullName}</div>
                          <div className="text-xs text-muted-foreground truncate">{ROLE_LABELS[m.role]}</div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
