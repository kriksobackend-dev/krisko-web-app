import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { authService } from "../services/authService";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

/**
 * Supabase appends recovery tokens as a URL hash fragment:
 * /reset-password#access_token=...&type=recovery&...
 */
function getAccessTokenFromHash(): string | null {
  const hash = window.location.hash.substring(1); // remove leading #
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    const token = getAccessTokenFromHash();
    if (token) {
      setAccessToken(token);
      // Clear hash from URL for cleanliness
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setTokenMissing(true);
    }
  }, []);

  const onSubmit = async (values: ResetPasswordForm) => {
    if (!accessToken) return;
    setApiError(null);
    setLoading(true);
    try {
      await authService.resetPassword(accessToken, values.newPassword);
      setSuccess(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(
          (error.response?.data?.detail as string) ?? "Failed to reset password. The link may have expired."
        );
      } else {
        setApiError("Failed to reset password. Please try again.");
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
            Set Your New
            <br />
            Password
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Choose a strong password to keep your account secure. You'll be able to sign in with your new password right
            away.
          </p>
          <div className="mt-10 flex gap-6">
            {[
              { icon: "🔐", label: "Strong Security" },
              { icon: "✅", label: "Instant Update" },
              { icon: "🛡️", label: "Account Safe" },
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
            {tokenMissing ? (
              /* ── Invalid / missing token ── */
              <div className="text-center py-4">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h1
                  className="text-2xl font-bold text-stone-900"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Invalid Reset Link
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link
                  to="/forgot-password"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-krikso-500 to-krikso-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:shadow-xl hover:shadow-krikso-500/30 hover:brightness-110"
                >
                  Request New Link
                </Link>
              </div>
            ) : success ? (
              /* ── Success state ── */
              <div className="text-center py-4">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-krikso-50">
                  <svg className="h-8 w-8 text-krikso-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1
                  className="text-2xl font-bold text-stone-900"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Password Reset!
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-krikso-500 to-krikso-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:shadow-xl hover:shadow-krikso-500/30 hover:brightness-110"
                >
                  Sign In Now
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-6">
                  <h1
                    className="text-2xl font-bold text-stone-900"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Set new password
                  </h1>
                  <p className="mt-1 text-sm text-stone-500">
                    Your new password must be at least 8 characters long.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">New Password</label>
                    <input
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm transition-all focus:border-krikso-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100"
                      placeholder="Min. 8 characters"
                      type="password"
                      {...register("newPassword")}
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Confirm Password</label>
                    <input
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm transition-all focus:border-krikso-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100"
                      placeholder="Re-enter your new password"
                      type="password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
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
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Resetting password...
                      </span>
                    ) : (
                      "Reset Password"
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
