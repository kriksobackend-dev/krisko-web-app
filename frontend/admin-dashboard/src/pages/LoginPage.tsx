import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAdminAuthStore } from "../store/authStore";
import { adminApi } from "../api/client";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type Form = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAdminAuthStore((s) => s.setToken);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setApiError(null);
    setLoading(true);
    try {
      const { data } = await adminApi.post("/auth/login", values);
      setToken(data.access_token);
      navigate("/");
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
      <div className="hidden w-1/2 items-center justify-center lg:flex" style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
      }}>
        <div className="max-w-md px-12 text-white">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black backdrop-blur-sm">
              K
            </div>
            <span className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              KRIKSO
            </span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Admin Control Center
          </h2>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed">
            Manage sellers, products, orders, shipments, and analytics — all from one powerful dashboard.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "500+", label: "Sellers" },
              { value: "2K+", label: "Products" },
              { value: "50K+", label: "Orders" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/5 p-4 text-center backdrop-blur-sm border border-white/10">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white">
              K
            </div>
            <span className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              KRIKSO Admin
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to access the admin dashboard</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="admin@krikso.com"
                  type="email"
                  {...register("email")}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25 disabled:opacity-60 disabled:cursor-not-allowed"
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
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Protected admin area · KRIKSO © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
