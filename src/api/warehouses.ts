import { api } from "./client";

export interface Warehouse {
  _id: string;
  tenantId: string;
  name: string;
  locationCode: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export const warehouseApi = {
  getWarehouses: async (params?: { status?: string; search?: string }): Promise<{ count: number; warehouses: Warehouse[] }> => {
    const res = await api.get("/warehouses", { params });
    return res.data;
  },

  getWarehouseById: async (id: string): Promise<{ warehouse: Warehouse }> => {
    const res = await api.get(`/warehouses/${id}`);
    return res.data;
  },

  createWarehouse: async (data: {
    name: string;
    locationCode: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    status?: "ACTIVE" | "INACTIVE";
  }): Promise<{ message: string; warehouse: Warehouse }> => {
    const res = await api.post("/warehouses", data);
    return res.data;
  },

  updateWarehouse: async (
    id: string,
    data: {
      name?: string;
      locationCode?: string;
      address?: any;
    }
  ): Promise<{ message: string; warehouse: Warehouse }> => {
    const res = await api.patch(`/warehouses/${id}`, data);
    return res.data;
  },

  updateWarehouseStatus: async (
    id: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<{ message: string; warehouse: Warehouse }> => {
    const res = await api.patch(`/warehouses/${id}/status`, { status });
    return res.data;
  },
};
