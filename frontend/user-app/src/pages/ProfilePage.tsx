import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/authStore";
import { userService } from "../services/userService";
import { useToastStore } from "../store/toastStore";

export function ProfilePage() {
  const logout = useAuthStore((s) => s.logout);
  const addToast = useToastStore((s) => s.addToast);
  const { data: profile } = useQuery({ queryKey: ["me"], queryFn: userService.me });
  const { data: addresses = [] } = useQuery({ queryKey: ["addresses"], queryFn: userService.addresses });
  const { register, handleSubmit, reset } = useForm<{
    full_name: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    postal_code: string;
  }>();
  const addAddress = useMutation({
    mutationFn: userService.createAddress,
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      addToast("Address saved successfully!");
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Profile
        </h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-krikso-400 to-krikso-600 text-xl font-bold text-white shadow-lg shadow-krikso-500/25">
            {profile?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-lg font-bold text-stone-800">{profile?.name}</p>
            <p className="text-sm text-stone-500">{profile?.email}</p>
            {profile?.phone && <p className="text-xs text-stone-400">{profile.phone}</p>}
          </div>
        </div>
      </motion.div>

      {/* Saved Addresses */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-3 text-lg font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Saved Addresses
        </h2>
        <div className="space-y-2">
          {addresses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-200 p-6 text-center text-sm text-stone-500">
              No addresses saved yet
            </p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
                <p className="font-semibold text-stone-800">{address.full_name}</p>
                <p className="mt-0.5 text-sm text-stone-600">
                  {address.line1}, {address.city}, {address.state} - {address.postal_code}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Add Address Form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm"
        onSubmit={handleSubmit((v) => addAddress.mutate({ ...v, country: "India" }))}
      >
        <h3 className="mb-4 text-sm font-semibold text-stone-700">Add New Address</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
            placeholder="Full Name"
            {...register("full_name", { required: true })}
          />
          <input
            className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
            placeholder="Phone"
            {...register("phone", { required: true })}
          />
          <input
            className="col-span-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
            placeholder="Address Line 1"
            {...register("line1", { required: true })}
          />
          <input
            className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
            placeholder="City"
            {...register("city", { required: true })}
          />
          <input
            className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
            placeholder="State"
            {...register("state", { required: true })}
          />
          <input
            className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
            placeholder="Postal Code"
            {...register("postal_code", { required: true })}
          />
        </div>
        <button
          type="submit"
          disabled={addAddress.isPending}
          className="mt-4 rounded-xl bg-krikso-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-krikso-600 disabled:opacity-60"
        >
          {addAddress.isPending ? "Saving..." : "Save Address"}
        </button>
      </motion.form>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </motion.div>
    </div>
  );
}
