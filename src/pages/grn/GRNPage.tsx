import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { grnApi, GRN, PORemainingResponse } from "../../api/grn";
import { procurementApi, PurchaseOrder } from "../../api/procurement";
import { warehouseApi } from "../../api/warehouses";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Warehouse as WarehouseIcon,
  X,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

export const GRNPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);

  // New GRN Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [inspectionComments, setInspectionComments] = useState("");
  const [itemReceipts, setItemReceipts] = useState<
    Record<
      string,
      {
        receivedQuantity: number;
        acceptedQuantity: number;
        rejectedQuantity: number;
        rejectionReason: string;
      }
    >
  >({});
  const [createError, setCreateError] = useState<string | null>(null);

  const canManage =
    user?.role === "ADMIN" ||
    user?.role === "WAREHOUSE_MANAGER" ||
    user?.role === "PROCUREMENT_OFFICER";

  // Queries
  const { data: grnData, isLoading } = useQuery({
    queryKey: ["grns", statusFilter],
    queryFn: () => grnApi.getGRNs({ status: statusFilter || undefined }),
  });

  const { data: poData } = useQuery({
    queryKey: ["purchaseOrdersBuyer"],
    queryFn: () => procurementApi.getMyPurchaseOrders(),
    enabled: isCreateOpen,
  });

  const { data: whData } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehouseApi.getWarehouses(),
    enabled: isCreateOpen,
  });

  const { data: poRemaining, isLoading: isLoadingRemaining } = useQuery({
    queryKey: ["poRemaining", selectedPOId],
    queryFn: () => grnApi.getPORemaining(selectedPOId),
    enabled: !!selectedPOId,
  });

  // When PO remaining data arrives, initialize item receipt form
  React.useEffect(() => {
    if (poRemaining?.items) {
      const initial: Record<
        string,
        {
          receivedQuantity: number;
          acceptedQuantity: number;
          rejectedQuantity: number;
          rejectionReason: string;
        }
      > = {};
      poRemaining.items.forEach((item) => {
        initial[item.product._id] = {
          receivedQuantity: item.remainingQuantity,
          acceptedQuantity: item.remainingQuantity,
          rejectedQuantity: 0,
          rejectionReason: "",
        };
      });
      setItemReceipts(initial);
    }
  }, [poRemaining]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => grnApi.createGRN(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      closeCreateModal();
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.message || "Failed to create GRN");
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: (id: string) => grnApi.finalizeGRN(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      setSelectedGRN(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => grnApi.cancelGRN(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      setSelectedGRN(null);
    },
  });

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setSelectedPOId("");
    setSelectedWarehouseId("");
    setDeliveryNote("");
    setInspectionComments("");
    setItemReceipts({});
    setCreateError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!selectedPOId || !selectedWarehouseId) {
      setCreateError("Please select both a Purchase Order and receiving Warehouse");
      return;
    }

    const items = Object.entries(itemReceipts)
      .map(([productId, vals]) => ({
        productId,
        receivedQuantity: Number(vals.receivedQuantity) || 0,
        acceptedQuantity: Number(vals.acceptedQuantity) || 0,
        rejectedQuantity: Number(vals.rejectedQuantity) || 0,
        rejectionReason: vals.rejectionReason || undefined,
      }))
      .filter((i) => i.receivedQuantity > 0);

    if (items.length === 0) {
      setCreateError("Please receive at least one product with a quantity > 0");
      return;
    }

    // Validate accepted + rejected <= received
    for (const it of items) {
      if (it.acceptedQuantity + (it.rejectedQuantity || 0) > it.receivedQuantity) {
        setCreateError("Accepted + Rejected quantity cannot exceed Received quantity");
        return;
      }
    }

    createMutation.mutate({
      poId: selectedPOId,
      warehouseId: selectedWarehouseId,
      deliveryNoteNumber: deliveryNote || undefined,
      inspectionComments: inspectionComments || undefined,
      items,
    });
  };

  const grns = (grnData?.grns || []).filter((g) => {
    const matchesSearch =
      g.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
      g.poId?.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
      g.supplierTenantId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Goods Receipt Notes (GRN)
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Receive and inspect inbound shipments against active Purchase Orders into physical storage.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Goods Receipt</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by GRN#, PO#, or Supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-[#9AA3AE] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft (Under Inspection)</option>
            <option value="FINALIZED">Finalized (Stocked)</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <SkeletonLoader variant="table-row" count={5} />
          </div>
        ) : grns.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No Goods Receipt Notes found"
            description="Create a Goods Receipt Note against an open Purchase Order upon physical delivery."
            action={
              canManage
                ? {
                    label: "Create Goods Receipt",
                    onClick: () => setIsCreateOpen(true),
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold uppercase text-[#697381] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">GRN Number</th>
                  <th className="px-5 py-3">Source PO</th>
                  <th className="px-5 py-3">Receiving Hub</th>
                  <th className="px-5 py-3">Supplier Partner</th>
                  <th className="px-5 py-3">Delivery Note</th>
                  <th className="px-5 py-3">Inspection Status</th>
                  <th className="px-5 py-3 text-right">Receipt Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {grns.map((grn) => (
                  <tr
                    key={grn._id}
                    className="hover:bg-[#161B23] transition-colors group"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-[#7C83FF] font-mono">
                        {grn.grnNumber}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-[#E6E8EB] font-medium">
                        {grn.poId?.poNumber || "PO-Direct"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#9AA3AE]">
                      {grn.warehouseId?.name}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#E6E8EB]">
                      {grn.supplierTenantId?.name || "Direct Supplier"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px] text-[#697381]">
                      {grn.deliveryNoteNumber || "-"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge status={grn.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono text-[#697381] text-[11px] tabular-nums">
                      {new Date(grn.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedGRN(grn)}
                        className="px-2.5 py-1 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] rounded-md transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GRN Details Modal */}
      {selectedGRN && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#E6E8EB] font-mono">
                    {selectedGRN.grnNumber}
                  </h3>
                  <Badge status={selectedGRN.status} size="sm" />
                </div>
                <p className="text-[11px] text-[#697381] mt-0.5">
                  PO #{selectedGRN.poId?.poNumber} • Hub: {selectedGRN.warehouseId?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedGRN(null)}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0F1218] p-3 rounded-lg border border-white/[0.05]">
                <div>
                  <span className="text-[10px] text-[#697381] uppercase font-semibold block">
                    Supplier
                  </span>
                  <span className="font-semibold text-[#E6E8EB] mt-0.5 block">
                    {selectedGRN.supplierTenantId?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#697381] uppercase font-semibold block">
                    Receipt Date
                  </span>
                  <span className="font-mono text-[#E6E8EB] mt-0.5 block tabular-nums">
                    {new Date(selectedGRN.receiptDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#697381] uppercase font-semibold block">
                    Delivery Note
                  </span>
                  <span className="font-mono text-[#E6E8EB] mt-0.5 block">
                    {selectedGRN.deliveryNoteNumber || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#697381] uppercase font-semibold block">
                    Received By
                  </span>
                  <span className="font-semibold text-[#E6E8EB] mt-0.5 block">
                    {selectedGRN.createdBy?.fullName || "Staff"}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#697381] mb-2">
                  Received & Inspected Items Breakdown
                </h4>
                <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#11151C]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0F1218] border-b border-white/[0.05] font-semibold text-[#697381] text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5">Product SKU</th>
                        <th className="px-4 py-2.5 text-right">Ordered</th>
                        <th className="px-4 py-2.5 text-right">Received</th>
                        <th className="px-4 py-2.5 text-right text-[#4ADE80]">Accepted</th>
                        <th className="px-4 py-2.5 text-right text-[#F87171]">Rejected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {selectedGRN.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-[#161B23]">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-[#E6E8EB]">
                              {it.productId?.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#697381]">
                              {it.productId?.sku}
                            </div>
                            {it.rejectionReason && (
                              <div className="text-[10px] text-[#F87171] mt-0.5">
                                Reason: {it.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-[#9AA3AE] tabular-nums">
                            {it.orderedQuantity}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-[#E6E8EB] tabular-nums">
                            {it.receivedQuantity}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#4ADE80] tabular-nums">
                            {it.acceptedQuantity}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#F87171] tabular-nums">
                            {it.rejectedQuantity || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inspection Comments */}
              {selectedGRN.inspectionComments && (
                <div className="bg-[#0F1218] border border-white/[0.05] rounded-lg p-3 text-xs">
                  <span className="font-semibold text-[#9AA3AE] block mb-1">
                    Quality Inspection Comments:
                  </span>
                  <p className="text-[#E6E8EB] leading-relaxed">
                    {selectedGRN.inspectionComments}
                  </p>
                </div>
              )}

              {/* Finalized Audit Trail */}
              {selectedGRN.status === "FINALIZED" && (
                <div className="bg-[#4ADE80]/[0.06] border border-[#4ADE80]/20 rounded-lg p-3 text-xs flex items-center space-x-2 text-[#4ADE80]">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Finalized by {selectedGRN.finalizedBy?.fullName || "Warehouse Manager"} on{" "}
                    {selectedGRN.finalizedAt
                      ? new Date(selectedGRN.finalizedAt).toLocaleString()
                      : "record"}
                    . Inventory stock was increased and immutable ledger records were created.
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-[#0F1218] border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedGRN(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24] rounded-lg transition-colors"
              >
                Close
              </button>

              {selectedGRN.status === "DRAFT" && canManage && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => cancelMutation.mutate(selectedGRN._id)}
                    disabled={cancelMutation.isPending}
                    className="px-3 py-1.5 text-xs font-semibold text-[#F87171] hover:bg-[#F87171]/10 rounded-lg border border-[#F87171]/20 transition-colors"
                  >
                    Cancel GRN
                  </button>
                  <button
                    onClick={() => finalizeMutation.mutate(selectedGRN._id)}
                    disabled={finalizeMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4ADE80] hover:bg-[#22C55E] text-black rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      {finalizeMutation.isPending ? "Finalizing..." : "Finalize & Update Stock"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create GRN Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-[#7C83FF]" />
                <h3 className="font-bold text-[#E6E8EB] text-sm">
                  Receive Physical Delivery (New GRN)
                </h3>
              </div>
              <button
                onClick={closeCreateModal}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              {createError && (
                <div className="p-3 text-xs bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Source Purchase Order *
                  </label>
                  <select
                    required
                    value={selectedPOId}
                    onChange={(e) => setSelectedPOId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  >
                    <option value="">Select Issued / Shipped PO...</option>
                    {poData?.purchaseOrders
                      .filter((po) => po.status !== "CANCELLED" && po.status !== "DELIVERED")
                      .map((po) => (
                        <option key={po._id} value={po._id}>
                          {po.poNumber} ({po.supplierTenantId?.name || "Supplier"}) - {po.status}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                    Receiving Warehouse Destination *
                  </label>
                  <select
                    required
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                  >
                    <option value="">Select Receiving Storage Hub...</option>
                    {whData?.warehouses
                      .filter((w) => w.status === "ACTIVE")
                      .map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name} ({w.locationCode})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Supplier Delivery Note / Challan #
                </label>
                <input
                  type="text"
                  placeholder="e.g. DN-2026-9812"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] font-mono"
                />
              </div>

              {/* Items inspection table */}
              {selectedPOId && (
                <div>
                  <label className="block text-xs font-semibold text-[#9AA3AE] mb-1.5">
                    Physical Goods Inspection & Acceptance *
                  </label>
                  {isLoadingRemaining ? (
                    <div className="p-4 text-center text-xs text-[#697381]">
                      Loading remaining PO line quantities...
                    </div>
                  ) : poRemaining?.items && poRemaining.items.length > 0 ? (
                    <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#11151C]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[10px] font-semibold text-[#697381] uppercase tracking-wider">
                          <tr>
                            <th className="px-3 py-2">Product</th>
                            <th className="px-3 py-2 text-right">Remaining</th>
                            <th className="px-3 py-2 text-right">Received</th>
                            <th className="px-3 py-2 text-right">Accepted</th>
                            <th className="px-3 py-2 text-right">Rejected</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {poRemaining.items.map((item) => {
                            const pId = item.product._id;
                            const cur = itemReceipts[pId] || {
                              receivedQuantity: 0,
                              acceptedQuantity: 0,
                              rejectedQuantity: 0,
                              rejectionReason: "",
                            };

                            return (
                              <tr key={pId} className="hover:bg-[#161B23]">
                                <td className="px-3 py-2.5">
                                  <div className="font-semibold text-[#E6E8EB]">
                                    {item.product.name}
                                  </div>
                                  <div className="text-[10px] font-mono text-[#697381]">
                                    {item.product.sku}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-right font-medium text-[#9AA3AE] tabular-nums">
                                  {item.remainingQuantity}
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <input
                                    type="number"
                                    min={0}
                                    max={item.remainingQuantity}
                                    value={cur.receivedQuantity}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setItemReceipts((prev) => ({
                                        ...prev,
                                        [pId]: {
                                          ...prev[pId],
                                          receivedQuantity: val,
                                          acceptedQuantity: val,
                                          rejectedQuantity: 0,
                                        },
                                      }));
                                    }}
                                    className="w-16 px-1.5 py-1 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded text-right tabular-nums"
                                  />
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <input
                                    type="number"
                                    min={0}
                                    max={cur.receivedQuantity}
                                    value={cur.acceptedQuantity}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setItemReceipts((prev) => ({
                                        ...prev,
                                        [pId]: {
                                          ...prev[pId],
                                          acceptedQuantity: val,
                                          rejectedQuantity: Math.max(0, cur.receivedQuantity - val),
                                        },
                                      }));
                                    }}
                                    className="w-16 px-1.5 py-1 text-xs bg-[#0B0E13] text-[#4ADE80] border border-white/[0.08] rounded text-right font-semibold tabular-nums"
                                  />
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <input
                                    type="number"
                                    min={0}
                                    max={cur.receivedQuantity}
                                    value={cur.rejectedQuantity}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setItemReceipts((prev) => ({
                                        ...prev,
                                        [pId]: {
                                          ...prev[pId],
                                          rejectedQuantity: val,
                                          acceptedQuantity: Math.max(0, cur.receivedQuantity - val),
                                        },
                                      }));
                                    }}
                                    className="w-16 px-1.5 py-1 text-xs bg-[#0B0E13] text-[#F87171] border border-white/[0.08] rounded text-right font-semibold tabular-nums"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#0F1218] border border-white/[0.06] rounded-lg text-xs text-[#9AA3AE]">
                      No remaining line items to receive on this purchase order.
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Quality Inspector Comments
                </label>
                <textarea
                  rows={2}
                  placeholder="Verification notes, seal numbers, batch codes, or defect descriptions..."
                  value={inspectionComments}
                  onChange={(e) => setInspectionComments(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !selectedPOId}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Register Goods Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
