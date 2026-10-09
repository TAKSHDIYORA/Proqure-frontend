import { api } from "./client";

export interface OrganizationData {
  _id: string;
  name: string;
  businessRegistrationCode: string;
  capabilities: string[];
  description?: string;
  email: string;
  phone?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  marketplaceVisible: boolean;
  createdAt?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  phone?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  marketplaceVisible?: boolean;
}

export const organizationApi = {
  getMyOrganization: async (): Promise<{ organization: OrganizationData }> => {
    const res = await api.get("/organizations/me");
    return res.data;
  },

  updateMyOrganization: async (
    data: UpdateOrganizationInput
  ): Promise<{ message: string; organization: OrganizationData }> => {
    const res = await api.patch("/organizations/me", data);
    return res.data;
  },
};
