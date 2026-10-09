import { api } from "./client";

export type UserRole =
  | "ADMIN"
  | "PROCUREMENT_MANAGER"
  | "PROCUREMENT_OFFICER"
  | "WAREHOUSE_MANAGER"
  | "FINANCE_MANAGER"
  | "SALES_MANAGER"
  | "EMPLOYEE";

export interface UserItem {
  _id: string;
  id?: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: UserRole;
}

export const usersApi = {
  getUsers: async (): Promise<{ count: number; users: UserItem[] }> => {
    const res = await api.get("/users");
    return res.data;
  },

  getUserById: async (id: string): Promise<{ user: UserItem }> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (
    data: CreateUserInput
  ): Promise<{ message: string; user: UserItem }> => {
    const res = await api.post("/users", data);
    return res.data;
  },

  updateUser: async (
    id: string,
    data: UpdateUserInput
  ): Promise<{ message: string; user: UserItem }> => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },

  updateUserStatus: async (
    id: string,
    isActive: boolean
  ): Promise<{ message: string; user: UserItem }> => {
    const res = await api.patch(`/users/${id}/status`, { isActive });
    return res.data;
  },
};
