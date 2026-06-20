import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp, canManageTasks } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Play, CheckCircle2, PauseCircle, Loader2, XCircle, } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PriorityBadge, StatusBadge } from "./dashboard";
import type { Priority, TaskStatus } from "@/lib/types";

export const Route = createFileRoute("/tasks")({ component: Tasks });

function Tasks() {
  const {
    currentUser,
    state,
    createTask,
    updateTaskStatus,
    updateTask,
  } = useApp();
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useState<string>("ALL");
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  if (!currentUser) return <AppLayout><div /></AppLayout>;
  const isManager = canManageTasks(currentUser.role);

  const tasks = useMemo(() => {
    const list = (
      isManager
        ? state.tasks
        : state.tasks.filter(
          (t) => t.assignedToId === currentUser.id
        )
    ).filter((t) => t.status !== "CANCELLED");
    //const list = isManager ? state.tasks : state.tasks.filter((t) => t.assignedToId === currentUser.id);
    return filter === "ALL" ? list : list.filter((t) => t.status === filter);
  }, [state.tasks, isManager, currentUser, filter]);

  const userById = (id: string) => state.users.find((u) => u.id === id);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Task Management</h2>
            <p className="text-sm text-muted-foreground">
              {isManager ? "Create, assign, and monitor team tasks." : "Update status on your assigned tasks."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="POSTPONED">Postponed</SelectItem>
                <SelectItem value="CANCELLED">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
            {isManager && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
                </DialogTrigger>
                <CreateTaskDialog onClose={() => setOpen(false)} />
              </Dialog>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden md:table-cell">Assigned to</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Due</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{t.description}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{userById(t.assignedToId)?.fullName}</TableCell>
                    <TableCell><PriorityBadge p={t.priority} /></TableCell>
                    <TableCell><StatusBadge s={t.status} /></TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {t.status === "POSTPONED"
                        ? t.expectedCompletion
                        : t.dueDate}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.assignedToId === currentUser.id && ["ASSIGNED", "IN_PROGRESS", "POSTPONED"].includes(t.status) ? (
                        <UpdateStatus
                          task={t}
                          onUpdate={(patch) => {
                            updateTaskStatus(t.id, patch);
                            toast.success("Task updated");
                          }}
                          onEdit={() => {
                            setSelectedTask(t);
                            setEditOpen(true);
                          }}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {tasks.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No tasks match this filter.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Dialog
          open={editOpen}
          onOpenChange={setEditOpen}
        >
          {selectedTask && (
            <EditTaskDialog
              task={selectedTask}
              onClose={() => {
                setEditOpen(false);
                setSelectedTask(null);
              }}
            />
          )}
        </Dialog>
      </div>
    </AppLayout>
  );

  function CreateTaskDialog({ onClose }: { onClose: () => void }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("MEDIUM");
    const [assignedToId, setAssignedToId] = useState(state.users.find((u) => u.status === "APPROVED" && u.id !== currentUser!.id)?.id ?? "");
    const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

    return (
      <DialogContent>
        <DialogHeader><DialogTitle>Create new task</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Task name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Assign to</Label>
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {state.users.filter((u) => u.status === "APPROVED").map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.fullName} — {u.department}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!name || !assignedToId) return toast.error("Name and assignee are required");
            createTask({ name, description, priority, assignedById: currentUser!.id, assignedToId, dueDate });
            toast.success("Task created and assigned");
            onClose();
          }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    );
  }
}

function UpdateStatus({
  task,
  onUpdate,
  onEdit,
}: {
  task: {
    id: string;
    status: TaskStatus;
  };
  onUpdate: (
    p: Partial<{
      status: TaskStatus;
      completionRemarks: string;
      postponedReason: string;
      expectedCompletion: string;
    }>
  ) => void;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"complete" | "postpone" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [reason, setReason] = useState("");
  const [eta, setEta] = useState(new Date().toISOString().slice(0, 10));

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Update status</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onEdit}>
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {task.status === "ASSIGNED" && (
            <DropdownMenuItem onClick={() => onUpdate({ status: "IN_PROGRESS" })}>
              <Play className="h-4 w-4" /> Start task
            </DropdownMenuItem>
          )}
          {task.status === "POSTPONED" && (
            <DropdownMenuItem
              onClick={() =>
                onUpdate({
                  status: "IN_PROGRESS",
                })
              }
            >
              <Play className="h-4 w-4" />
              Resume Task
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => { setMode("complete"); setOpen(true); }}>
            <CheckCircle2 className="h-4 w-4" /> Mark complete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setMode("postpone"); setOpen(true); }}>
            <PauseCircle className="h-4 w-4" /> Put on hold / Postpone
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600"
            onClick={() => {
              onUpdate({
                status: "CANCELLED" as TaskStatus,
              });

              toast.success("Task cancelled");
            }}
          >
            <XCircle className="h-4 w-4" />
            Cancel Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{mode === "complete" ? "Mark complete" : "Postpone task"}</DialogTitle></DialogHeader>
          {mode === "complete" ? (
            <div className="space-y-2"><Label>Completion remarks</Label><Textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Postponed reason</Label><Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Expected completion</Label><Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (mode === "complete") {
                onUpdate({ status: "PENDING_APPROVAL", completionRemarks: remarks });
              } else {
                if (!reason) return toast.error("Reason is required");
                onUpdate({ status: "POSTPONED", postponedReason: reason, expectedCompletion: eta });
              }
              setOpen(false);
            }}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditTaskDialog({
  task,
  onClose,
}: {
  task: any;
  onClose: () => void;
}) {
  const { state, updateTask } = useApp();

  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [assignedToId, setAssignedToId] = useState(task.assignedToId);
  const [dueDate, setDueDate] = useState(task.dueDate);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Task Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Priority</Label>

            <Select
              value={priority}
              onValueChange={(v) =>
                setPriority(v as Priority)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="LOW">LOW</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="CRITICAL">CRITICAL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Due Date</Label>

            <Input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Assign To</Label>

          <Select
            value={assignedToId}
            onValueChange={setAssignedToId}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {state.users
                .filter(
                  (u) => u.status === "APPROVED"
                )
                .map((u) => (
                  <SelectItem
                    key={u.id}
                    value={u.id}
                  >
                    {u.fullName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          onClick={() => {
            updateTask(task.id, {
              name,
              description,
              priority,
              assignedToId,
              dueDate,
            });

            toast.success(
              "Task updated successfully"
            );

            onClose();
          }}
        >
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}