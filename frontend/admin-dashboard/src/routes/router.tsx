import { ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminShell } from "../components/AdminShell";
import { CoursesPage } from "../pages/CoursesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { OrdersPage } from "../pages/OrdersPage";
import { ProductsPage } from "../pages/ProductsPage";
import { SellersPage } from "../pages/SellersPage";
import { UsersPage } from "../pages/UsersPage";
import { useAdminAuthStore } from "../store/authStore";

function Protected({ children }: { children: ReactElement }) {
  const token = useAdminAuthStore((s) => s.accessToken);
  return token ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <Protected>
        <AdminShell />
      </Protected>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "sellers", element: <SellersPage /> },
      { path: "users", element: <UsersPage /> },
    ],
  },
]);
