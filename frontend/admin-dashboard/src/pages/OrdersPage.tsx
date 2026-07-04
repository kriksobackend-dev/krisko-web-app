import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminServices } from "../lib/services";

const statusOptions = ["pending", "paid", "packed", "shipped", "delivered", "cancelled"];

const statusBadge: Record<string, string> = {
  pending: "badge badge-amber",
  paid: "badge badge-blue",
  packed: "badge badge-purple",
  shipped: "badge badge-blue",
  delivered: "badge badge-green",
  cancelled: "badge badge-red",
};

export function OrdersPage() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: adminServices.listAllOrders,
  });
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminServices.updateOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      flash("Order status updated!");
    },
  });

  const reviewCancellationMut = useMutation({
    mutationFn: ({ id, approve, note }: { id: string; approve: boolean; note?: string }) =>
      adminServices.reviewCancellation(id, approve, note),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      flash(
        vars.approve
          ? "Cancellation request approved! Order cancelled."
          : "Cancellation request rejected!"
      );
    },
  });

  const filtered =
    filter === "all"
      ? orders
      : filter === "cancellation_requests"
      ? orders.filter((o) => o.cancellation?.status === "requested")
      : orders.filter((o) => o.status === filter);

  const counts: Record<string, number> = {
    all: orders.length,
    cancellation_requests: orders.filter((o) => o.cancellation?.status === "requested").length,
  };
  for (const o of orders) {
    counts[o.status] = (counts[o.status] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-outfit">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">View and manage all customer orders</p>
      </div>

      {toast && (
        <div className="rounded-xl border border-krikso-200 bg-krikso-50 px-4 py-3 text-sm font-medium text-krikso-700">
          ✓ {toast}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "cancellation_requests", ...statusOptions].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold capitalize transition-all ${
              filter === s
                ? "bg-slate-900 text-white shadow-md scale-[1.02]"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {s.replace("_", " ")} {counts[s] ? `(${counts[s]})` : "(0)"}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="admin-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800 capitalize">
            {filter.replace("_", " ")} ({filtered.length} Orders)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-150 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Delivery Address</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No orders found for this filter
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const hasCxlRequest = o.cancellation?.status === "requested";
                  return (
                    <tr key={o.id} className="table-row-hover border-b border-slate-50">
                      <td className="px-6 py-3 align-top font-mono text-xs text-slate-500 font-semibold">
                        {o.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-3 align-top">
                        <div>
                          <p className="font-medium text-slate-800">{o.user_name || "—"}</p>
                          <p className="text-xs text-slate-400">{o.user_email}</p>
                          {hasCxlRequest && o.cancellation && (
                            <div className="mt-2 rounded-lg bg-rose-50 border border-rose-100 p-2.5 text-xs text-rose-800 max-w-xs shadow-sm">
                              <p className="font-semibold text-rose-900 mb-0.5">Cancellation Requested</p>
                              <p className="italic text-rose-700">"{o.cancellation.reason}"</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 align-top">
                        {o.shipping_address ? (
                          <div className="max-w-[220px]">
                            <p className="font-medium text-slate-800 text-xs">{o.shipping_address.full_name}</p>
                            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                              {o.shipping_address.line1}
                              {o.shipping_address.line2 ? `, ${o.shipping_address.line2}` : ""}
                            </p>
                            <p className="text-[11px] text-slate-500 leading-snug">
                              {o.shipping_address.city}, {o.shipping_address.state} — {o.shipping_address.postal_code}
                            </p>
                            {o.shipping_address.landmark && (
                              <p className="text-[11px] text-slate-400 italic">Near: {o.shipping_address.landmark}</p>
                            )}
                            <p className="mt-1 text-[11px] font-semibold text-krikso-600 flex items-center gap-1">
                              <span>📞</span> {o.shipping_address.phone}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 italic">No address</span>
                        )}
                      </td>
                      <td className="px-6 py-3 align-top text-slate-600">
                        {o.items_count} item{o.items_count !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-3 align-top font-semibold text-slate-700 font-outfit">
                        ₹{o.total_amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-3 align-top">
                        <span className={statusBadge[o.status] || "badge badge-slate"}>
                          {o.status}
                        </span>
                        {hasCxlRequest && (
                          <span className="badge bg-rose-100 border border-rose-200 text-rose-700 text-[10px] uppercase font-bold tracking-wider ml-1 animate-pulse">
                            CXL REQ
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 align-top text-xs text-slate-400">
                        {o.created_at
                          ? new Date(o.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-3 align-top text-right">
                        {hasCxlRequest ? (
                          <div className="flex flex-col sm:flex-row gap-1.5 justify-end">
                            <button
                              onClick={() =>
                                reviewCancellationMut.mutate({ id: o.id, approve: true })
                              }
                              disabled={reviewCancellationMut.isPending}
                              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-2.5 py-1.5 transition-colors shadow-sm disabled:opacity-50"
                            >
                              Approve Cancel
                            </button>
                            <button
                              onClick={() =>
                                reviewCancellationMut.mutate({ id: o.id, approve: false })
                              }
                              disabled={reviewCancellationMut.isPending}
                              className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-2.5 py-1.5 transition-all shadow-sm disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateStatusMut.mutate({ id: o.id, status: e.target.value })
                            }
                            disabled={updateStatusMut.isPending}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 transition focus:border-krikso-400 focus:outline-none focus:ring-1 focus:ring-krikso-100"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
