import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Building2,
  Package,
  Warehouse,
  FileCheck2,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Layers,
  BarChart3,
  TrendingUp,
  Cpu,
  Boxes,
  Network,
  ClipboardList,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0B0E13] text-[#E6E8EB] flex flex-col selection:bg-[#7C83FF]/30 selection:text-white font-sans antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B0E13]/85 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#7C83FF] flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-[#6E76FF] transition-colors">
              P
            </div>
            <div className="flex items-center">
              <span className="font-bold text-base tracking-tight text-[#E6E8EB]">ProQure</span>
              <span className="ml-1.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/[0.06] text-[#9AA3AE] border border-white/[0.08] uppercase tracking-wider">
                ERP
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-[#9AA3AE]">
            <a href="#features" className="hover:text-[#E6E8EB] transition-colors">
              Platform Features
            </a>
            <a href="#capabilities" className="hover:text-[#E6E8EB] transition-colors">
              B2B Network
            </a>
            <a href="#workflow" className="hover:text-[#E6E8EB] transition-colors">
              Architecture
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-2.5">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline text-xs text-[#9AA3AE]">
                  Signed in as <span className="text-[#E6E8EB] font-medium">{user?.fullName}</span>
                </span>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#7C83FF] hover:bg-[#6E76FF] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-[#9AA3AE] hover:text-[#E6E8EB] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#7C83FF] hover:bg-[#6E76FF] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Register Org</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#7C83FF]/[0.07] blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#11151C] border border-white/[0.08] text-xs font-medium text-[#9AA3AE] mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C83FF]" />
              <span className="text-[#E6E8EB] font-medium">ProQure OS 2.0</span>
              <span className="text-[#697381]">•</span>
              <span>Autonomous B2B Supply Chain & Multi-Warehouse ERP</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#E6E8EB] max-w-4xl mx-auto leading-[1.12]">
              Precision Procurement &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C83FF] via-[#9AA3AE] to-[#60A5FA]">
                Live Inventory Ledger
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base text-[#9AA3AE] max-w-2xl mx-auto font-normal leading-relaxed">
              Consolidate operations across distributed storage hubs, electronic RFQ tenders,
              streamlined purchase orders, and automated Goods Receipt Notes (GRN) with strict tenant isolation.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg bg-[#7C83FF] hover:bg-[#6E76FF] text-white font-semibold text-xs shadow-sm transition-all"
                >
                  <span>Open Enterprise Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-[#7C83FF] hover:bg-[#6E76FF] text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <span>Register Your Organization</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-[#11151C] hover:bg-[#171C24] border border-white/[0.08] text-[#E6E8EB] font-semibold text-xs transition-all"
                  >
                    <span>Sign In to Workspace</span>
                  </Link>
                </>
              )}
            </div>

            {/* Micro Metrics Bar */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-white/[0.06]">
              <div className="p-3.5 rounded-xl bg-[#11151C] border border-white/[0.06] text-left">
                <div className="text-xl font-bold text-[#7C83FF] font-mono tabular-nums">100%</div>
                <div className="text-[11px] font-medium text-[#9AA3AE] mt-0.5">Tenant Data Isolation</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#11151C] border border-white/[0.06] text-left">
                <div className="text-xl font-bold text-[#60A5FA] font-mono tabular-nums">&lt;50ms</div>
                <div className="text-[11px] font-medium text-[#9AA3AE] mt-0.5">Ledger Movement Sync</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#11151C] border border-white/[0.06] text-left">
                <div className="text-xl font-bold text-[#4ADE80] font-mono tabular-nums">Automatic</div>
                <div className="text-[11px] font-medium text-[#9AA3AE] mt-0.5">GRN Stock Ingestion</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#11151C] border border-white/[0.06] text-left">
                <div className="text-xl font-bold text-[#F5C76A] font-mono tabular-nums">B2B Ready</div>
                <div className="text-[11px] font-medium text-[#9AA3AE] mt-0.5">Dual-Role Marketplace</div>
              </div>
            </div>

            {/* Interactive ERP Shell Mockup Preview */}
            <div className="mt-12 max-w-5xl mx-auto rounded-xl border border-white/[0.08] bg-[#0F1218] p-1.5 shadow-2xl overflow-hidden">
              <div className="rounded-lg bg-[#11151C] border border-white/[0.06] overflow-hidden text-left">
                {/* Mock Window Header */}
                <div className="bg-[#0B0E13] px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <span className="text-[11px] font-mono text-[#697381] ml-2">
                      proqure.enterprise/dashboard
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-[#9AA3AE]">
                      LIVE INSTANCE
                    </span>
                  </div>
                </div>

                {/* Mock Dashboard Content Preview */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Top Mock Stat Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[#0B0E13] border border-white/[0.05]">
                      <div className="text-[10px] font-semibold uppercase text-[#697381]">Active Stock Value</div>
                      <div className="text-base font-bold text-[#E6E8EB] font-mono mt-0.5">₹4,289,500</div>
                      <div className="text-[10px] text-[#4ADE80] font-mono mt-0.5">↑ 12.4% vs last mo</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B0E13] border border-white/[0.05]">
                      <div className="text-[10px] font-semibold uppercase text-[#697381]">Open Purchase Orders</div>
                      <div className="text-base font-bold text-[#E6E8EB] font-mono mt-0.5">18 Active</div>
                      <div className="text-[10px] text-[#60A5FA] font-mono mt-0.5">4 Pending Dispatch</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B0E13] border border-white/[0.05]">
                      <div className="text-[10px] font-semibold uppercase text-[#697381]">Pending Receipts (GRN)</div>
                      <div className="text-base font-bold text-[#E6E8EB] font-mono mt-0.5">6 Shipments</div>
                      <div className="text-[10px] text-[#F5C76A] font-mono mt-0.5">Inspection Queue</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0B0E13] border border-white/[0.05]">
                      <div className="text-[10px] font-semibold uppercase text-[#697381]">Storage Capacity</div>
                      <div className="text-base font-bold text-[#E6E8EB] font-mono mt-0.5">73.8% Utilized</div>
                      <div className="text-[10px] text-[#9AA3AE] font-mono mt-0.5">3 Regional Hubs</div>
                    </div>
                  </div>

                  {/* Mock Workflow Pipeline Bar */}
                  <div className="p-3 rounded-lg bg-[#0B0E13] border border-white/[0.05] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#7C83FF]" />
                      <span className="font-semibold text-[#E6E8EB]">AI Procurement Pipeline</span>
                    </div>
                    <div className="flex items-center space-x-4 text-[11px] text-[#9AA3AE]">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C83FF]" />
                        <span>Requisition</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#697381]" />
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                        <span>RFQ Tender</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#697381]" />
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F5C76A]" />
                        <span>Purchase Order</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#697381]" />
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                        <span>Goods Receipt (GRN)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="features" className="py-16 bg-[#0F1218] border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-[11px] font-bold font-mono tracking-widest text-[#7C83FF] uppercase">
                Enterprise Capabilities
              </h2>
              <p className="mt-1.5 text-2xl font-bold text-[#E6E8EB] tracking-tight sm:text-3xl">
                Engineered for High-Frequency Supply Chains
              </p>
              <p className="mt-2 text-xs sm:text-sm text-[#9AA3AE]">
                Replace ad-hoc spreadsheets with transactional integrity, immutable movement ledgers, and automated replenishment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1 */}
              <div className="p-5 rounded-xl bg-[#11151C] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#7C83FF] flex items-center justify-center mb-4">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#E6E8EB] mb-1.5">Multi-Warehouse Operations</h3>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Configure regional hubs and distribution centers with granular location codes, manager assignments, and live capacity tracking.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-5 rounded-xl bg-[#11151C] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#60A5FA] flex items-center justify-center mb-4">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#E6E8EB] mb-1.5">Double-Entry Stock Ledger</h3>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Every inventory change is audited through immutable movement logs, tracking batches, reference documents, and min-safety thresholds.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-5 rounded-xl bg-[#11151C] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#4ADE80] flex items-center justify-center mb-4">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#E6E8EB] mb-1.5">Goods Receipt Notes (GRN)</h3>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Inspect and verify incoming shipments against purchase orders. Log accepted vs rejected quantities with automated stock updates.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-5 rounded-xl bg-[#11151C] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#7C83FF] flex items-center justify-center mb-4">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#E6E8EB] mb-1.5">Procurement & RFQ Tenders</h3>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Invite verified suppliers to bid on Requests for Quotation (RFQs), evaluate competitive proposals side-by-side, and issue POs.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-5 rounded-xl bg-[#11151C] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#F5C76A] flex items-center justify-center mb-4">
                  <Network className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#E6E8EB] mb-1.5">B2B Network & Marketplace</h3>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Discover verified manufacturers, distributors, and raw-material vendors. Establish formal partner connections and trade seamlessly.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-5 rounded-xl bg-[#11151C] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#171C24] border border-white/[0.08] text-[#F87171] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#E6E8EB] mb-1.5">Tenant Isolation & RBAC</h3>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Enterprise-grade data segregation per tenant organization with role-based access for Admins, Managers, and Staff.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-16 bg-[#0B0E13] border-t border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-[11px] font-bold font-mono tracking-widest text-[#7C83FF] uppercase">
                Workflow Orchestration
              </h2>
              <p className="mt-1.5 text-2xl font-bold text-[#E6E8EB] tracking-tight sm:text-3xl">
                From Requisition to Warehoused Stock
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative p-5 rounded-xl bg-[#11151C] border border-white/[0.06]">
                <div className="text-2xl font-bold text-[#7C83FF]/40 font-mono mb-2">01</div>
                <h4 className="text-sm font-bold text-[#E6E8EB] mb-1">Register & Map Storage</h4>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Setup your organization tenant profile, invite team members, and register your physical warehouses and product catalogs.
                </p>
              </div>

              <div className="relative p-5 rounded-xl bg-[#11151C] border border-white/[0.06]">
                <div className="text-2xl font-bold text-[#7C83FF]/40 font-mono mb-2">02</div>
                <h4 className="text-sm font-bold text-[#E6E8EB] mb-1">Source & Issue Orders</h4>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Publish RFQs to partner networks or issue direct Purchase Orders with automated payment and delivery milestones.
                </p>
              </div>

              <div className="relative p-5 rounded-xl bg-[#11151C] border border-white/[0.06]">
                <div className="text-2xl font-bold text-[#7C83FF]/40 font-mono mb-2">03</div>
                <h4 className="text-sm font-bold text-[#E6E8EB] mb-1">Inspect & Reconcile</h4>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  Conduct physical arrival inspections via GRN, verify acceptance quantities, and post instant updates to your inventory ledger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-14 bg-[#11151C] border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#E6E8EB] tracking-tight">
              Ready to modernize your enterprise operations?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#9AA3AE] max-w-lg mx-auto">
              Join leading manufacturers and distributors who run their procurement, inventory, and fulfillment on ProQure.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-6 py-2.5 rounded-lg bg-[#7C83FF] hover:bg-[#6E76FF] text-white font-semibold text-xs shadow-sm transition-all"
              >
                <span>Register Your Organization</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#171C24] hover:bg-[#1D242E] border border-white/[0.08] text-[#E6E8EB] font-semibold text-xs transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0B0E13] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#697381] space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#9AA3AE]">ProQure Enterprise ERP</span>
            <span>•</span>
            <span className="font-mono text-[11px]">&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-5">
            <Link to="/login" className="hover:text-[#9AA3AE] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-[#9AA3AE] transition-colors">
              Register Organization
            </Link>
            <a href="#features" className="hover:text-[#9AA3AE] transition-colors">
              Features
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
