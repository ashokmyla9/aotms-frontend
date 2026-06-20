import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp, canManageTasks } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { PriorityBadge } from "./dashboard";

export const Route = createFileRoute("/approvals")({ component: Approvals });

function Approvals() {
  const { currentUser, state, approveTask, rejectTask } = useApp();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  if (!currentUser || !canManageTasks(currentUser.role)) {
    return <AppLayout><div className="text-sm text-muted-foreground">You don't have permission to view this page.</div></AppLayout>;
  }

  const queue = state.tasks.filter((t) => t.status === "PENDING_APPROVAL");
  const user = (id: string) => state.users.find((u) => u.id === id);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Approval Queue</h2>
          <p className="text-sm text-muted-foreground">Review tasks marked complete by employees and approve or return with remarks.</p>
        </div>
        {queue.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No tasks awaiting approval.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {queue.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-5 flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{t.name}</h3>
                      <PriorityBadge p={t.priority} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                    {t.completionRemarks && (
                      <div className="mt-3 rounded-md bg-muted p-3 text-sm">
                        <div className="text-xs font-semibold uppercase text-muted-foreground">Employee remarks</div>
                        <div className="mt-1">{t.completionRemarks}</div>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Completed by <span className="font-medium text-foreground">{user(t.assignedToId)?.fullName}</span> · Due {t.dueDate}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setRejectId(t.id)}>Reject</Button>
                    <Button onClick={() => { approveTask(t.id, currentUser.id); toast.success("Task approved & archived"); }}>Approve</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject task</DialogTitle></DialogHeader>
          <div className="space-y-1.5"><Label>Remarks for employee</Label><Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!rejectId) return;
              rejectTask(rejectId, currentUser.id, remarks || "Please revise");
              toast.success("Task returned to employee");
              setRejectId(null); setRemarks("");
            }}>Send back</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
