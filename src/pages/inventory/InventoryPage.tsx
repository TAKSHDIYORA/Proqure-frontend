import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, InventoryStock } from "../../api/inventory";
import { warehouseApi } from "../../api/warehouses";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Package,
  AlertTriangle,
  History,
  Search,
  CheckCircle,
  X,
  Plus,
  Minus,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [search, setSearch] = useState("");

  // Adjustment Modal state
  const [adjustItem, setAdjustItem] = useState<InventoryStock | null>(null);
  const [adjustType, setAdjustType] = useState<"INCREASE" | "DECREASE" | "SET">("INCREASE");
  const [adjustQty, setAdjustQty] = useState<number | "">("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Thresholds Modal state
  const [thresholdItem, setThresholdItem] = useState<InventoryStock | null>(null);
  const [minStock, setMinStock] = useState<number>(0);
  const [reorderPt, setReorderPt] = useState<number>(0);

  const canManage = user?.role === "ADMIN" || user?.role === "WAREHOUSE_MANAGER";

  const { data: whData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehouseApi.getWarehouses(),
  });

  const { data: invData, isLoading } = useQuery({
    queryKey: ["inventory", warehouseFilter, lowStockFilter],
    queryFn: () =>
      inventoryApi.getInventory({
        warehouseId: warehouseFilter || undefined,
        lowStock: lowStockFilter || undefined,
      }),
  });

  const adjustMutation = useMutation({
    mutationFn: inventoryApi.adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockAlerts"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      setAdjustItem(null);
      resetAdjustForm();
    },
    onError: (err: any) => {
      setAdjustError(err.response?.data?.message || "Adjustment failed");
    },
  });

  const thresholdMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryApi.updateThresholds(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["lowStockAlerts"] });
      setThresholdItem(null);
    },
  });

  const resetAdjustForm = () => {
    setAdjustType("INCREASE");
    setAdjustQty("");
    setAdjustReason("");
    setAdjustNotes("");
    setAdjustError(null);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || adjustQty === "" || Number(adjustQty) < 0) {
      setAdjustError("Please specify a valid quantity");
      return;
    }

    adjustMutation.mutate({
      warehouseId: adjustItem.warehouseId._id,
      productId: adjustItem.productId._id,
      adjustmentType: adjustType,
      quantity: Number(adjustQty),
      reason: adjustReason,
      notes: adjustNotes,
    });
  };

  const filteredItems = invData?.inventory.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      item.productId.sku.toLowerCase().includes(term) ||
      item.productId.name.toLowerCase().includes(term) ||
      item.warehouseId.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Inventory Stock Levels
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Physical stock on-hand, safety thresholds, and warehouse location distribution.
          </p>
        </div>
        <Link
          to="/inventory/movements"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#E6E8EB] bg-[#11151C] hover:bg-[#171C24] border border-white/[0.08] hover:border-white/[0.12] rounded-lg transition-colors"
        >
          <History className="w-3.5 h-3.5 text-[#9AA3AE]" />
          <span>Audit Movement Ledger</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Recessed Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] focus:ring-1 focus:ring-[#7C83FF]/30 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#9AA3AE] font-medium">Warehouse:</span>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#7C83FF] transition-colors"
            >
              <option value="">All Storage Hubs</option>
              {whData?.warehouses.map((wh) => (
                <option key={wh._id} value={wh._id}>
                  {wh.name} ({wh.locationCode})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center space-x-1.5 ${
              lowStockFilter
                ? "bg-[#F5C76A]/15 text-[#F5C76A] border-[#F5C76A]/30"
                : "bg-[#0B0E13] text-[#9AA3AE] border-white/[0.08] hover:bg-[#171C24] hover:text-[#E6E8EB]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#F5C76A]" />
            <span>Low Stock Deficit</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold text-[#697381] uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3">Product / SKU</th>
                <th className="px-5 py-3">Warehouse Hub</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-right">On Hand</th>
                <th className="px-5 py-3 text-right">Reserved</th>
                <th className="px-5 py-3 text-right">Available</th>
                <th className="px-5 py-3 text-center">Status</th>
                {canManage && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                <SkeletonLoader variant="table-row" count={5} />
              ) : filteredItems && filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isLow =
                    (item.reorderPoint > 0 && item.quantity <= item.reorderPoint) ||
                    (item.minimumStock > 0 && item.quantity <= item.minimumStock);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#161B23] transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[#E6E8EB]">
                          {item.productId?.name}
                        </div>
                        <div className="font-mono text-[11px] text-[#697381] mt-0.5">
                          {item.productId?.sku}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[#9AA3AE]">
                          {item.warehouseId?.name}
                        </div>
                        <span className="font-mono text-[10px] text-[#697381]">
                          {item.warehouseId?.locationCode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-[#171C24] border border-white/[0.06] text-[#9AA3AE] text-[11px]">
                          {item.productId?.category || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#E6E8EB] tabular-nums">
                        {item.quantity.toLocaleString()}{" "}
                        <span className="text-[10px] text-[#697381] font-normal">
                          {item.productId?.unitOfMeasure}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[#9AA3AE] tabular-nums">
                        {item.reservedQuantity.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-[#7C83FF] tabular-nums">
                        {item.availableQuantity.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isLow ? (
                          <Badge variant="warning" size="sm">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Optimal
                          </Badge>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setAdjustItem(item);
                              resetAdjustForm();
                            }}
                            className="text-[11px] font-semibold text-[#7C83FF] hover:text-white bg-[#7C83FF]/10 hover:bg-[#7C83FF]/25 border border-[#7C83FF]/20 px-2 py-1 rounded transition-colors"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => {
                              setThresholdItem(item);
                              setMinStock(item.minimumStock || 0);
                              setReorderPt(item.reorderPoint || 0);
                            }}
                            className="text-[11px] font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] px-2 py-1 rounded transition-colors"
                          >
                            Thresholds
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12">
                    <EmptyState
                      icon={Package}
                      title="No stock records found"
                      description="Finalize a Goods Receipt Note (GRN) or perform an initial stock adjustment to populate inventory."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#E6E8EB] text-sm tracking-tight">
                  Adjust Inventory Stock
                </h3>
                <p className="text-[11px] text-[#9AA3AE]">
                  Manual reconciliation written to immutable ledger
                </p>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="text-[#697381] hover:text-[#E6E8EB] p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4">
              {adjustError && (
                <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-lg text-[#F87171] text-xs">
                  {adjustError}
                </div>
              )}

              {/* Entity Info Box */}
              <div className="p-3 bg-[#0F1218] rounded-lg border border-white/[0.05] text-xs space-y-1">
                <div className="text-[#E6E8EB]">
                  Product:{" "}
                  <span className="font-semibold text-white">
                    {adjustItem.productId?.name}
                  </span>{" "}
                  <span className="font-mono text-[#697381]">
                    ({adjustItem.productId?.sku})
                  </span>
                </div>
                <div className="text-[#9AA3AE]">
                  Warehouse:{" "}
                  <span className="font-medium text-[#E6E8EB]">
                    {adjustItem.warehouseId?.name}
                  </span>
                </div>
                <div className="text-[#9AA3AE]">
                  Current On-Hand:{" "}
                  <span className="font-bold text-[#7C83FF] tabular-nums">
                    {adjustItem.quantity} {adjustItem.productId?.unitOfMeasure}
                  </span>
                </div>
              </div>

              {/* Adjustment Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1.5">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("INCREASE")}
                    className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      adjustType === "INCREASE"
                        ? "bg-[#7C83FF] text-white border-[#7C83FF]"
                        : "bg-[#0B0E13] text-[#9AA3AE] border-white/[0.08] hover:bg-[#1D242E]"
                    }`}
                  >
                    + Increase
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("DECREASE")}
                    className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      adjustType === "DECREASE"
                        ? "bg-[#7C83FF] text-white border-[#7C83FF]"
                        : "bg-[#0B0E13] text-[#9AA3AE] border-white/[0.08] hover:bg-[#1D242E]"
                    }`}
                  >
                    - Decrease
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("SET")}
                    className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      adjustType === "SET"
                        ? "bg-[#7C83FF] text-white border-[#7C83FF]"
                        : "bg-[#0B0E13] text-[#9AA3AE] border-white/[0.08] hover:bg-[#1D242E]"
                    }`}
                  >
                    = Set Exact
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Quantity ({adjustItem.productId?.unitOfMeasure})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) =>
                    setAdjustQty(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g. 50"
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Reason for Adjustment *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Cycle count discrepancy, scrap, audit reconciliation"
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Audit Notes (Optional)
                </label>
                <textarea
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional context stored on immutable ledger..."
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-white/[0.06] flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {adjustMutation.isPending ? "Applying..." : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thresholds Modal */}
      {thresholdItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#E6E8EB] text-sm tracking-tight">
                  Reorder Thresholds
                </h3>
                <p className="text-[11px] text-[#9AA3AE]">
                  Configure safety margins for replenishment
                </p>
              </div>
              <button
                onClick={() => setThresholdItem(null)}
                className="text-[#697381] hover:text-[#E6E8EB] p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[#9AA3AE]">
                Set thresholds for{" "}
                <span className="font-semibold text-[#E6E8EB]">
                  {thresholdItem.productId.name}
                </span>{" "}
                in{" "}
                <span className="text-[#E6E8EB]">
                  {thresholdItem.warehouseId.name}
                </span>
                .
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Minimum Safety Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Reorder Point
                </label>
                <input
                  type="number"
                  min="0"
                  value={reorderPt}
                  onChange={(e) => setReorderPt(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] tabular-nums"
                />
                <span className="text-[10px] text-[#697381] mt-1 block">
                  Triggers automated low-stock warnings when on-hand drops to this count.
                </span>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setThresholdItem(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={thresholdMutation.isPending}
                  onClick={() =>
                    thresholdMutation.mutate({
                      id: thresholdItem._id,
                      data: { minimumStock: minStock, reorderPoint: reorderPt },
                    })
                  }
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {thresholdMutation.isPending ? "Saving..." : "Save Thresholds"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
