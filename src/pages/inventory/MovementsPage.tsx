import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../../api/inventory";
import { warehouseApi } from "../../api/warehouses";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  History,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
} from "lucide-react";

export const MovementsPage: React.FC = () => {
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: whData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehouseApi.getWarehouses(),
  });

  const { data: movementsData, isLoading, refetch } = useQuery({
    queryKey: ["movements", warehouseFilter, typeFilter],
    queryFn: () =>
      inventoryApi.getMovements({
        warehouseId: warehouseFilter || undefined,
        movementType: typeFilter || undefined,
        limit: 100,
      }),
  });

  const movements = movementsData?.movements || [];

  const getMovementBadgeVariant = (type: string) => {
    switch (type) {
      case "RECEIPT":
        return "success";
      case "PRODUCTION_OUTPUT":
      case "TRANSFER_IN":
      case "RETURN":
        return "info";
      case "PRODUCTION_CONSUMPTION":
      case "TRANSFER_OUT":
        return "warning";
      case "ADJUSTMENT":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Inventory Movement Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Immutable audit record of all physical goods receipts, adjustments, and internal stock transfers.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#E6E8EB] bg-[#11151C] hover:bg-[#171C24] border border-white/[0.08] hover:border-white/[0.12] rounded-lg transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5 text-[#9AA3AE]" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-[#697381]">
            <Filter className="w-3.5 h-3.5 text-[#697381]" />
            <span className="font-medium text-[#9AA3AE]">Filter:</span>
          </div>

          {/* Warehouse Filter */}
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-white/[0.08] rounded-lg bg-[#0B0E13] text-[#E6E8EB] focus:outline-none focus:border-[#7C83FF] transition-colors"
          >
            <option value="">All Warehouses</option>
            {whData?.warehouses.map((wh) => (
              <option key={wh._id} value={wh._id}>
                {wh.name} ({wh.locationCode})
              </option>
            ))}
          </select>

          {/* Movement Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-white/[0.08] rounded-lg bg-[#0B0E13] text-[#E6E8EB] focus:outline-none focus:border-[#7C83FF] transition-colors"
          >
            <option value="">All Movement Types</option>
            <option value="RECEIPT">Receipt (GRN)</option>
            <option value="ADJUSTMENT">Adjustment (Manual)</option>
            <option value="PRODUCTION_OUTPUT">Production Output</option>
            <option value="PRODUCTION_CONSUMPTION">Production Consumption</option>
            <option value="TRANSFER_IN">Transfer In</option>
            <option value="TRANSFER_OUT">Transfer Out</option>
            <option value="RETURN">Return</option>
          </select>
        </div>

        <div className="text-[11px] text-[#697381] font-mono tabular-nums">
          Showing {movements.length} latest transaction records
        </div>
      </div>

      {/* Movement Ledger Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <SkeletonLoader variant="table-row" count={6} />
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            icon={History}
            title="No movement records found"
            description="Movements are generated when Goods Receipts (GRN) are finalized or manual stock adjustments are committed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold uppercase text-[#697381] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Product / SKU</th>
                  <th className="px-5 py-3">Warehouse Hub</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Performed By</th>
                  <th className="px-5 py-3">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {movements.map((mov) => {
                  const isPositive =
                    mov.movementType === "RECEIPT" ||
                    mov.movementType === "PRODUCTION_OUTPUT" ||
                    mov.movementType === "TRANSFER_IN" ||
                    (mov.movementType === "ADJUSTMENT" && mov.quantity > 0);

                  return (
                    <tr
                      key={mov._id}
                      className="hover:bg-[#161B23] transition-colors group"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] text-[#9AA3AE] font-mono tabular-nums">
                        {new Date(mov.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge
                          variant={getMovementBadgeVariant(mov.movementType)}
                          size="sm"
                        >
                          {mov.movementType.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[#E6E8EB]">
                          {mov.productId?.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#697381]">
                          {mov.productId?.sku}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-[#9AA3AE]">{mov.warehouseId?.name}</div>
                        <div className="text-[10px] text-[#697381] font-mono">
                          {mov.warehouseId?.locationCode}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold tabular-nums text-xs ${
                            isPositive ? "text-[#4ADE80]" : "text-[#F87171]"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isPositive ? "+" : ""}
                            {mov.quantity.toLocaleString()}{" "}
                            <span className="font-normal text-[10px] opacity-75">
                              {mov.productId?.unitOfMeasure || "units"}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                        <span className="font-medium text-[#E6E8EB]">
                          {mov.referenceType}
                        </span>
                        {mov.referenceId && (
                          <span className="ml-1 text-[#697381] font-mono text-[10px]">
                            #{String(mov.referenceId).slice(-6)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#9AA3AE]">
                        {mov.performedBy?.fullName || "System"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#697381] max-w-xs truncate">
                        {mov.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
