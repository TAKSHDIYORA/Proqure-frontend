import { api } from "./client";

export interface InventoryStock {
  _id: string;
  tenantId: string;
  warehouseId: {
    _id: string;
    name: string;
    locationCode: string;
    status: string;
  };
  productId: {
    _id: string;
    sku: string;
    name: string;
    description?: string;
    unitOfMeasure: string;
    productType: string;
    category: string;
  };
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  reorderPoint: number;
  createdAt: string;
  updatedAt: string;
}

export interface LowStockAlert {
  stockId: string;
  warehouse: {
    _id: string;
    name: string;
    locationCode: string;
  };
  product: {
    _id: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
    category: string;
  };
  currentStock: number;
  availableQuantity: number;
  reorderPoint: number;
  minimumStock: number;
  deficit: number;
  status: "OUT_OF_STOCK" | "LOW_STOCK";
  recommendation: string;
}

export interface InventoryMovement {
  _id: string;
  tenantId: string;
  warehouseId: {
    _id: string;
    name: string;
    locationCode: string;
  };
  productId: {
    _id: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
  };
  movementType:
    | "RECEIPT"
    | "PRODUCTION_CONSUMPTION"
    | "PRODUCTION_OUTPUT"
    | "TRANSFER_IN"
    | "TRANSFER_OUT"
    | "ADJUSTMENT"
    | "RETURN";
  quantity: number;
  referenceType: string;
  referenceId?: string;
  performedBy: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  balanceAfter?: number;
  notes?: string;
  createdAt: string;
}

export const inventoryApi = {
  getInventory: async (params?: {
    warehouseId?: string;
    productId?: string;
    lowStock?: boolean;
  }): Promise<{ count: number; inventory: InventoryStock[] }> => {
    const res = await api.get("/inventory", { params });
    return res.data;
  },

  getInventoryById: async (id: string): Promise<{ stock: InventoryStock }> => {
    const res = await api.get(`/inventory/${id}`);
    return res.data;
  },

  getLowStockAlerts: async (): Promise<{ count: number; alerts: LowStockAlert[] }> => {
    const res = await api.get("/inventory/alerts/low-stock");
    return res.data;
  },

  getMovements: async (params?: {
    warehouseId?: string;
    productId?: string;
    movementType?: string;
    referenceType?: string;
    limit?: number;
  }): Promise<{ count: number; movements: InventoryMovement[] }> => {
    const res = await api.get("/inventory/movements", { params });
    return res.data;
  },

  adjustStock: async (data: {
    warehouseId: string;
    productId: string;
    adjustmentType: "INCREASE" | "DECREASE" | "SET";
    quantity: number;
    reason?: string;
    notes?: string;
  }): Promise<{ message: string; stock: InventoryStock; movement: InventoryMovement }> => {
    const res = await api.post("/inventory/adjustments", data);
    return res.data;
  },

  updateThresholds: async (
    id: string,
    data: { minimumStock?: number; reorderPoint?: number }
  ): Promise<{ message: string; stock: InventoryStock }> => {
    const res = await api.patch(`/inventory/${id}/thresholds`, data);
    return res.data;
  },
};
