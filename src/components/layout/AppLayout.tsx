import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Warehouse as WarehouseIcon,
  Package,
  History,
  FileCheck2,
  ShoppingCart,
  LogOut,
  Building2,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Send,
  Layers,
  Globe,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../../api/inventory";
import { CommandPalette } from "../common/CommandPalette";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  allowedRoles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AppLayout: React.FC = () => {
  const { user, organization, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const { data: lowStockData } = useQuery({
    queryKey: ["lowStockAlerts"],
    queryFn: () => inventoryApi.getLowStockAlerts(),
    refetchInterval: 30000,
  });

  const lowStockCount = lowStockData?.count || 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Storage & Operations",
      items: [
        {
          label: "Warehouses",
          path: "/warehouses",
          icon: WarehouseIcon,
          allowedRoles: ["ADMIN", "WAREHOUSE_MANAGER"],
        },
        {
          label: "Inventory Stock",
          path: "/inventory",
          icon: Package,
          badge: lowStockCount > 0 ? `${lowStockCount}` : undefined,
          allowedRoles: [
            "ADMIN",
            "WAREHOUSE_MANAGER",
            "PROCUREMENT_MANAGER",
            "PROCUREMENT_OFFICER",
            "FINANCE_MANAGER",
          ],
        },
        {
          label: "Movement Ledger",
          path: "/inventory/movements",
          icon: History,
          allowedRoles: [
            "ADMIN",
            "WAREHOUSE_MANAGER",
            "PROCUREMENT_MANAGER",
            "FINANCE_MANAGER",
          ],
        },
        {
          label: "Goods Receipt (GRN)",
          path: "/grn",
          icon: FileCheck2,
          allowedRoles: [
            "ADMIN",
            "WAREHOUSE_MANAGER",
            "PROCUREMENT_MANAGER",
            "PROCUREMENT_OFFICER",
          ],
        },
      ],
    },
    {
      title: "Procurement & Bidding",
      items: [
        {
          label: "Requisitions (PR)",
          path: "/requisitions",
          icon: ClipboardList,
          allowedRoles: [
            "ADMIN",
            "EMPLOYEE",
            "PROCUREMENT_MANAGER",
            "PROCUREMENT_OFFICER",
          ],
        },
        {
          label: "Requests for Quote",
          path: "/rfqs",
          icon: Send,
          allowedRoles: [
            "ADMIN",
            "PROCUREMENT_MANAGER",
            "PROCUREMENT_OFFICER",
            "SALES_MANAGER",
          ],
        },
        {
          label: "Purchase Orders",
          path: "/orders",
          icon: ShoppingCart,
          allowedRoles: [
            "ADMIN",
            "PROCUREMENT_MANAGER",
            "PROCUREMENT_OFFICER",
            "WAREHOUSE_MANAGER",
            "FINANCE_MANAGER",
            "SALES_MANAGER",
          ],
        },
      ],
    },
    {
      title: "Catalog & Network",
      items: [
        { label: "Product Catalog", path: "/products", icon: Layers },
        {
          label: "B2B Marketplace",
          path: "/marketplace",
          icon: Globe,
          allowedRoles: [
            "ADMIN",
            "PROCUREMENT_MANAGER",
            "PROCUREMENT_OFFICER",
            "SALES_MANAGER",
          ],
        },
        {
          label: "Trading Partners",
          path: "/connections",
          icon: Users,
          allowedRoles: [
            "ADMIN",
            "PROCUREMENT_MANAGER",
            "PROCUREMENT_OFFICER",
            "SALES_MANAGER",
          ],
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          label: "Team & RBAC",
          path: "/settings/team",
          icon: ShieldCheck,
          allowedRoles: ["ADMIN"],
        },
        {
          label: "Organization",
          path: "/settings/organization",
          icon: Building2,
        },
      ],
    },
  ];

  const filteredNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !item.allowedRoles ||
          (user?.role && item.allowedRoles.includes(user.role))
      ),
    }))
    .filter((section) => section.items.length > 0);

  // Derive readable breadcrumbs
  const getBreadcrumbTitle = () => {
    const p = location.pathname;
    if (p === "/dashboard") return "Dashboard";
    if (p === "/warehouses") return "Warehouses & Storage";
    if (p === "/inventory") return "Inventory Stock";
    if (p === "/inventory/movements") return "Movement Ledger";
    if (p === "/grn") return "Goods Receipt Notes";
    if (p === "/orders") return "Purchase Orders";
    if (p === "/requisitions") return "Requisitions";
    if (p === "/rfqs") return "Requests for Quote (RFQ)";
    if (p === "/products") return "Product Catalog";
    if (p === "/marketplace") return "B2B Marketplace";
    if (p === "/connections") return "Trading Partners";
    if (p === "/settings/team") return "Team & RBAC";
    if (p === "/settings/organization") return "Organization Settings";
    return p.split("/")[1] || "Dashboard";
  };

  const isMac = typeof window !== "undefined" && navigator.platform?.toUpperCase().indexOf("MAC") >= 0;

  return (
    <div className="flex h-screen bg-[#0B0E13] text-[#E6E8EB] overflow-hidden antialiased font-sans">
      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 bg-[#0F1218] border-r border-white/[0.06] transition-all duration-200 z-30 select-none ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06]">
          {!collapsed ? (
            <Link
              to="/dashboard"
              className="flex items-center space-x-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#7C83FF]/15 border border-[#7C83FF]/30 flex items-center justify-center text-[#7C83FF] font-bold text-sm shadow-sm group-hover:bg-[#7C83FF]/25 transition-all">
                P
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-sm tracking-tight text-[#E6E8EB]">
                  ProQure
                </span>
                <span className="ml-1.5 text-[9px] font-semibold tracking-wider text-[#7C83FF] uppercase px-1 py-0.2 rounded bg-[#7C83FF]/10 border border-[#7C83FF]/20">
                  ERP
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="w-full flex justify-center"
              title="ProQure ERP"
            >
              <div className="w-8 h-8 rounded-lg bg-[#7C83FF]/15 border border-[#7C83FF]/30 flex items-center justify-center text-[#7C83FF] font-bold text-sm">
                P
              </div>
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 text-[#697381] hover:text-[#E6E8EB] hover:bg-[#171C24] rounded-md transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Tenant Profile Mini Header */}
        {!collapsed && (
          <div className="px-3.5 py-2.5 mx-2 my-2 rounded-lg bg-[#11151C] border border-white/[0.05]">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-[#171C24] border border-white/[0.06] flex items-center justify-center text-[#9AA3AE] flex-shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-[#E6E8EB] truncate">
                  {organization?.name || "Enterprise"}
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  {organization?.capabilities?.map((cap) => (
                    <span
                      key={cap}
                      className="text-[8px] font-semibold px-1 py-0.2 rounded bg-[#171C24] text-[#9AA3AE] border border-white/[0.05] uppercase tracking-wider"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 px-2.5 py-2 space-y-4 overflow-y-auto">
          {filteredNavSections.map((sec, idx) => (
            <div key={idx} className="space-y-0.5">
              {!collapsed && (
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#697381]">
                  {sec.title}
                </div>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center ${
                      collapsed ? "justify-center px-0 py-2" : "justify-between px-2.5 py-1.5"
                    } text-xs font-medium rounded-lg transition-colors group relative ${
                      isActive
                        ? "bg-[#1D242E] text-[#E6E8EB] border border-white/[0.08]"
                        : "text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive
                            ? "text-[#7C83FF]"
                            : "text-[#697381] group-hover:text-[#9AA3AE]"
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-[#F5C76A]/10 text-[#F5C76A] border border-[#F5C76A]/20 tabular-nums">
                        {item.badge}
                      </span>
                    )}

                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F5C76A]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Status & Logout Footer */}
        <div className="p-3 border-t border-white/[0.06] bg-[#0B0E13]/60">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed && (
              <div className="min-w-0 pr-2">
                <div className="text-xs font-medium text-[#E6E8EB] truncate">
                  {user?.fullName}
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                  <span className="text-[10px] font-medium text-[#697381] truncate">
                    {user?.role?.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#697381] hover:text-[#F87171] hover:bg-[#171C24] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[#0F1218] border-r border-white/[0.06] flex flex-col p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#7C83FF]/15 border border-[#7C83FF]/30 flex items-center justify-center text-[#7C83FF] font-bold text-sm">
                  P
                </div>
                <span className="font-bold text-sm tracking-tight text-[#E6E8EB]">
                  ProQure ERP
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#697381] hover:text-[#E6E8EB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCommandOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs bg-[#11151C] border border-white/[0.06] rounded-lg text-[#9AA3AE]"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search commands...</span>
                </div>
                <span className="text-[10px] font-mono bg-[#171C24] px-1.5 py-0.5 rounded">
                  Ctrl K
                </span>
              </button>
            </div>

            <nav className="flex-1 py-3 space-y-4 overflow-y-auto">
              {filteredNavSections.map((sec, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#697381]">
                    {sec.title}
                  </div>
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg ${
                          isActive
                            ? "bg-[#1D242E] text-[#E6E8EB] border border-white/[0.08]"
                            : "text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24]"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className="w-4 h-4 text-[#7C83FF]" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#F5C76A]/15 text-[#F5C76A]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div className="truncate pr-2">
                <div className="text-xs font-medium text-[#E6E8EB] truncate">
                  {user?.fullName}
                </div>
                <div className="text-[10px] text-[#697381]">{organization?.name}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#697381] hover:text-[#F87171] rounded-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0B0E13]">
        {/* Topbar Header */}
        <header className="h-14 bg-[#0F1218] border-b border-white/[0.06] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-[#9AA3AE] hover:text-[#E6E8EB] hover:bg-[#171C24]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#697381] font-medium hidden sm:inline">
                {organization?.name || "Enterprise"}
              </span>
              <span className="text-[#697381] hidden sm:inline">/</span>
              <span className="text-[#E6E8EB] font-semibold">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          {/* Center/Right: Quick Search Button & Status Actions */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Global Search / Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs text-[#9AA3AE] bg-[#11151C] hover:bg-[#171C24] border border-white/[0.06] hover:border-white/[0.12] rounded-lg transition-all group"
            >
              <Search className="w-3.5 h-3.5 text-[#697381] group-hover:text-[#9AA3AE]" />
              <span className="hidden sm:inline text-[#9AA3AE] group-hover:text-[#E6E8EB]">
                Search or jump to...
              </span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#697381] bg-[#171C24] rounded border border-white/[0.06]">
                {isMac ? "⌘K" : "Ctrl+K"}
              </kbd>
            </button>

            {/* Low Stock Alert Badge */}
            {lowStockCount > 0 && (
              <Link
                to="/inventory"
                className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-[#F5C76A] bg-[#F5C76A]/10 border border-[#F5C76A]/20 rounded-lg hover:bg-[#F5C76A]/15 transition-colors"
                title={`${lowStockCount} items below threshold`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#F5C76A]" />
                <span className="hidden sm:inline font-semibold">
                  {lowStockCount} Alert{lowStockCount > 1 ? "s" : ""}
                </span>
              </Link>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-white/[0.06]">
              <div className="w-7 h-7 rounded-lg bg-[#171C24] border border-white/[0.08] flex items-center justify-center text-xs font-semibold text-[#7C83FF]">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-[#E6E8EB] leading-none">
                  {user?.fullName}
                </div>
                <div className="text-[10px] text-[#697381] mt-0.5 leading-none">
                  {user?.role?.replace(/_/g, " ")}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0B0E13] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
