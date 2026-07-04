import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Enter a valid phone number").max(14).optional().or(z.literal("")),
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupForm) => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await authService.signup({
        ...values,
        phone: values.phone || undefined,
      });
      setTokens(res.access_token, res.refresh_token);
      navigate("/app");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError((error.response?.data?.detail as string) ?? "Signup failed. Please try again.");
      } else {
        setApiError("Signup failed. Please try again.");
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
            Join 50,000+
            <br />
            Smart Farmers
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Create your account and start shopping from India's largest agricultural marketplace. Save up to 40% on every purchase.
          </p>
          <div className="mt-10 space-y-3">
            {[
              { icon: "✅", text: "Free account — no subscription needed" },
              { icon: "🚚", text: "Free delivery on first order" },
              { icon: "🔒", text: "Secure payments via Razorpay" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-white/90">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — signup form */}
      <div className="flex w-full items-center justify-center bg-stone-50 px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center lg:hidden">
            <img src="/logo.png" alt="KRIKSO India" className="h-12 w-auto" />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Create your account
              </h1>
              <p className="mt-1 text-sm text-stone-500">Start shopping the best agricultural products today</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Full Name</label>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm transition-all focus:border-krikso-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100"
                  placeholder="Enter your full name"
                  {...register("name")}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

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
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone Number <span className="text-stone-400">(optional)</span></label>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm transition-all focus:border-krikso-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100"
                  placeholder="+91 9876543210"
                  {...register("phone")}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
                <input
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm transition-all focus:border-krikso-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100"
                  placeholder="Min. 8 characters"
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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-500">
                Already have an account?{" "}
                <Link className="font-semibold text-krikso-700 hover:text-krikso-500 transition" to="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-stone-400">
            By creating an account, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
