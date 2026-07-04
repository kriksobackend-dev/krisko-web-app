import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await authService.login(values);
      setTokens(res.access_token, res.refresh_token);
      navigate("/app");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError((error.response?.data?.detail as string) ?? "Login failed. Please try again.");
      } else {
        setApiError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div
        className="hidden w-1/2 items-center justify-center lg:flex"
        style={{
          background: "linear-gradient(135deg, #0f3f1a 0%, #1f6d2e 40%, #2f9e44 100%)",
        }}
      >
        <div className="max-w-md px-12 text-white">
          <div className="mb-8">
            <img src="/logo.png" alt="KRIKSO India" className="h-20 w-auto" />
          </div>
          <h2 className="text-4xl font-extrabold leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            किसानों का
            <br />
            Smart Bazaar
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Fresh produce, premium seeds, fertilizers & farm equipment — delivered directly from verified sellers to your doorstep.
          </p>
          <div className="mt-10 flex gap-6">
            {[
              { icon: "🌾", label: "Premium Seeds" },
              { icon: "🚚", label: "Fast Delivery" },
              { icon: "💰", label: "Best Prices" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm border border-white/10">
                <span>{item.icon}</span>
                <span className="text-white/90">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full items-center justify-center bg-stone-50 px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center lg:hidden">
            <img src="/logo.png" alt="KRIKSO India" className="h-12 w-auto" />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-stone-500">Sign in to shop the best agricultural products</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Email Address</label>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm transition-all focus:border-krikso-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100"
                  placeholder="you@example.com"
                  type="email"
                  {...register("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm transition-all focus:border-krikso-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100"
                  placeholder="Enter your password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {apiError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-krikso-500 to-krikso-700 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:shadow-xl hover:shadow-krikso-500/30 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-500">
                New to KRIKSO?{" "}
                <Link className="font-semibold text-krikso-700 hover:text-krikso-500 transition" to="/signup">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-stone-400">
            By signing in, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
