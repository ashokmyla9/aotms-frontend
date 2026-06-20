export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CTO"
  | "BDM"
  | "MARKETING"
  | "TRAINER"
  | "DEVELOPER";

export type AccountStatus = "PENDING" | "APPROVED" | "REJECTED";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin (CEO)",
  ADMIN: "Admin (HR)",
  CTO: "CTO",
  BDM: "Business Development",
  MARKETING: "Digital Marketing",
  TRAINER: "Trainer",
  DEVELOPER: "Developer",
};

export const DEPARTMENTS = [
  "Human Resources",
  "Development",
  "Training",
  "Digital Marketing",
  "Business Development",
  "Management",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  department: Department;
  status: AccountStatus;
  phone?: string;
  joinedAt: string;
  avatarColor: string;
}

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_APPROVAL"
  | "COMPLETED"
  | "POSTPONED"
  | "CANCELLED";

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  assignedById: string;
  assignedToId: string;
  dueDate: string;
  createdAt: string;
  postponedReason?: string;
  expectedCompletion?: string;
  completionRemarks?: string;
  rejectionRemarks?: string;
  approvedById?: string;
  approvedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  target?: string;
  timestamp: string;
  ip: string;
}
