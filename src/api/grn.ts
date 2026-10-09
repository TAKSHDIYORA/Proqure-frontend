import { api } from "./client";

export interface GRNItem {
  productId: {
    _id: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
    category?: string;
  };
  orderedQuantity: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  acceptedQuantity: number;
  unitPrice?: number;
  rejectionReason?: string;
}

export interface GRN {
  _id: string;
  tenantId: string;
  grnNumber: string;
  poId: {
    _id: string;
    poNumber: string;
    status: string;
    totalAmount: number;
    expectedDeliveryDate?: string;
  };
  warehouseId: {
    _id: string;
    name: string;
    locationCode: string;
    status: string;
  };
  supplierTenantId: {
    _id: string;
    name: string;
    capabilities: string[];
  };
  receiptDate: string;
  deliveryNoteNumber?: string;
  items: GRNItem[];
  inspectionComments?: string;
  status: "DRAFT" | "FINALIZED" | "CANCELLED";
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  finalizedBy?: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PORemainingResponse {
  po: {
    _id: string;
    poNumber: string;
    status: string;
    supplier: {
      _id: string;
      name: string;
    };
    totalAmount: number;
  };
  items: {
    product: {
      _id: string;
      sku: string;
      name: string;
      unitOfMeasure: string;
      category?: string;
    };
    orderedQuantity: number;
    totalReceivedQuantity: number;
    totalAcceptedQuantity: number;
    totalRejectedQuantity: number;
    remainingQuantity: number;
    unitPrice: number;
    taxRate: number;
  }[];
}

export const grnApi = {
  getGRNs: async (params?: {
    status?: string;
    poId?: string;
    warehouseId?: string;
  }): Promise<{ count: number; grns: GRN[] }> => {
    const res = await api.get("/procurement/grn", { params });
    return res.data;
  },

  getGRNById: async (id: string): Promise<{ grn: GRN }> => {
    const res = await api.get(`/procurement/grn/${id}`);
    return res.data;
  },

  getPORemaining: async (poId: string): Promise<PORemainingResponse> => {
    const res = await api.get(`/procurement/grn/po/${poId}/remaining`);
    return res.data;
  },

  createGRN: async (data: {
    poId: string;
    warehouseId: string;
    deliveryNoteNumber?: string;
    receiptDate?: string;
    inspectionComments?: string;
    items: {
      productId: string;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity?: number;
      rejectionReason?: string;
    }[];
  }): Promise<{ message: string; grn: GRN }> => {
    const res = await api.post("/procurement/grn", data);
    return res.data;
  },

  updateDraftGRN: async (
    id: string,
    data: {
      warehouseId?: string;
      deliveryNoteNumber?: string;
      receiptDate?: string;
      inspectionComments?: string;
      items?: any[];
    }
  ): Promise<{ message: string; grn: GRN }> => {
    const res = await api.patch(`/procurement/grn/${id}`, data);
    return res.data;
  },

  finalizeGRN: async (
    id: string
  ): Promise<{ message: string; grn: GRN; poDelivered: boolean }> => {
    const res = await api.patch(`/procurement/grn/${id}/finalize`);
    return res.data;
  },

  cancelGRN: async (id: string): Promise<{ message: string; grn: GRN }> => {
    const res = await api.patch(`/procurement/grn/${id}/cancel`);
    return res.data;
  },
};
