import { ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CourseDetailsPage } from "../pages/CourseDetailsPage";
import { CoursesPage } from "../pages/CoursesPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { HomePage } from "../pages/HomePage";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { MarketplacePage } from "../pages/MarketplacePage";
import { OtpVerificationPage } from "../pages/OtpVerificationPage";
import { OrdersPage } from "../pages/OrdersPage";
import { OrderConfirmationPage } from "../pages/OrderConfirmationPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { SplashPage } from "../pages/SplashPage";
import { SignupPage } from "../pages/SignupPage";
import { useAuthStore } from "../store/authStore";

function Protected({ children }: { children: ReactElement }) {
  const token = useAuthStore((state) => state.accessToken);
  return token ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  /* Public routes */
  { path: "/", element: <LandingPage /> },
  { path: "/splash", element: <SplashPage /> },
  { path: "/otp-verification", element: <OtpVerificationPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },

  /* Authenticated app routes */
  {
    path: "/app",
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "marketplace", element: <MarketplacePage /> },
      { path: "products/:productId", element: <ProductDetailsPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:courseId", element: <CourseDetailsPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "order-confirmation/:orderId", element: <OrderConfirmationPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
