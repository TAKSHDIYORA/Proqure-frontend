import { api } from "./client";

export interface MarketplaceOrg {
  _id: string;
  name: string;
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

export interface MarketplaceProduct {
  _id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  productType: string;
  unitOfMeasure: string;
  minimumOrderQuantity: number;
  marketplacePrice?: number;
}

export const marketplaceApi = {
  searchOrganizations: async (params?: {
    search?: string;
    capability?: string;
  }): Promise<{ count: number; organizations: MarketplaceOrg[] }> => {
    const res = await api.get("/marketplace/organizations", { params });
    return res.data;
  },

  getOrganizationProfile: async (
    id: string
  ): Promise<{
    organization: MarketplaceOrg;
    products: MarketplaceProduct[];
  }> => {
    const res = await api.get(`/marketplace/organizations/${id}`);
    return res.data;
  },
};
