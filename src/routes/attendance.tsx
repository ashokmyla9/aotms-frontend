import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp, canManageUsers } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/attendance")({ component: Attendance });

function Attendance() {
  const { currentUser, state, checkIn, checkOut } = useApp();
  const [filterUser, setFilterUser] = useState<string>("ALL");
  if (!currentUser) return <AppLayout><div /></AppLayout>;
  const isManager = canManageUsers(currentUser.role);

  const records = useMemo(() => {
    const list = isManager ? state.attendance : state.attendance.filter((a) => a.userId === currentUser.id);
    const f = filterUser === "ALL" ? list : list.filter((a) => a.userId === filterUser);
    return [...f].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [state.attendance, isManager, currentUser, filterUser]);

  const userById = (id: string) => state.users.find((u) => u.id === id);
  const today = new Date().toISOString().slice(0, 10);
  const myToday = state.attendance.find((a) => a.userId === currentUser.id && a.date === today);

  const calcHours = (a?: string, b?: string) => {
    if (!a || !b) return "—";
    const [h1, m1] = a.split(":").map(Number); const [h2, m2] = b.split(":").map(Number);
    const m = h2 * 60 + m2 - (h1 * 60 + m1);
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  const exportCsv = () => {
    const rows = [["Date", "Employee", "Check In", "Check Out", "Hours"]];
    records.forEach((r) => rows.push([r.date, userById(r.userId)?.fullName ?? "", r.checkIn ?? "", r.checkOut ?? "", calcHours(r.checkIn, r.checkOut)]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "attendance.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance exported");
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Attendance</h2>
            <p className="text-sm text-muted-foreground">Daily check-in/out with monthly tracking and exports.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { if (myToday) return toast.info("Already checked in"); checkIn(); toast.success("Checked in"); }}>
              <LogIn className="mr-2 h-4 w-4" /> Check In
            </Button>
            <Button variant="outline" onClick={() => { if (!myToday) return toast.error("Check in first"); if (myToday.checkOut) return toast.info("Already checked out"); checkOut(); toast.success("Checked out"); }}>
              <LogOut className="mr-2 h-4 w-4" /> Check Out
            </Button>
            <Button onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>

        {isManager && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All employees</SelectItem>
                {state.users.filter((u) => u.status === "APPROVED").map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{userById(r.userId)?.fullName}</TableCell>
                    <TableCell>{r.checkIn ?? "—"}</TableCell>
                    <TableCell>{r.checkOut ?? "—"}</TableCell>
                    <TableCell>{calcHours(r.checkIn, r.checkOut)}</TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No records.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
