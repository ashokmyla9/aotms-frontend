import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp, isSuperAdmin } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/audit")({ component: Audit });

function Audit() {
  const { currentUser, state } = useApp();
  if (!currentUser || !isSuperAdmin(currentUser.role)) {
    return <AppLayout><div className="text-sm text-muted-foreground">Super Admin only.</div></AppLayout>;
  }
  const u = (id: string) => state.users.find((x) => x.id === id);
  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Audit Log</h2>
          <p className="text-sm text-muted-foreground">All sensitive actions recorded — immutable.</p>
        </div>
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.audit.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{u(a.userId)?.fullName ?? a.userId}</TableCell>
                  <TableCell><Badge variant="outline">{a.action}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.target ?? "—"}</TableCell>
                  <TableCell className="text-xs">{a.ip}</TableCell>
                  <TableCell className="text-xs">{new Date(a.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
