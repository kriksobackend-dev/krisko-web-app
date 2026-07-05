import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { authService } from "../services/authService";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordForm) => {
    setApiError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(values.email);
      setSubmitted(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError((error.response?.data?.detail as string) ?? "Something went wrong. Please try again.");
      } else {
        setApiError("Something went wrong. Please try again.");
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
            Reset Your
            <br />
            Password
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Don't worry, it happens to the best of us. Enter your email and we'll send you a link to reset your
            password.
          </p>
          <div className="mt-10 flex gap-6">
            {[
              { icon: "🔒", label: "Secure Reset" },
              { icon: "📧", label: "Email Link" },
              { icon: "⚡", label: "Quick Process" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm border border-white/10"
              >
                <span>{item.icon}</span>
                <span className="text-white/90">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center bg-stone-50 px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center lg:hidden">
            <img src="/logo.png" alt="KRIKSO India" className="h-12 w-auto" />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
            {submitted ? (
              /* ── Success state ── */
              <div className="text-center py-4">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-krikso-50">
                  <svg className="h-8 w-8 text-krikso-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h1
                  className="text-2xl font-bold text-stone-900"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Check your email
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  If an account exists with that email, we've sent a password reset link. Please check your inbox and
                  spam folder.
                </p>
                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-krikso-700 hover:text-krikso-500 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-6">
                  <Link
                    to="/login"
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to login
                  </Link>
                  <h1
                    className="text-2xl font-bold text-stone-900"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Forgot password?
                  </h1>
                  <p className="mt-1 text-sm text-stone-500">
                    Enter the email address associated with your account and we'll send you a reset link.
                  </p>
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
                        Sending reset link...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-stone-400">
            Remember your password?{" "}
            <Link className="font-semibold text-krikso-700 hover:text-krikso-500 transition" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
