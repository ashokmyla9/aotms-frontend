import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useApp, canManageUsers } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { DEPARTMENTS, ROLE_LABELS, type Role, type User, type Department } from "@/lib/types";

export const Route = createFileRoute("/employees")({ component: Employees });

function Employees() {
  const { currentUser, state, approveUser, rejectUser, updateUser } = useApp();
  const [editing, setEditing] = useState<User | null>(null);
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return <AppLayout><div className="text-sm text-muted-foreground">Restricted.</div></AppLayout>;
  }

  const pending = state.users.filter((u) => u.status === "PENDING");
  const approved = state.users.filter((u) => u.status === "APPROVED");
  const rejected = state.users.filter((u) => u.status === "REJECTED");

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">Employee Management</h2>
          <p className="text-sm text-muted-foreground">Approve registrations, manage roles, and edit profiles.</p>
        </div>
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending"><UserTable users={pending} onEdit={setEditing} onApprove={approveUser} onReject={rejectUser} showActions /></TabsContent>
          <TabsContent value="approved"><UserTable users={approved} onEdit={setEditing} /></TabsContent>
          <TabsContent value="rejected"><UserTable users={rejected} onEdit={setEditing} /></TabsContent>
        </Tabs>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit employee</DialogTitle></DialogHeader>
          {editing && (
            <EditForm
              user={editing}
              onSave={(patch) => { updateUser(editing.id, patch); toast.success("Employee updated"); setEditing(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function UserTable({
  users, onEdit, onApprove, onReject, showActions,
}: {
  users: User[];
  onEdit: (u: User) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: u.avatarColor }}>
                      {u.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{u.fullName}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{ROLE_LABELS[u.role]}</TableCell>
                <TableCell className="text-sm">{u.department}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    u.status === "APPROVED" ? "border-transparent bg-success/15 text-success" :
                    u.status === "PENDING" ? "border-transparent bg-warning/20 text-warning-foreground" :
                    "border-transparent bg-destructive/15 text-destructive"
                  }>{u.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {showActions && onApprove && onReject && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => onReject(u.id)}>Reject</Button>
                      <Button size="sm" onClick={() => { onApprove(u.id); toast.success("Approved"); }}>Approve</Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => onEdit(u)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No employees.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EditForm({ user, onSave }: { user: User; onSave: (patch: Partial<User>) => void }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<Role>(user.role);
  const [department, setDepartment] = useState<Department>(user.department);
  return (
    <>
      <div className="space-y-3">
        <div className="space-y-1.5"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Select value={department} onValueChange={(v) => setDepartment(v as Department)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter><Button onClick={() => onSave({ fullName, email, role, department })}>Save changes</Button></DialogFooter>
    </>
  );
}
