import { api } from "./client";

export type ProductType =
  | "RAW_MATERIAL"
  | "COMPONENT"
  | "WORK_IN_PROGRESS"
  | "FINISHED_GOOD";

export interface Product {
  _id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  productType: ProductType;
  unitOfMeasure: string;
  minimumOrderQuantity: number;
  marketplaceVisible: boolean;
  marketplacePrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  description?: string;
  category: string;
  productType: ProductType;
  unitOfMeasure: string;
  minimumOrderQuantity?: number;
  marketplaceVisible?: boolean;
  marketplacePrice?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  category?: string;
  productType?: ProductType;
  unitOfMeasure?: string;
  minimumOrderQuantity?: number;
  marketplaceVisible?: boolean;
  marketplacePrice?: number;
}

export const productsApi = {
  getProducts: async (): Promise<{ count: number; products: Product[] }> => {
    const res = await api.get("/products");
    return res.data;
  },

  createProduct: async (
    data: CreateProductInput
  ): Promise<{ message: string; product: Product }> => {
    const res = await api.post("/products", data);
    return res.data;
  },

  updateProduct: async (
    id: string,
    data: UpdateProductInput
  ): Promise<{ message: string; product: Product }> => {
    const res = await api.patch(`/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};
