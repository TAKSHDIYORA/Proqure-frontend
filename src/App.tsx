import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

import { HomePage } from "./pages/home/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { WarehousesPage } from "./pages/warehouses/WarehousesPage";
import { InventoryPage } from "./pages/inventory/InventoryPage";
import { MovementsPage } from "./pages/inventory/MovementsPage";
import { GRNPage } from "./pages/grn/GRNPage";
import { PurchaseOrdersPage } from "./pages/procurement/PurchaseOrdersPage";
import { RequisitionsPage } from "./pages/procurement/RequisitionsPage";
import { RFQsPage } from "./pages/procurement/RFQsPage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { MarketplacePage } from "./pages/network/MarketplacePage";
import { ConnectionsPage } from "./pages/network/ConnectionsPage";
import { TeamPage } from "./pages/settings/TeamPage";
import { OrganizationPage } from "./pages/settings/OrganizationPage";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/warehouses"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "WAREHOUSE_MANAGER"]}>
                  <WarehousesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "WAREHOUSE_MANAGER",
                    "PROCUREMENT_MANAGER",
                    "PROCUREMENT_OFFICER",
                    "FINANCE_MANAGER",
                  ]}
                >
                  <InventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/movements"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "WAREHOUSE_MANAGER",
                    "PROCUREMENT_MANAGER",
                    "FINANCE_MANAGER",
                  ]}
                >
                  <MovementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grn"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "WAREHOUSE_MANAGER",
                    "PROCUREMENT_MANAGER",
                    "PROCUREMENT_OFFICER",
                  ]}
                >
                  <GRNPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "PROCUREMENT_MANAGER",
                    "PROCUREMENT_OFFICER",
                    "WAREHOUSE_MANAGER",
                    "FINANCE_MANAGER",
                    "SALES_MANAGER",
                  ]}
                >
                  <PurchaseOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requisitions"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "EMPLOYEE",
                    "PROCUREMENT_MANAGER",
                    "PROCUREMENT_OFFICER",
                  ]}
                >
                  <RequisitionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rfqs"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "PROCUREMENT_MANAGER",
                    "PROCUREMENT_OFFICER",
                    "SALES_MANAGER",
                  ]}
                >
                  <RFQsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/products" element={<ProductsPage />} />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "PROCUREMENT_MANAGER",
                    "PROCUREMENT_OFFICER",
                    "SALES_MANAGER",
                  ]}
                >
                  <MarketplacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/connections"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "PROCUREMENT_MANAGER",
                    "PROCUREMENT_OFFICER",
                    "SALES_MANAGER",
                  ]}
                >
                  <ConnectionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/team"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <TeamPage />
                </ProtectedRoute>
              }
            />
            <Route path="/settings/organization" element={<OrganizationPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
