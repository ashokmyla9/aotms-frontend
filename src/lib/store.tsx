import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AttendanceRecord,
  AuditEntry,
  NotificationItem,
  Role,
  Task,
  User,
} from "./types";

const STORAGE_KEY = "aotms_state_v1";
const SESSION_KEY = "aotms_session_v1";

interface AppState {
  users: User[];
  tasks: Task[];
  attendance: AttendanceRecord[];
  notifications: NotificationItem[];
  audit: AuditEntry[];
}

const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const pickColor = (s: string) =>
  COLORS[Math.abs([...s].reduce((a, c) => a + c.charCodeAt(0), 0)) % COLORS.length];

const seedUsers: User[] = [
  { id: "u1", fullName: "Aarav Sharma", email: "ceo@aotms.com", role: "SUPER_ADMIN", department: "Management", status: "APPROVED", joinedAt: "2023-01-10", avatarColor: pickColor("u1") },
  { id: "u2", fullName: "Priya Verma", email: "hr@aotms.com", role: "ADMIN", department: "Human Resources", status: "APPROVED", joinedAt: "2023-02-04", avatarColor: pickColor("u2") },
  { id: "u3", fullName: "Rohan Iyer", email: "cto@aotms.com", role: "CTO", department: "Development", status: "APPROVED", joinedAt: "2023-01-22", avatarColor: pickColor("u3") },
  { id: "u4", fullName: "Neha Kapoor", email: "bdm@aotms.com", role: "BDM", department: "Business Development", status: "APPROVED", joinedAt: "2023-03-15", avatarColor: pickColor("u4") },
  { id: "u5", fullName: "Vikram Singh", email: "marketing@aotms.com", role: "MARKETING", department: "Digital Marketing", status: "APPROVED", joinedAt: "2023-04-02", avatarColor: pickColor("u5") },
  { id: "u6", fullName: "Sneha Rao", email: "trainer@aotms.com", role: "TRAINER", department: "Training", status: "APPROVED", joinedAt: "2023-05-18", avatarColor: pickColor("u6") },
  { id: "u7", fullName: "Arjun Mehta", email: "dev@aotms.com", role: "DEVELOPER", department: "Development", status: "APPROVED", joinedAt: "2023-06-10", avatarColor: pickColor("u7") },
  { id: "u8", fullName: "Kavya Nair", email: "kavya@aotms.com", role: "DEVELOPER", department: "Development", status: "PENDING", joinedAt: today(), avatarColor: pickColor("u8") },
  { id: "u9", fullName: "Ishaan Gupta", email: "ishaan@aotms.com", role: "TRAINER", department: "Training", status: "PENDING", joinedAt: today(), avatarColor: pickColor("u9") },
];

const seedTasks: Task[] = [
  { id: "t1", name: "Q4 Curriculum Review", description: "Review and finalize the Q4 React curriculum.", priority: "HIGH", status: "IN_PROGRESS", assignedById: "u1", assignedToId: "u6", dueDate: today(), createdAt: now() },
  { id: "t2", name: "Onboard 3 new hires", description: "Complete HR onboarding for new dev hires.", priority: "MEDIUM", status: "ASSIGNED", assignedById: "u1", assignedToId: "u2", dueDate: today(), createdAt: now() },
  { id: "t3", name: "Landing page redesign", description: "Ship new landing page hero and CTA.", priority: "CRITICAL", status: "PENDING_APPROVAL", assignedById: "u3", assignedToId: "u7", dueDate: today(), createdAt: now(), completionRemarks: "Deployed to staging, awaiting review." },
  { id: "t4", name: "Lead pipeline report", description: "Prepare weekly lead pipeline report.", priority: "MEDIUM", status: "COMPLETED", assignedById: "u1", assignedToId: "u4", dueDate: today(), createdAt: now(), approvedById: "u1", approvedAt: now(), completionRemarks: "Report shared with leadership." },
  { id: "t5", name: "Ad campaign launch", description: "Launch new LinkedIn ad campaign.", priority: "HIGH", status: "POSTPONED", assignedById: "u2", assignedToId: "u5", dueDate: today(), createdAt: now(), postponedReason: "Creative assets pending", expectedCompletion: today() },
];

