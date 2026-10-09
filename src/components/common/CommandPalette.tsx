import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  History,
  FileCheck2,
  ShoppingCart,
  ClipboardList,
  Send,
  Layers,
  Globe,
  Users,
  ShieldCheck,
  Building2,
  Search,
  PlusCircle,
  ArrowRight,
  Command,
  X,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Actions";
  path?: string;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  description?: string;
  allowedRoles?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const commandItems: CommandItem[] = [
    // Navigation
    {
      id: "nav-dashboard",
      title: "Overview Dashboard",
      category: "Navigation",
      path: "/dashboard",
      icon: LayoutDashboard,
      description: "Real-time metrics, KPI cards, and stock status",
    },
    {
      id: "nav-warehouses",
      title: "Warehouses & Storage Hubs",
      category: "Navigation",
      path: "/warehouses",
      icon: Warehouse,
      description: "Manage physical facilities and storage locations",
      allowedRoles: ["ADMIN", "WAREHOUSE_MANAGER"],
    },
    {
      id: "nav-inventory",
      title: "Inventory Stock Levels",
      category: "Navigation",
      path: "/inventory",
      icon: Package,
      description: "On-hand quantities, reservations, and reorder points",
      allowedRoles: [
        "ADMIN",
        "WAREHOUSE_MANAGER",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
        "FINANCE_MANAGER",
      ],
    },
    {
      id: "nav-movements",
      title: "Movement Audit Ledger",
      category: "Navigation",
      path: "/inventory/movements",
      icon: History,
      description: "Immutable receipts, transfers, and adjustment ledger",
      allowedRoles: [
        "ADMIN",
        "WAREHOUSE_MANAGER",
        "PROCUREMENT_MANAGER",
        "FINANCE_MANAGER",
      ],
    },
    {
      id: "nav-grn",
      title: "Goods Receipt Notes (GRN)",
      category: "Navigation",
      path: "/grn",
      icon: FileCheck2,
      description: "Receive goods, inspect quality, and update stock",
      allowedRoles: [
        "ADMIN",
        "WAREHOUSE_MANAGER",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
      ],
    },
    {
      id: "nav-orders",
      title: "Purchase Orders",
      category: "Navigation",
      path: "/orders",
      icon: ShoppingCart,
      description: "Track buyer and supplier purchase orders",
      allowedRoles: [
        "ADMIN",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
        "WAREHOUSE_MANAGER",
        "FINANCE_MANAGER",
        "SALES_MANAGER",
      ],
    },
    {
      id: "nav-rfqs",
      title: "Requests for Quote (RFQs)",
      category: "Navigation",
      path: "/rfqs",
      icon: Send,
      description: "Tender bidding, supplier quotes, and award contracts",
      allowedRoles: [
        "ADMIN",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
        "SALES_MANAGER",
      ],
    },
    {
      id: "nav-requisitions",
      title: "Purchase Requisitions (PR)",
      category: "Navigation",
      path: "/requisitions",
      icon: ClipboardList,
      description: "Internal department purchase approval requests",
      allowedRoles: [
        "ADMIN",
        "EMPLOYEE",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
      ],
    },
    {
      id: "nav-products",
      title: "Product Catalog",
      category: "Navigation",
      path: "/products",
      icon: Layers,
      description: "Manage SKUs, categories, and marketplace pricing",
    },
    {
      id: "nav-marketplace",
      title: "B2B Marketplace",
      category: "Navigation",
      path: "/marketplace",
      icon: Globe,
      description: "Discover verified manufacturers and suppliers",
      allowedRoles: [
        "ADMIN",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
        "SALES_MANAGER",
      ],
    },
    {
      id: "nav-connections",
      title: "Trading Partners",
      category: "Navigation",
      path: "/connections",
      icon: Users,
      description: "Manage supplier and buyer network connections",
      allowedRoles: [
        "ADMIN",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
        "SALES_MANAGER",
      ],
    },
    {
      id: "nav-team",
      title: "Team & RBAC Permissions",
      category: "Navigation",
      path: "/settings/team",
      icon: ShieldCheck,
      description: "Manage organization users and security roles",
      allowedRoles: ["ADMIN"],
    },
    {
      id: "nav-org",
      title: "Organization Profile",
      category: "Navigation",
      path: "/settings/organization",
      icon: Building2,
      description: "Corporate address, capabilities, and settings",
    },

    // Quick Actions
    {
      id: "act-new-pr",
      title: "Create Purchase Requisition",
      category: "Quick Actions",
      path: "/requisitions",
      icon: PlusCircle,
      description: "Draft and submit an internal requisition for approval",
      allowedRoles: [
        "ADMIN",
        "EMPLOYEE",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
      ],
    },
    {
      id: "act-new-grn",
      title: "Receive Goods (New GRN)",
      category: "Quick Actions",
      path: "/grn",
      icon: FileCheck2,
      description: "Create a goods receipt note against an open purchase order",
      allowedRoles: [
        "ADMIN",
        "WAREHOUSE_MANAGER",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
      ],
    },
    {
      id: "act-new-rfq",
      title: "Launch New RFQ Tender",
      category: "Quick Actions",
      path: "/rfqs",
      icon: Send,
      description: "Issue a request for quotation to connected suppliers",
      allowedRoles: [
        "ADMIN",
        "PROCUREMENT_MANAGER",
        "PROCUREMENT_OFFICER",
      ],
    },
    {
      id: "act-new-product",
      title: "Add Product to Catalog",
      category: "Quick Actions",
      path: "/products",
      icon: Layers,
      description: "Register a new SKU with specifications and pricing",
      allowedRoles: ["ADMIN", "PROCUREMENT_MANAGER"],
    },
  ];

  const filteredItems = commandItems.filter((item) => {
    if (item.allowedRoles && user?.role && !item.allowedRoles.includes(user.role)) {
      return false;
    }
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? filteredItems.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        executeItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const executeItem = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#171C24] border border-white/[0.09] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.06] bg-[#11151C]/60">
          <Search className="w-4 h-4 text-[#9AA3AE] mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands, modules, pages... (Type to filter)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#E6E8EB] placeholder-[#697381] focus:outline-none"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#9AA3AE] bg-[#11151C] border border-white/[0.08] rounded">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-1 text-[#697381] hover:text-[#E6E8EB] rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#697381]">
              No commands matching "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#1D242E] text-[#E6E8EB]"
                      : "text-[#9AA3AE] hover:bg-[#1A2029] hover:text-[#E6E8EB]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-[#7C83FF]/15 text-[#7C83FF]"
                          : "bg-[#11151C] text-[#9AA3AE]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-[#E6E8EB] truncate">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-[#697381] truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-[10px] text-[#697381] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-opacity ${
                        isSelected ? "text-[#7C83FF] opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-white/[0.04] bg-[#0F1218] flex items-center justify-between text-[11px] text-[#697381]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#171C24] rounded border border-white/[0.06] text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1 py-0.5 bg-[#171C24] rounded border border-white/[0.06] text-[10px] font-mono">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#171C24] rounded border border-white/[0.06] text-[10px] font-mono">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="text-[#9AA3AE]">ProQure Enterprise System</span>
        </div>
      </div>
    </div>
  );
};
