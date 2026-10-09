import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { warehouseApi } from "../../api/warehouses";
import { inventoryApi } from "../../api/inventory";
import { grnApi } from "../../api/grn";
import { procurementApi } from "../../api/procurement";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/common/Badge";
import { StatCard } from "../../components/common/StatCard";
import {
  Warehouse,
  Package,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  ClipboardList,
  Send,
  PlusCircle,
  ShoppingCart,
  Globe,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user, organization } = useAuth();
  const [activeAiQuery, setActiveAiQuery] = useState<string | null>(null);

  const { data: whData, isLoading: loadingWh } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehouseApi.getWarehouses(),
  });

  const { data: invData, isLoading: loadingInv } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => inventoryApi.getInventory(),
  });

  const { data: alertsData, isLoading: loadingAlerts } = useQuery({
    queryKey: ["lowStockAlerts"],
    queryFn: () => inventoryApi.getLowStockAlerts(),
  });

  const { data: grnData, isLoading: loadingGrn } = useQuery({
    queryKey: ["grns"],
    queryFn: () => grnApi.getGRNs(),
  });

  const { data: prData, isLoading: loadingPr } = useQuery({
    queryKey: ["purchaseRequisitions"],
    queryFn: () => procurementApi.getPurchaseRequisitions(),
  });

  const { data: rfqData, isLoading: loadingRfq } = useQuery({
    queryKey: ["rfqs"],
    queryFn: () => procurementApi.getRFQs(),
  });

  const canSeeBuyerPOs = [
    "ADMIN",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
    "WAREHOUSE_MANAGER",
    "FINANCE_MANAGER",
  ].includes(user?.role || "");

  const canSeeSupplierPOs =
    organization?.capabilities?.includes("SUPPLIER") ||
    ["ADMIN", "SALES_MANAGER"].includes(user?.role || "");

  const canCreatePR = [
    "ADMIN",
    "EMPLOYEE",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
  ].includes(user?.role || "");

  const canCreateRFQ = [
    "ADMIN",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
  ].includes(user?.role || "");

  const canCreateGRN = [
    "ADMIN",
    "WAREHOUSE_MANAGER",
    "PROCUREMENT_MANAGER",
    "PROCUREMENT_OFFICER",
  ].includes(user?.role || "");

  const { data: poData } = useQuery({
    queryKey: ["purchaseOrdersBuyer"],
    queryFn: () => procurementApi.getMyPurchaseOrders(),
    enabled: canSeeBuyerPOs,
  });

  const { data: supplierPoData } = useQuery({
    queryKey: ["purchaseOrdersSupplier"],
    queryFn: () => procurementApi.getSupplierPurchaseOrders(),
    enabled: canSeeSupplierPOs && !canSeeBuyerPOs,
  });

  const activeWarehouses =
    whData?.warehouses.filter((w) => w.status === "ACTIVE").length || 0;
  const totalStockItems = invData?.count || 0;
  const lowStockCount = alertsData?.count || 0;
  const totalGRNs = grnData?.count || 0;
  const pendingPRs =
    prData?.prs.filter((p) => p.status === "PENDING_APPROVAL").length || 0;
  const openRFQs =
    rfqData?.rfqs.filter((r) => r.status === "OPEN").length || 0;
  const totalPOs = canSeeBuyerPOs
    ? poData?.purchaseOrders?.length || 0
    : supplierPoData?.purchaseOrders?.length || 0;

  // Calculate greeting by time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Monthly throughput data points for the dark SVG chart
  const performanceData = [
    { month: "Apr", received: 18, issued: 14, poValue: 12.4 },
    { month: "May", received: 24, issued: 19, poValue: 16.8 },
    { month: "Jun", received: 21, issued: 22, poValue: 15.2 },
    { month: "Jul", received: 32, issued: 28, poValue: 24.5 },
    { month: "Aug", received: 29, issued: 26, poValue: 21.0 },
    { month: "Sep", received: 38, issued: 34, poValue: 28.4 },
  ];

  const maxReceived = Math.max(...performanceData.map((d) => d.received), 1);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Executive Command Header */}
      <div className="bg-[#11151C] border border-white/[0.06] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              Live Operations Online
            </span>
            <span className="text-xs text-[#697381]">
              Tenant: <span className="text-[#9AA3AE] font-medium">{organization?.name || "Enterprise"}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#E6E8EB] tracking-tight">
            {getGreeting()}, {user?.fullName || "Operator"}
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA3AE] mt-0.5">
            Operational overview of stock levels, active bids, requisition approvals, and goods receipts.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canCreatePR && (
            <Link
              to="/requisitions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] hover:border-white/[0.12] rounded-lg transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5 text-[#9AA3AE]" />
              <span>New Requisition</span>
            </Link>
          )}
          {canCreateRFQ && (
            <Link
              to="/rfqs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#E6E8EB] bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] hover:border-white/[0.12] rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#7C83FF]" />
              <span>Create RFQ</span>
            </Link>
          )}
          {canCreateGRN && (
            <Link
              to="/grn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7C83FF] hover:bg-[#6E76FF] rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Receive Goods (GRN)</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Warehouses"
          value={activeWarehouses}
          subValue={`of ${whData?.warehouses.length || 0} total`}
          change={4.2}
          changePeriod="storage throughput"
          icon={Warehouse}
          sparklineData={[30, 35, 40, 45, 50, 60, 65, 80]}
        />
        <StatCard
          label="Inventory Stock Lines"
          value={totalStockItems}
          subValue="Active SKUs"
          change={12.8}
          changePeriod="catalog growth"
          icon={Package}
          sparklineData={[40, 50, 45, 60, 70, 75, 85, 95]}
        />
        <StatCard
          label="Low Stock Alerts"
          value={lowStockCount}
          subValue={lowStockCount > 0 ? "Requires Action" : "Optimal Levels"}
          change={lowStockCount > 0 ? -8.5 : 0}
          changePeriod="vs last cycle"
          icon={AlertTriangle}
          sparklineData={[20, 35, 45, 30, 25, 40, 35, lowStockCount > 0 ? 60 : 10]}
          className={lowStockCount > 0 ? "border-[#F5C76A]/20" : ""}
        />
        <StatCard
          label="Goods Receipts (GRN)"
          value={totalGRNs}
          subValue="Total Verified"
          change={18.4}
          changePeriod="fulfillment speed"
          icon={FileCheck2}
          sparklineData={[25, 30, 45, 50, 60, 70, 80, 92]}
        />
      </div>

      {/* Procurement Workflow Pipeline */}
      <div className="bg-[#11151C] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#E6E8EB] tracking-tight">
              Enterprise Procurement & Fulfillment Workflow
            </h2>
            <p className="text-xs text-[#9AA3AE]">
              Lifecycle from internal requisition to goods receipt and storage ledger update.
            </p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-[#7C83FF] hover:text-[#9AA3AE] flex items-center gap-1 transition-colors"
          >
            <span>Track Orders</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Step 1: Requisitions */}
          <Link
            to="/requisitions"
            className="p-4 rounded-lg bg-[#0F1218] border border-white/[0.05] hover:border-white/[0.12] transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-[#9AA3AE] mb-2">
              <span className="font-semibold text-[11px] text-[#7C83FF] uppercase tracking-wider">
                Step 1 • PR
              </span>
              <ClipboardList className="w-4 h-4 text-[#697381] group-hover:text-[#7C83FF] transition-colors" />
            </div>
            <div className="text-lg font-bold text-[#E6E8EB] tabular-nums">
              {prData?.prs.length || 0}
            </div>
            <div className="text-[11px] text-[#9AA3AE] mt-0.5">
              <span className="text-[#F5C76A] font-semibold tabular-nums">{pendingPRs}</span> pending approval
            </div>
          </Link>

          {/* Step 2: RFQ Bids */}
          <Link
            to="/rfqs"
            className="p-4 rounded-lg bg-[#0F1218] border border-white/[0.05] hover:border-white/[0.12] transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-[#9AA3AE] mb-2">
              <span className="font-semibold text-[11px] text-[#60A5FA] uppercase tracking-wider">
                Step 2 • Bidding
              </span>
              <Send className="w-4 h-4 text-[#697381] group-hover:text-[#60A5FA] transition-colors" />
            </div>
            <div className="text-lg font-bold text-[#E6E8EB] tabular-nums">
              {rfqData?.rfqs.length || 0}
            </div>
            <div className="text-[11px] text-[#9AA3AE] mt-0.5">
              <span className="text-[#60A5FA] font-semibold tabular-nums">{openRFQs}</span> active tenders
            </div>
          </Link>

          {/* Step 3: Purchase Orders */}
          <Link
            to="/orders"
            className="p-4 rounded-lg bg-[#0F1218] border border-white/[0.05] hover:border-white/[0.12] transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-[#9AA3AE] mb-2">
              <span className="font-semibold text-[11px] text-[#F5C76A] uppercase tracking-wider">
                Step 3 • Orders
              </span>
              <ShoppingCart className="w-4 h-4 text-[#697381] group-hover:text-[#F5C76A] transition-colors" />
            </div>
            <div className="text-lg font-bold text-[#E6E8EB] tabular-nums">
              {totalPOs}
            </div>
            <div className="text-[11px] text-[#9AA3AE] mt-0.5">
              Awarded vendor contracts
            </div>
          </Link>

          {/* Step 4: Goods Receipt */}
          <Link
            to="/grn"
            className="p-4 rounded-lg bg-[#0F1218] border border-white/[0.05] hover:border-white/[0.12] transition-colors group"
          >
            <div className="flex items-center justify-between text-xs text-[#9AA3AE] mb-2">
              <span className="font-semibold text-[11px] text-[#4ADE80] uppercase tracking-wider">
                Step 4 • Receipt
              </span>
              <FileCheck2 className="w-4 h-4 text-[#697381] group-hover:text-[#4ADE80] transition-colors" />
            </div>
            <div className="text-lg font-bold text-[#E6E8EB] tabular-nums">
              {totalGRNs}
            </div>
            <div className="text-[11px] text-[#9AA3AE] mt-0.5">
              Inspected & stocked in hubs
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Performance Chart & AI Business Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Operations Performance Chart */}
        <div className="lg:col-span-2 bg-[#11151C] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-[#E6E8EB] tracking-tight">
                  Procurement & Receipt Throughput
                </h3>
                <p className="text-xs text-[#9AA3AE]">
                  Monthly volume of verified goods receipts vs orders issued
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#7C83FF]" />
                  <span className="text-[#9AA3AE]">Receipts (GRN)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#38BDF8]" />
                  <span className="text-[#9AA3AE]">Orders Issued</span>
                </div>
              </div>
            </div>

            {/* Dark Styled SVG Chart */}
            <div className="h-64 mt-4 relative flex flex-col justify-end pt-4 pb-2">
              {/* Background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-white/[0.06] w-full" />
                <div className="border-b border-white/[0.06] w-full" />
                <div className="border-b border-white/[0.06] w-full" />
                <div className="border-b border-white/[0.06] w-full" />
              </div>

              {/* Bar columns */}
              <div className="relative z-10 flex items-end justify-between gap-3 sm:gap-6 h-48 px-2">
                {performanceData.map((d, idx) => {
                  const recHeight = Math.round((d.received / maxReceived) * 100);
                  const issHeight = Math.round((d.issued / maxReceived) * 100);

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#171C24] border border-white/[0.09] px-2 py-1 rounded text-[10px] text-[#E6E8EB] font-mono pointer-events-none shadow-lg z-20 whitespace-nowrap">
                        {d.month}: {d.received} receipts • {d.issued} orders
                      </div>

                      <div className="flex items-end gap-1.5 w-full justify-center h-full">
                        {/* Receipt Bar */}
                        <div
                          style={{ height: `${recHeight}%` }}
                          className="w-3 sm:w-5 bg-[#7C83FF] hover:bg-[#6E76FF] rounded-t transition-all duration-300 relative"
                        />
                        {/* Issued Bar */}
                        <div
                          style={{ height: `${issHeight}%` }}
                          className="w-3 sm:w-5 bg-[#38BDF8]/60 hover:bg-[#38BDF8] rounded-t transition-all duration-300 relative"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#697381] group-hover:text-[#E6E8EB] mt-2 transition-colors">
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs text-[#697381]">
            <span className="tabular-nums">Avg cycle fulfillment: 3.4 days</span>
            <span className="text-[#4ADE80] font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +14.2% throughput efficiency
            </span>
          </div>
        </div>

        {/* Right 1 Col: AI Operational Assistant */}
        <div className="bg-[#11151C] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#7C83FF]/15 border border-[#7C83FF]/30 flex items-center justify-center text-[#7C83FF]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#E6E8EB] uppercase tracking-wider">
                    AI Supply Chain Assistant
                  </h3>
                  <span className="text-[10px] text-[#4ADE80] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                    Analyzing Enterprise Telemetry
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insight Content */}
            <div className="mt-3.5 space-y-3">
              <div className="bg-[#0F1218] border border-white/[0.05] rounded-lg p-3 text-xs">
                <div className="text-[11px] text-[#9AA3AE] font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Executive Synthesis</span>
                  <span className="text-[10px] text-[#697381]">Live</span>
                </div>
                <p className="text-[#E6E8EB] leading-relaxed">
                  {lowStockCount > 0 ? (
                    <>
                      Detected <strong className="text-[#F5C76A]">{lowStockCount} stock deficit lines</strong> across active warehouses. Recommend expediting requisitions to mitigate stockout risks.
                    </>
                  ) : (
                    <>
                      All warehouse storage levels are currently within safe thresholds. Procurement cycle lead times are performing 14% faster than target SLA.
                    </>
                  )}
                </p>

                <div className="mt-2.5 pt-2 border-t border-white/[0.04] space-y-1 text-[11px] text-[#9AA3AE]">
                  <div className="flex items-center justify-between">
                    <span>Requisitions awaiting sign-off:</span>
                    <strong className="text-[#E6E8EB] tabular-nums">{pendingPRs} PRs</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active competitive tender bids:</span>
                    <strong className="text-[#E6E8EB] tabular-nums">{openRFQs} Open</strong>
                  </div>
                </div>
              </div>

              {/* Interactive prompt chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-[#697381] uppercase tracking-wider">
                  Quick AI Actions
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() =>
                      setActiveAiQuery(
                        "Stock deficit analysis: 3 items are approaching buffer limits in Main Distribution Hub. Recommend creating PR with aggregate MOQ to leverage bulk discount."
                      )
                    }
                    className="text-left px-2.5 py-1.5 rounded bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.05] text-[11px] text-[#9AA3AE] hover:text-[#E6E8EB] transition-colors"
                  >
                    → Analyze reorder priority items
                  </button>
                  <button
                    onClick={() =>
                      setActiveAiQuery(
                        "Supplier pricing trend: Average bid pricing in active RFQs is 4.8% lower than historical PO baseline. Recommended action: award pending bids before quote validity expires."
                      )
                    }
                    className="text-left px-2.5 py-1.5 rounded bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.05] text-[11px] text-[#9AA3AE] hover:text-[#E6E8EB] transition-colors"
                  >
                    → Benchmark supplier quote variance
                  </button>
                </div>
              </div>

              {activeAiQuery && (
                <div className="p-2.5 rounded-lg bg-[#7C83FF]/10 border border-[#7C83FF]/20 text-[11px] text-[#E6E8EB] animate-in fade-in">
                  <div className="font-semibold text-[#7C83FF] mb-0.5">✦ AI Diagnosis</div>
                  <div>{activeAiQuery}</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
            <Link
              to="/inventory"
              className="text-xs font-semibold text-[#7C83FF] hover:text-[#9AA3AE] transition-colors"
            >
              Resolve Stock Alerts →
            </Link>
          </div>
        </div>
      </div>

      {/* Low Stock Urgent Recommendations (if any) */}
      {alertsData && alertsData.alerts.length > 0 && (
        <div className="bg-[#11151C] border border-[#F5C76A]/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-[#F5C76A] font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-[#F5C76A]" />
              <span>Automated Stock Reorder Alerts</span>
            </div>
            <Link
              to="/inventory"
              className="text-xs font-semibold text-[#F5C76A] hover:underline"
            >
              Manage all stock
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alertsData.alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.stockId}
                className="bg-[#0F1218] p-3.5 rounded-lg border border-white/[0.06] flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E6E8EB] truncate">
                      {alert.product.name}
                    </span>
                    <Badge variant="warning" size="sm">
                      Low
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-[#697381] mt-0.5">
                    {alert.product.sku} • {alert.warehouse.name}
                  </div>
                  <div className="text-[#9AA3AE] mt-2 text-[11px] leading-relaxed">
                    {alert.recommendation}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#697381] block">On-Hand</span>
                    <span className="font-bold text-[#F87171] tabular-nums">
                      {alert.currentStock} {alert.product.unitOfMeasure}
                    </span>
                  </div>
                  <Link
                    to="/requisitions"
                    className="px-2.5 py-1 rounded bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] text-[11px] font-medium text-[#E6E8EB] transition-colors"
                  >
                    Draft PR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: Recent Goods Receipt Notes Table */}
      <div className="bg-[#11151C] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#E6E8EB] tracking-tight">
              Recent Goods Receipt Notes (GRN)
            </h2>
            <p className="text-xs text-[#9AA3AE]">
              Physical inventory deliveries verified at storage facilities
            </p>
          </div>
          <Link
            to="/grn"
            className="text-xs font-semibold text-[#7C83FF] hover:text-[#9AA3AE] transition-colors"
          >
            View all ({totalGRNs}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1218] border-b border-white/[0.05] text-[11px] font-semibold text-[#697381] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">GRN Document</th>
                <th className="px-5 py-3">Purchase Order</th>
                <th className="px-5 py-3">Receiving Hub</th>
                <th className="px-5 py-3">Supplier Tenant</th>
                <th className="px-5 py-3">Inspection Status</th>
                <th className="px-5 py-3 text-right">Timestamp</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {grnData?.grns && grnData.grns.length > 0 ? (
                grnData.grns.slice(0, 5).map((grn) => (
                  <tr
                    key={grn._id}
                    className="hover:bg-[#161B23] transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-semibold text-[#7C83FF]">
                        {grn.grnNumber}
                      </div>
                      <div className="text-[10px] text-[#697381]">
                        Delivery #{grn.deliveryNoteNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#E6E8EB]">
                      {grn.poId?.poNumber || "PO-Direct"}
                    </td>
                    <td className="px-5 py-3.5 text-[#9AA3AE]">
                      {grn.warehouseId?.name}
                    </td>
                    <td className="px-5 py-3.5 text-[#9AA3AE]">
                      {grn.supplierTenantId?.name || "Direct Supplier"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={grn.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-[#697381] tabular-nums">
                      {new Date(grn.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to="/grn"
                        className="text-xs font-medium text-[#9AA3AE] group-hover:text-[#7C83FF] transition-colors"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-[#697381]">
                    No Goods Receipt Notes registered yet. Receive stock from verified POs to generate notes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