const seedAttendance: AttendanceRecord[] = seedUsers
  .filter((u) => u.status === "APPROVED")
  .map((u) => ({ id: uid(), userId: u.id, date: today(), checkIn: "09:1" + Math.floor(Math.random() * 9) }));

const initial: AppState = {
  users: seedUsers,
  tasks: seedTasks,
  attendance: seedAttendance,
  notifications: [
    { id: uid(), userId: "u1", title: "New registration", body: "Kavya Nair requested access", type: "REGISTRATION", read: false, createdAt: now() },
    { id: uid(), userId: "u1", title: "Task pending approval", body: "Landing page redesign awaiting review", type: "APPROVAL", read: false, createdAt: now() },
  ],
  audit: [
    { id: uid(), userId: "u1", action: "LOGIN", timestamp: now(), ip: "127.0.0.1" },
  ],
};

interface Ctx {
  updateTask: (
    id: string,
    patch: Partial<Task>
  ) => void;
  state: AppState;
  currentUser: User | null;
  login: (email: string) => User | null;
  logout: () => void;
  register: (data: { fullName: string; email: string; role: Role; department: User["department"] }) => void;
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  createTask: (t: Omit<Task, "id" | "createdAt" | "status">) => void;
  updateTaskStatus: (id: string, patch: Partial<Task>) => void;
  approveTask: (id: string, by: string) => void;
  rejectTask: (id: string, by: string, remarks: string) => void;
  checkIn: () => void;
  checkOut: () => void;
  markNotificationRead: (id: string) => void;
  log: (action: string, target?: string) => void;
}

const AppContext = createContext<Ctx | null>(null);

