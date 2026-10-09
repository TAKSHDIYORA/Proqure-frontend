import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  Product,
  ProductType,
  CreateProductInput,
  UpdateProductInput,
} from "../../api/products";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Globe,
  Lock,
  Layers,
  X,
  AlertCircle,
  Tag,
} from "lucide-react";

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState<ProductType>("RAW_MATERIAL");
  const [unitOfMeasure, setUnitOfMeasure] = useState("pcs");
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState(1);
  const [marketplaceVisible, setMarketplaceVisible] = useState(true);
  const [marketplacePrice, setMarketplacePrice] = useState<number | undefined>(undefined);

  const canManage =
    user?.role === "ADMIN" || user?.role === "PROCUREMENT_MANAGER";

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productsApi.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setSku("");
    setName("");
    setDescription("");
    setCategory("");
    setProductType("RAW_MATERIAL");
    setUnitOfMeasure("pcs");
    setMinimumOrderQuantity(1);
    setMarketplaceVisible(true);
    setMarketplacePrice(undefined);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku);
    setName(p.name);
    setDescription(p.description || "");
    setCategory(p.category);
    setProductType(p.productType);
    setUnitOfMeasure(p.unitOfMeasure);
    setMinimumOrderQuantity(p.minimumOrderQuantity || 1);
    setMarketplaceVisible(p.marketplaceVisible ?? false);
    setMarketplacePrice(p.marketplacePrice);
    setFormError(null);
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingProduct(null);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct._id,
        input: {
          name,
          description,
          category,
          productType,
          unitOfMeasure,
          minimumOrderQuantity,
          marketplaceVisible,
          marketplacePrice: marketplacePrice ? Number(marketplacePrice) : undefined,
        },
      });
    } else {
      if (!sku.trim()) {
        setFormError("SKU is required");
        return;
      }
      createMutation.mutate({
        sku,
        name,
        description,
        category,
        productType,
        unitOfMeasure,
        minimumOrderQuantity,
        marketplaceVisible,
        marketplacePrice: marketplacePrice ? Number(marketplacePrice) : undefined,
      });
    }
  };

  const products = data?.products || [];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || p.productType === typeFilter;
    return matchesSearch && matchesType;
  });

  const getProductTypeBadge = (type: ProductType) => {
    switch (type) {
      case "RAW_MATERIAL":
        return <Badge variant="info" size="sm">Raw Material</Badge>;
      case "COMPONENT":
        return <Badge variant="warning" size="sm">Component</Badge>;
      case "WORK_IN_PROGRESS":
        return <Badge variant="default" size="sm">WIP</Badge>;
      case "FINISHED_GOOD":
        return <Badge variant="success" size="sm">Finished Good</Badge>;
      default:
        return <Badge variant="default" size="sm">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Product Master Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Maintain item master definitions, SKUs, specifications, and marketplace pricing.
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C83FF] hover:bg-[#6E76FF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, Name, or Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-[#9AA3AE] font-medium">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          >
            <option value="">All Product Types</option>
            <option value="RAW_MATERIAL">Raw Material</option>
            <option value="COMPONENT">Component</option>
            <option value="WORK_IN_PROGRESS">Work In Progress</option>
            <option value="FINISHED_GOOD">Finished Good</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <SkeletonLoader variant="table-row" count={5} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Add your enterprise product catalogue to initiate procurement and RFQ bidding."
            action={
              canManage
                ? {
                    label: "Add Product",
                    onClick: openCreateModal,
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold uppercase text-[#697381] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">Product / Thumbnail</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Classification</th>
                  <th className="px-5 py-3">UOM</th>
                  <th className="px-5 py-3 text-right">Min Order (MOQ)</th>
                  <th className="px-5 py-3 text-right">Marketplace Price</th>
                  <th className="px-5 py-3 text-center">Directory Status</th>
                  {canManage && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProducts.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-[#161B23] transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        {/* Consistent fixed thumbnail tile */}
                        <div className="w-9 h-9 rounded-lg bg-[#171C24] border border-white/[0.08] flex items-center justify-center text-[#7C83FF] font-semibold text-xs flex-shrink-0 group-hover:border-[#7C83FF]/30 transition-colors">
                          <Package className="w-4 h-4 text-[#9AA3AE] group-hover:text-[#7C83FF]" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#E6E8EB] truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#697381] mt-0.5">
                            {p.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#171C24] border border-white/[0.06] text-[#9AA3AE] text-[11px]">
                        {p.category || "General"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getProductTypeBadge(p.productType)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#9AA3AE]">
                      {p.unitOfMeasure}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-[#E6E8EB] tabular-nums">
                      {p.minimumOrderQuantity || 1}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-[#E6E8EB] tabular-nums">
                      {p.marketplacePrice !== undefined && p.marketplacePrice !== null
                        ? `$${Number(p.marketplacePrice).toFixed(2)}`
                        : <span className="text-[#697381] font-normal">Internal Only</span>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      {p.marketplaceVisible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#4ADE80]">
                          <Globe className="w-3 h-3" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#697381]">
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-[#9AA3AE] hover:text-[#7C83FF] hover:bg-[#171C24] rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                              deleteMutation.mutate(p._id);
                            }
                          }}
                          className="p-1.5 text-[#697381] hover:text-[#F87171] hover:bg-[#171C24] rounded transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-[#7C83FF]" />
                <h3 className="font-bold text-[#E6E8EB] text-sm">
                  {editingProduct ? "Edit Product Details" : "Add New Catalog Product"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {formError && (
                <div className="p-3 text-xs bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProduct}
                    placeholder="e.g. ELEC-CAP-100"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] font-mono uppercase disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceramic Capacitor 100uF"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Description & Specifications
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed component specifications, voltage ratings, packaging..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electronics, Raw Steel"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Product Classification
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as ProductType)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  >
                    <option value="RAW_MATERIAL">Raw Material</option>
                    <option value="COMPONENT">Component</option>
                    <option value="WORK_IN_PROGRESS">Work In Progress</option>
                    <option value="FINISHED_GOOD">Finished Good</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Unit of Measure (UOM)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pcs, kg, meters, liters"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Minimum Order Qty (MOQ)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minimumOrderQuantity}
                    onChange={(e) => setMinimumOrderQuantity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0F1218] rounded-lg border border-white/[0.05] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#E6E8EB] block">
                      Marketplace Directory Listing
                    </span>
                    <span className="text-[10px] text-[#697381]">
                      Make this product discoverable by other trading partners
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketplaceVisible}
                    onChange={(e) => setMarketplaceVisible(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0B0E13] border-white/[0.12] text-[#7C83FF] focus:ring-0"
                  />
                </div>

                {marketplaceVisible && (
                  <div>
                    <label className="block text-[10px] font-semibold text-[#9AA3AE] uppercase mb-1">
                      Directory Indicative Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 4.99"
                      value={marketplacePrice ?? ""}
                      onChange={(e) =>
                        setMarketplacePrice(
                          e.target.value === "" ? undefined : Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {editingProduct
                    ? updateMutation.isPending
                      ? "Saving..."
                      : "Save Changes"
                    : createMutation.isPending
                    ? "Adding..."
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
