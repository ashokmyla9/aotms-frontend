import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const { currentUser, state, markNotificationRead } = useApp();
  if (!currentUser) return <AppLayout><div /></AppLayout>;
  const list = state.notifications.filter((n) => n.userId === currentUser.id);
  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">Real-time alerts for events relevant to you.</p>
          </div>
          <Button variant="outline" onClick={() => list.forEach((n) => !n.read && markNotificationRead(n.id))}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        </div>
        {list.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No notifications.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {list.map((n) => (
              <Card key={n.id} className={n.read ? "opacity-70" : ""}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Bell className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{n.title}</div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-destructive" />}
                    </div>
                    <div className="text-sm text-muted-foreground">{n.body}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => markNotificationRead(n.id)}>Mark read</Button>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
