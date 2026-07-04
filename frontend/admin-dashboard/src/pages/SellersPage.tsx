import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { adminServices } from "../lib/services";

type SellerForm = { display_name: string; contact_email: string };

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm transition-all focus:border-krikso-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600";

export function SellersPage() {
  const { register, handleSubmit, reset } = useForm<SellerForm>();
  const [toast, setToast] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (values: SellerForm) => adminServices.createSeller(values),
    onSuccess: () => {
      reset();
      setToast("Seller created successfully!");
      setTimeout(() => setToast(null), 3000);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-outfit">Sellers</h1>
        <p className="mt-1 text-sm text-slate-500">Register and manage marketplace sellers</p>
      </div>

      {toast && (
        <div className="rounded-xl border border-krikso-200 bg-krikso-50 px-4 py-3 text-sm font-medium text-krikso-700">
          ✓ {toast}
        </div>
      )}

      <div className="admin-card p-6">
        <h2 className="text-base font-bold text-slate-800 font-outfit">Register New Seller</h2>
        <p className="mt-1 text-sm text-slate-500">Add a new seller to the marketplace</p>
        <form
          className="mt-5 space-y-4 max-w-lg"
          onSubmit={handleSubmit((v) => createMutation.mutate(v))}
        >
          <div>
            <label className={labelCls}>Seller Name</label>
            <input className={inputCls} placeholder="Farm Fresh Organics" {...register("display_name")} />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input className={inputCls} type="email" placeholder="seller@email.com" {...register("contact_email")} />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Seller"}
          </button>
        </form>
      </div>
    </div>
  );
}
