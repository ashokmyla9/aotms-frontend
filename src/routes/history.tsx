import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DEPARTMENTS } from "@/lib/types";

export const Route = createFileRoute("/history")({ component: History });

function History() {
  const { state } = useApp();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("ALL");

  const records = useMemo(() => {
    return state.tasks
      .filter((t) => t.status === "COMPLETED")
      .filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()))
      .filter((t) => {
        if (dept === "ALL") return true;
        const u = state.users.find((x) => x.id === t.assignedToId);
        return u?.department === dept;
      })
      .sort((a, b) => (a.approvedAt ?? "") < (b.approvedAt ?? "") ? 1 : -1);
  }, [state, q, dept]);

  const u = (id: string) => state.users.find((x) => x.id === id);

  const exportPdf = () => {
    const html = `<html><head><title>Task History</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f3f4f6}</style></head><body><h1>AOTMS Task History</h1><table><thead><tr><th>Task</th><th>Employee</th><th>Department</th><th>Approved by</th><th>Date</th></tr></thead><tbody>${records.map((r) => `<tr><td>${r.name}</td><td>${u(r.assignedToId)?.fullName ?? ""}</td><td>${u(r.assignedToId)?.department ?? ""}</td><td>${u(r.approvedById ?? "")?.fullName ?? ""}</td><td>${(r.approvedAt ?? "").slice(0, 10)}</td></tr>`).join("")}</tbody></table></body></html>`;
    const w = window.open("", "_blank"); if (!w) return toast.error("Popup blocked");
    w.document.write(html); w.document.close(); setTimeout(() => w.print(), 300);
  };

  const exportXlsx = () => {
    const rows = [["Task", "Employee", "Department", "Approved By", "Date", "Remarks"]];
    records.forEach((r) => rows.push([r.name, u(r.assignedToId)?.fullName ?? "", u(r.assignedToId)?.department ?? "", u(r.approvedById ?? "")?.fullName ?? "", (r.approvedAt ?? "").slice(0, 10), r.completionRemarks ?? ""]));
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "task_history.csv"; a.click(); URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Task History</h2>
          <p className="text-sm text-muted-foreground">All approved tasks — permanently retained for audit.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input className="max-w-xs" placeholder="Search tasks..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All departments</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={exportXlsx}>Export Excel</Button>
            <Button onClick={exportPdf}>Export PDF</Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.completionRemarks}</div>
                    </TableCell>
                    <TableCell className="text-sm">{u(r.assignedToId)?.fullName}</TableCell>
                    <TableCell className="text-sm">{u(r.assignedToId)?.department}</TableCell>
                    <TableCell className="text-sm">{u(r.approvedById ?? "")?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-sm">{(r.approvedAt ?? "").slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No history yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
