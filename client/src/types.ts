// Typescript types should mirror shapes returned by the api
export interface Project {
  id: ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ObjectId = string;
export type Role = "admin" | "user";

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  expires: string;
  user: User;
}

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) => Promise<void>;
  logout: () => void;
};

export interface RegisterPayload {
  user: User;
}
export interface ApiErrorResponse {
  message?: string;
  errors?: ValidationFieldError[];
}
export interface ValidationFieldError {
  field: string;
  msg: string;
}

export interface Project {
  _id: ObjectId;
  name: string;
  projectNumber: string;
  status: ProjectStatus;
  projectType: ProjectType;
  owner: ObjectId | User;
  startDate: Date;
  completionDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectType = "core" | "innovation" | "research" | "collaboration";
export type ProjectStatus = "open" | "in-progress" | "completed" | "pending";

export interface Task {
  _id: ObjectId;
  title: string;
  taskNumber: string;
  description?: string;
  status: ProjectStatus;
  assignedTo?: ObjectId | User;
  project?: ObjectId | Project;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardData {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  recentTasks: Task[];
  totalProjects: number;
  totalUsers: number;
}
