import { api } from "./client";

export interface User {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  role: string;
  tenantId?: string;
}

export interface RegisterPayload {
  organizationName: string;
  businessRegistrationCode: string;
  capabilities: ("MANUFACTURER" | "SUPPLIER")[];
  organizationEmail: string;
  fullName: string;
  email: string;
  password: string;
}

export interface Organization {
  _id: string;
  name: string;
  businessRegistrationCode: string;
  capabilities: string[];
  email: string;
  phone?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  organization: Organization;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};
