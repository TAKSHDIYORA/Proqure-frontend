import { api } from "./client";

export interface PurchaseOrderItem {
  productId: {
    _id: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
  };
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface PurchaseOrder {
  _id: string;
  tenantId: string;
  poNumber: string;
  quotationId?: any;
  rfqId?: any;
  supplierTenantId: {
    _id: string;
    name: string;
    capabilities: string[];
  };
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status:
    | "ISSUED"
    | "ACKNOWLEDGED"
    | "IN_PRODUCTION"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentTerms?: string;
  shippingTerms?: string;
  expectedDeliveryDate?: string;
  createdAt: string;
}

export interface PRItem {
  productId: {
    _id: string;
    sku: string;
    name: string;
    category?: string;
    unitOfMeasure: string;
  };
  quantity: number;
  estimatedUnitPrice?: number;
}

export interface PurchaseRequisition {
  _id: string;
  tenantId: string;
  prNumber: string;
  title: string;
  requestedBy: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  };
  items: PRItem[];
  justification: string;
  requiredDate: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface RFQItem {
  productId: {
    _id: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
  };
  quantity: number;
}

export interface RFQ {
  _id: string;
  tenantId: string | { _id: string; name: string; email?: string; capabilities?: string[] };
  rfqNumber: string;
  prId: {
    _id: string;
    prNumber: string;
    title: string;
    status: string;
  };
  title: string;
  items: RFQItem[];
  invitedSuppliers: {
    _id: string;
    name: string;
    capabilities: string[];
  }[];
  deliveryLocation: string;
  closingDate: string;
  terms?: string;
  status: "DRAFT" | "OPEN" | "CLOSED" | "AWARDED" | "CANCELLED";
  createdBy: string;
  createdAt: string;
  myQuotation?: {
    _id: string;
    status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
    totalAmount: number;
    leadTimeDays: number;
    validUntil: string;
    submittedAt: string;
  } | null;
}

export interface QuotationItem {
  productId: {
    _id: string;
    sku: string;
    name: string;
    unitOfMeasure: string;
  };
  offeredQuantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface Quotation {
  _id: string;
  rfqId: string;
  buyerTenantId: string;
  supplierTenantId: {
    _id: string;
    name: string;
    capabilities: string[];
  };
  supplierUserId: {
    _id: string;
    fullName: string;
    email: string;
  };
  items: QuotationItem[];
  totalAmount: number;
  leadTimeDays: number;
  validUntil: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  submittedAt: string;
  createdAt: string;
}

export const procurementApi = {
  // --- Purchase Orders (PO) ---
  getMyPurchaseOrders: async (): Promise<{ count: number; purchaseOrders: PurchaseOrder[] }> => {
    const res = await api.get("/procurement/pos/buyer");
    return res.data;
  },

  getSupplierPurchaseOrders: async (): Promise<{ count: number; purchaseOrders: PurchaseOrder[] }> => {
    const res = await api.get("/procurement/pos/supplier");
    return res.data;
  },

  createPurchaseOrder: async (data: {
    quotationId: string;
    paymentTerms?: string;
    shippingTerms?: string;
    expectedDeliveryDate?: string;
  }): Promise<{ message: string; po: PurchaseOrder }> => {
    const res = await api.post("/procurement/pos", data);
    return res.data;
  },

  updatePOStatus: async (
    id: string,
    data: { status: string; comments?: string }
  ): Promise<{ message: string; po: PurchaseOrder }> => {
    const res = await api.patch(`/procurement/pos/${id}/status`, data);
    return res.data;
  },

  // --- Purchase Requisitions (PR) ---
  getPurchaseRequisitions: async (): Promise<{ count: number; prs: PurchaseRequisition[] }> => {
    const res = await api.get("/procurement/pr");
    return res.data;
  },

  getPurchaseRequisitionById: async (id: string): Promise<{ pr: PurchaseRequisition }> => {
    const res = await api.get(`/procurement/pr/${id}`);
    return res.data;
  },

  createPurchaseRequisition: async (data: {
    title: string;
    items: { productId: string; quantity: number; estimatedUnitPrice?: number }[];
    justification: string;
    requiredDate: string;
  }): Promise<{ message: string; pr: PurchaseRequisition }> => {
    const res = await api.post("/procurement/pr", data);
    return res.data;
  },

  submitPurchaseRequisition: async (id: string): Promise<{ message: string; pr: PurchaseRequisition }> => {
    const res = await api.patch(`/procurement/pr/${id}/submit`);
    return res.data;
  },

  approvePurchaseRequisition: async (
    id: string,
    comments?: string
  ): Promise<{ message: string; pr: PurchaseRequisition }> => {
    const res = await api.patch(`/procurement/pr/${id}/approve`, { comments });
    return res.data;
  },

  rejectPurchaseRequisition: async (
    id: string,
    comments?: string
  ): Promise<{ message: string; pr: PurchaseRequisition }> => {
    const res = await api.patch(`/procurement/pr/${id}/reject`, { comments });
    return res.data;
  },

  // --- Requests for Quotation (RFQ) ---
  getRFQs: async (): Promise<{ count: number; rfqs: RFQ[] }> => {
    const res = await api.get("/procurement/rfqs");
    return res.data;
  },

  createRFQ: async (data: {
    prId: string;
    deliveryLocation: string;
    closingDate: string;
    terms?: string;
    invitedSuppliers?: string[];
    status?: "DRAFT" | "OPEN";
    openImmediately?: boolean;
  }): Promise<{ message: string; rfq: RFQ }> => {
    const res = await api.post("/procurement/rfqs", data);
    return res.data;
  },

  inviteSupplier: async (
    rfqId: string,
    supplierOrganizationId: string
  ): Promise<{ message: string; rfq: RFQ }> => {
    const res = await api.patch(`/procurement/rfqs/${rfqId}/invite`, { supplierOrganizationId });
    return res.data;
  },

  inviteSupplierToRFQ: async (
    rfqId: string,
    supplierOrganizationId: string
  ): Promise<{ message: string; rfq: RFQ }> => {
    const res = await api.patch(`/procurement/rfqs/${rfqId}/invite`, { supplierOrganizationId });
    return res.data;
  },

  openRFQ: async (rfqId: string): Promise<{ message: string; rfq: RFQ }> => {
    const res = await api.patch(`/procurement/rfqs/${rfqId}/open`);
    return res.data;
  },

  // --- Quotations & Bidding ---
  getRFQQuotations: async (rfqId: string): Promise<{ count: number; quotations: Quotation[] }> => {
    const res = await api.get(`/procurement/quotations/rfq/${rfqId}`);
    return res.data;
  },

  submitQuotation: async (
    rfqId: string,
    data: {
      items: { productId: string; offeredQuantity: number; unitPrice: number; taxRate: number }[];
      leadTimeDays: number;
      validUntil: string;
    }
  ): Promise<{ message: string; quotation: Quotation }> => {
    const res = await api.post(`/procurement/quotations/rfq/${rfqId}`, data);
    return res.data;
  },

  awardQuotation: async (
    quotationId: string
  ): Promise<{ message: string; quotation: Quotation; rfq: RFQ }> => {
    const res = await api.patch(`/procurement/quotations/${quotationId}/award`);
    return res.data;
  },
};
