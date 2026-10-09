import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { procurementApi, PurchaseOrder } from "../../api/procurement";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import {
  ShoppingCart,
  Search,
  Plus,
  FileCheck2,
  X,
  AlertCircle,
  Truck,
  CheckCircle,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

export const PurchaseOrdersPage: React.FC = () => {
  const { user, organization } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const isSupplierCapable =
    organization?.capabilities?.includes("SUPPLIER") || false;

  const canSeeBuyer = [
    "ADMIN",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
    "WAREHOUSE_MANAGER",
    "FINANCE_MANAGER",
  ].includes(user?.role || "");

  const canSeeSupplier =
    isSupplierCapable ||
    ["ADMIN", "SALES_MANAGER", "PROCUREMENT_MANAGER"].includes(user?.role || "");

  const canCreatePO =
    user?.role === "ADMIN" || user?.role === "PROCUREMENT_MANAGER";

  const isSupplierOrg =
    organization?.capabilities?.includes("SUPPLIER") &&
    !organization?.capabilities?.includes("MANUFACTURER");

  const [activeTab, setActiveTab] = useState<"BUYER" | "SUPPLIER">(() => {
    if (isSupplierOrg || user?.role === "SALES_MANAGER") return "SUPPLIER";
    return "BUYER";
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Create PO Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetQuotationId, setTargetQuotationId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [shippingTerms, setShippingTerms] = useState("FOB Origin");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Check URL query param for quotationId to auto-open create modal
  useEffect(() => {
    const qId = searchParams.get("quotationId");
    if (qId && canCreatePO) {
      setTargetQuotationId(qId);
      setIsCreateOpen(true);
    }
  }, [searchParams, canCreatePO]);

  const { data: buyerData, isLoading: isLoadingBuyer } = useQuery({
    queryKey: ["purchaseOrdersBuyer"],
    queryFn: () => procurementApi.getMyPurchaseOrders(),
    enabled: canSeeBuyer,
  });

  const { data: supplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ["purchaseOrdersSupplier"],
    queryFn: () => procurementApi.getSupplierPurchaseOrders(),
    enabled: canSeeSupplier,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, comments }: { id: string; status: string; comments?: string }) =>
      procurementApi.updatePOStatus(id, { status, comments }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrdersBuyer"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrdersSupplier"] });
      if (data?.po && selectedPO) {
        setSelectedPO(data.po);
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to update purchase order status");
    },
  });

  const createPOMutation = useMutation({
    mutationFn: (data: {
      quotationId: string;
      paymentTerms?: string;
      shippingTerms?: string;
      expectedDeliveryDate?: string;
    }) => procurementApi.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrdersBuyer"] });
      setIsCreateOpen(false);
      setTargetQuotationId("");
      setSearchParams({});
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to create purchase order");
    },
  });

  const currentList =
    activeTab === "BUYER"
      ? buyerData?.purchaseOrders || []
      : supplierData?.purchaseOrders || [];

  const filteredOrders = currentList.filter((po) => {
    const matchesStatus = !statusFilter || po.status === statusFilter;
    const matchesSearch =
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.supplierTenantId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            Purchase Orders (PO)
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Track outbound procurement contracts and inbound supplier fulfillment workflows.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Tab switch for Buyer / Supplier */}
          {canSeeBuyer && canSeeSupplier && (
            <div className="flex bg-[#0F1218] p-1 rounded-lg border border-white/[0.06] text-xs font-medium">
              <button
                onClick={() => {
                  setActiveTab("BUYER");
                  setSelectedPO(null);
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "BUYER"
                    ? "bg-[#1D242E] text-[#E6E8EB] border border-white/[0.08]"
                    : "text-[#9AA3AE] hover:text-[#E6E8EB]"
                }`}
              >
                Outbound (Buyer)
              </button>
              <button
                onClick={() => {
                  setActiveTab("SUPPLIER");
                  setSelectedPO(null);
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "SUPPLIER"
                    ? "bg-[#1D242E] text-[#E6E8EB] border border-white/[0.08]"
                    : "text-[#9AA3AE] hover:text-[#E6E8EB]"
                }`}
              >
                Inbound (Supplier)
              </button>
            </div>
          )}

          {canCreatePO && (
            <button
              onClick={() => {
                setTargetQuotationId("");
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C83FF] hover:bg-[#6E76FF] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Generate PO</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#11151C] p-3.5 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#697381] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by PO# or Counterparty..."
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
            <option value="ISSUED">Issued</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="IN_PRODUCTION">In Production</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        {isLoadingBuyer || isLoadingSupplier ? (
          <div className="p-8">
            <SkeletonLoader variant="table-row" count={5} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={
              activeTab === "BUYER"
                ? "No outbound purchase orders found"
                : "No inbound supplier orders found"
            }
            description={
              activeTab === "BUYER"
                ? "Outbound purchase orders originate from awarded quotations in the RFQ bidding process."
                : "Inbound customer orders will appear here once an awarded RFQ tender is converted into a PO."
            }
            action={
              activeTab === "BUYER" && canCreatePO
                ? {
                    label: "Generate Purchase Order",
                    onClick: () => {
                      setTargetQuotationId("");
                      setIsCreateOpen(true);
                    },
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold uppercase text-[#697381] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">PO Number</th>
                  <th className="px-5 py-3">
                    {activeTab === "BUYER" ? "Supplier Partner" : "Buyer Tenant"}
                  </th>
                  <th className="px-5 py-3">Order Date</th>
                  <th className="px-5 py-3">Line Items</th>
                  <th className="px-5 py-3 text-right">Total Amount</th>
                  <th className="px-5 py-3">Fulfillment Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredOrders.map((po) => (
                  <tr
                    key={po._id}
                    className="hover:bg-[#161B23] transition-colors group"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-[#7C83FF] font-mono">
                        {po.poNumber}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-[#E6E8EB]">
                        {po.supplierTenantId?.name || "Partner"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-[11px] text-[#697381] font-mono tabular-nums">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#9AA3AE]">
                      {po.items?.length || 0} product line(s)
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-[#E6E8EB] tabular-nums">
                      ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge status={po.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1.5">
                      {/* Buyer actions */}
                      {activeTab === "BUYER" && (
                        <>
                          {(po.status === "ISSUED" || po.status === "ACKNOWLEDGED") && canCreatePO && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to cancel purchase order ${po.poNumber}?`)) {
                                  updateStatusMutation.mutate({ id: po._id, status: "CANCELLED" });
                                }
                              }}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 text-xs font-semibold text-[#F87171] bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/20 rounded-md transition-colors"
                            >
                              Cancel PO
                            </button>
                          )}

                          {(po.status === "SHIPPED" || po.status === "ACKNOWLEDGED") && (
                            <Link
                              to={`/grn`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-md transition-colors"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>Receive (GRN)</span>
                            </Link>
                          )}

                          {po.status === "SHIPPED" && (
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({ id: po._id, status: "DELIVERED" })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 text-xs font-semibold text-black bg-[#4ADE80] hover:bg-[#22C55E] rounded-md transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </>
                      )}

                      {/* Supplier actions to update lifecycle */}
                      {activeTab === "SUPPLIER" && (
                        <>
                          {po.status === "ISSUED" && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatusMutation.mutate({ id: po._id, status: "ACKNOWLEDGED" })
                                }
                                disabled={updateStatusMutation.isPending}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-[#38BDF8] hover:bg-[#0284C7] rounded-md transition-colors"
                              >
                                Acknowledge
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to decline order ${po.poNumber}?`)) {
                                    updateStatusMutation.mutate({ id: po._id, status: "CANCELLED" });
                                  }
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="px-2.5 py-1 text-xs font-semibold text-[#F87171] bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/20 rounded-md transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {po.status === "ACKNOWLEDGED" && (
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({ id: po._id, status: "IN_PRODUCTION" })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 text-xs font-semibold text-black bg-[#F5C76A] hover:bg-[#EAB308] rounded-md transition-colors"
                            >
                              Start Production
                            </button>
                          )}
                          {po.status === "IN_PRODUCTION" && (
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({ id: po._id, status: "SHIPPED" })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-md transition-colors"
                            >
                              Ship Order
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => setSelectedPO(po)}
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

      {/* PO Details Modal / Drawer */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#E6E8EB] font-mono">
                    {selectedPO.poNumber}
                  </h3>
                  <Badge status={selectedPO.status} size="sm" />
                </div>
                <p className="text-[11px] text-[#697381] mt-0.5 font-mono tabular-nums">
                  Issued on {new Date(selectedPO.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPO(null)}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 bg-[#0F1218] p-3 rounded-lg border border-white/[0.05] text-xs">
                <div>
                  <span className="text-[#697381] font-semibold text-[11px] uppercase tracking-wider block mb-0.5">
                    Payment Terms
                  </span>
                  <div className="text-[#E6E8EB]">
                    {selectedPO.paymentTerms || "Standard Net 30"}
                  </div>
                </div>
                <div>
                  <span className="text-[#697381] font-semibold text-[11px] uppercase tracking-wider block mb-0.5">
                    Shipping Terms
                  </span>
                  <div className="text-[#E6E8EB]">
                    {selectedPO.shippingTerms || "FOB Origin"}
                  </div>
                </div>
              </div>

              <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-[#11151C]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0F1218] border-b border-white/[0.05] font-semibold text-[#697381] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Product SKU / Name</th>
                      <th className="px-4 py-2.5 text-right">Quantity</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {selectedPO.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-[#161B23]">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[#E6E8EB]">
                            {it.productId?.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#697381]">
                            {it.productId?.sku}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#E6E8EB] tabular-nums">
                          {it.quantity} {it.productId?.unitOfMeasure || "units"}
                        </td>
                        <td className="px-4 py-3 text-right text-[#9AA3AE] tabular-nums">
                          ${it.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#E6E8EB] tabular-nums">
                          ${it.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#0F1218] p-3.5 rounded-lg border border-white/[0.05] flex justify-between items-center text-xs">
                <span className="font-semibold text-[#9AA3AE]">Total Contract Value:</span>
                <span className="text-base font-bold text-[#7C83FF] tabular-nums">
                  ${selectedPO.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#0F1218] border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Modal action buttons */}
                {activeTab === "BUYER" && (
                  <>
                    {(selectedPO.status === "ISSUED" || selectedPO.status === "ACKNOWLEDGED") && canCreatePO && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to cancel purchase order ${selectedPO.poNumber}?`)) {
                            updateStatusMutation.mutate({ id: selectedPO._id, status: "CANCELLED" });
                          }
                        }}
                        disabled={updateStatusMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold text-[#F87171] bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/20 rounded-lg transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    {(selectedPO.status === "SHIPPED" || selectedPO.status === "ACKNOWLEDGED") && (
                      <Link
                        to={`/grn`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg transition-colors"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Receive via GRN</span>
                      </Link>
                    )}
                    {selectedPO.status === "SHIPPED" && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ id: selectedPO._id, status: "DELIVERED" })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold text-black bg-[#4ADE80] hover:bg-[#22C55E] rounded-lg transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </>
                )}

                {activeTab === "SUPPLIER" && (
                  <>
                    {selectedPO.status === "ISSUED" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({ id: selectedPO._id, status: "ACKNOWLEDGED" })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#38BDF8] hover:bg-[#0284C7] rounded-lg transition-colors"
                        >
                          Acknowledge Order
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to decline order ${selectedPO.poNumber}?`)) {
                              updateStatusMutation.mutate({ id: selectedPO._id, status: "CANCELLED" });
                            }
                          }}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1.5 text-xs font-semibold text-[#F87171] bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/20 rounded-lg transition-colors"
                        >
                          Decline Order
                        </button>
                      </>
                    )}
                    {selectedPO.status === "ACKNOWLEDGED" && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ id: selectedPO._id, status: "IN_PRODUCTION" })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold text-black bg-[#F5C76A] hover:bg-[#EAB308] rounded-lg transition-colors"
                      >
                        Start Production
                      </button>
                    )}
                    {selectedPO.status === "IN_PRODUCTION" && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ id: selectedPO._id, status: "SHIPPED" })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg transition-colors"
                      >
                        Ship Order
                      </button>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedPO(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create PO from Quotation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171C24] rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-white/[0.09] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-[#7C83FF]" />
                <h3 className="font-bold text-[#E6E8EB] text-sm">
                  Generate Purchase Order
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setSearchParams({});
                }}
                className="p-1 rounded-lg text-[#697381] hover:text-[#E6E8EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormError(null);
                if (!targetQuotationId.trim()) {
                  setFormError("Accepted Quotation ID is required. Please award an RFQ quote first.");
                  return;
                }
                createPOMutation.mutate({
                  quotationId: targetQuotationId.trim(),
                  paymentTerms,
                  shippingTerms,
                  expectedDeliveryDate: expectedDeliveryDate || undefined,
                });
              }}
              className="p-5 space-y-4"
            >
              {formError && (
                <div className="p-3 text-xs bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Awarded Quotation ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Quotation ID from RFQ award"
                  value={targetQuotationId}
                  onChange={(e) => setTargetQuotationId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] placeholder-[#697381] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF] font-mono"
                />
                <p className="text-[10px] text-[#697381] mt-1">
                  This binds the binding quote from the awarded supplier into an official PO.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                >
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                  <option value="Immediate upon GRN">Immediate upon GRN</option>
                  <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Shipping Terms (Incoterms)
                </label>
                <select
                  value={shippingTerms}
                  onChange={(e) => setShippingTerms(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                >
                  <option value="FOB Origin">FOB Origin</option>
                  <option value="FOB Destination">FOB Destination</option>
                  <option value="CIF (Cost, Insurance & Freight)">CIF</option>
                  <option value="EXW (Ex Works)">EXW</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA3AE] mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#0B0E13] text-[#E6E8EB] border border-white/[0.08] rounded-lg focus:outline-none focus:border-[#7C83FF]"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setSearchParams({});
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#1D242E] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPOMutation.isPending}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                >
                  {createPOMutation.isPending ? "Generating..." : "Generate Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