function load(): AppState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { }
  return initial;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setState(load());
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setCurrentUserId(s);
    } catch { }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { }
  }, [state]);

  useEffect(() => {
    try {
      if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
      else localStorage.removeItem(SESSION_KEY);
    } catch { }
  }, [currentUserId]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === currentUserId) ?? null,
    [state.users, currentUserId]
  );

  const pushNotif = (userId: string, title: string, body: string, type: string) =>
    setState((s) => ({
      ...s,
      notifications: [{ id: uid(), userId, title, body, type, read: false, createdAt: now() }, ...s.notifications],
    }));

  const pushAudit = (userId: string, action: string, target?: string) =>
    setState((s) => ({
      ...s,
      audit: [{ id: uid(), userId, action, target, timestamp: now(), ip: "127.0.0.1" }, ...s.audit],
    }));

  const ctx: Ctx = {
    updateTask: (id, patch) => {
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === id
            ? { ...t, ...patch }
            : t
        ),
      }));

      if (currentUser) {
        pushAudit(
          currentUser.id,
          "TASK_EDITED",
          id
        );
      }
    },
    state,
    currentUser,
    login: (email) => {
      const u = state.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (!u) return null;
      if (u.status !== "APPROVED") return u;
      setCurrentUserId(u.id);
      pushAudit(u.id, "LOGIN");
      return u;
    },
    logout: () => {
      if (currentUser) pushAudit(currentUser.id, "LOGOUT");
      setCurrentUserId(null);
    },
    register: (data) => {
      const id = uid();
      const newUser: User = {
        id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        department: data.department,
        status: "PENDING",
        joinedAt: today(),
        avatarColor: pickColor(id),
      };
      setState((s) => ({ ...s, users: [...s.users, newUser] }));
      const ceo = state.users.find((u) => u.role === "SUPER_ADMIN");
      if (ceo) pushNotif(ceo.id, "New registration", `${data.fullName} requested access`, "REGISTRATION");
    },
    approveUser: (id) => {
      setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, status: "APPROVED" } : u)) }));
      const u = state.users.find((x) => x.id === id);
      if (u) pushNotif(u.id, "Account approved", "Your access has been granted", "USER_APPROVED");
      if (currentUser) pushAudit(currentUser.id, "USER_APPROVED", id);
    },
    rejectUser: (id) => {
      setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, status: "REJECTED" } : u)) }));
      if (currentUser) pushAudit(currentUser.id, "USER_REJECTED", id);
    },
    updateUser: (id, patch) => {
      setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
      if (currentUser) pushAudit(currentUser.id, "USER_UPDATED", id);
    },
    createTask: (t) => {
      const id = uid();
      setState((s) => ({ ...s, tasks: [{ ...t, id, status: "ASSIGNED", createdAt: now() }, ...s.tasks] }));
      pushNotif(t.assignedToId, "Task assigned", t.name, "TASK_ASSIGNED");
      if (currentUser) pushAudit(currentUser.id, "TASK_CREATED", id);
    },
    updateTaskStatus: (id, patch) => {
      setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
      if (currentUser) pushAudit(currentUser.id, "TASK_UPDATED", id);
      if (patch.status === "POSTPONED") {
        state.users.filter((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN").forEach((u) =>
          pushNotif(u.id, "Task postponed", `${patch.postponedReason ?? ""}`, "TASK_POSTPONED")
        );
      }
      if (patch.status === "PENDING_APPROVAL") {
        state.users.filter((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN").forEach((u) =>
          pushNotif(u.id, "Task awaiting approval", "Review required", "TASK_COMPLETED")
        );
      }
      if (patch.status === "CANCELLED") {
        state.users
          .filter(
            (u) =>
              u.role === "SUPER_ADMIN" ||
              u.role === "ADMIN" ||
              u.role === "CTO"
          )
          .forEach((u) =>
            pushNotif(
              u.id,
              "Task Cancelled",
              `Task ${id} has been cancelled`,
              "TASK_CANCELLED"
            )
          );
      }
    },
    approveTask: (id, by) => {
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: "COMPLETED", approvedById: by, approvedAt: now() } : t)),
      }));
      const task = state.tasks.find((t) => t.id === id);
      if (task) pushNotif(task.assignedToId, "Task approved", task.name, "TASK_APPROVED");
      pushAudit(by, "TASK_APPROVED", id);
    },
    rejectTask: (id, by, remarks) => {
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: "IN_PROGRESS", rejectionRemarks: remarks } : t)),
      }));
      const task = state.tasks.find((t) => t.id === id);
      if (task) pushNotif(task.assignedToId, "Task rejected", remarks, "TASK_REJECTED");
      pushAudit(by, "TASK_REJECTED", id);
    },
    checkIn: () => {
      if (!currentUser) return;
      const time = new Date().toTimeString().slice(0, 5);
      setState((s) => {
        const existing = s.attendance.find((a) => a.userId === currentUser.id && a.date === today());
        if (existing) return s;
        return { ...s, attendance: [...s.attendance, { id: uid(), userId: currentUser.id, date: today(), checkIn: time }] };
      });
      pushAudit(currentUser.id, "CHECK_IN");
    },
    checkOut: () => {
      if (!currentUser) return;
      const time = new Date().toTimeString().slice(0, 5);
      setState((s) => ({
        ...s,
        attendance: s.attendance.map((a) =>
          a.userId === currentUser.id && a.date === today() ? { ...a, checkOut: time } : a
        ),
      }));
      pushAudit(currentUser.id, "CHECK_OUT");
    },
    markNotificationRead: (id) => {
      setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
    },
    log: (action, target) => currentUser && pushAudit(currentUser.id, action, target),
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp must be within AppProvider");
  return c;
}

//export const canManageTasks = (role?: Role) => role === "SUPER_ADMIN" || role === "ADMIN";
export const canManageTasks = (role?: Role) => {
  return (
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "CTO" ||
    role === "DEVELOPER" ||
    role === "TRAINER" ||
    role === "BDM" ||
    role === "MARKETING"
  );
};
export const canManageUsers = (role?: Role) => role === "SUPER_ADMIN" || role === "ADMIN";
export const isSuperAdmin = (role?: Role) => role === "SUPER_ADMIN";
