import { useQuery } from "@tanstack/react-query";
import { adminServices } from "../lib/services";

const statCards = [
  {
    key: "total_users",
    label: "Total Users",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/25",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "total_orders",
    label: "Total Orders",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    gradient: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/25",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "total_revenue",
    label: "Total Revenue",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-krikso-500 to-krikso-600",
    shadow: "shadow-krikso-500/25",
    format: (v: number) => `₹${v.toLocaleString("en-IN")}`,
  },
];

export function DashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: adminServices.metrics,
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders-recent"],
    queryFn: adminServices.listAllOrders,
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "badge badge-amber",
      paid: "badge badge-blue",
      packed: "badge badge-purple",
      shipped: "badge badge-blue",
      delivered: "badge badge-green",
      cancelled: "badge badge-red",
    };
    return map[s] || "badge badge-slate";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-outfit">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your marketplace</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {statCards.map((card) => {
          const value = metrics ? (metrics as Record<string, number>)[card.key] ?? 0 : 0;
          return (
            <div key={card.key} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white shadow-lg ${card.shadow}`}>
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
                    {card.icon}
                  </div>
                </div>
                <p className="mt-4 text-3xl font-extrabold font-outfit">
                  {metrics ? card.format(value) : "—"}
                </p>
                <p className="mt-1 text-sm font-medium text-white/70">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-800 font-outfit">Recent Orders</h2>
          <span className="text-xs font-medium text-slate-400">Last {Math.min(orders.length, 10)} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.slice(0, 10).map((o) => (
                  <tr key={o.id} className="table-row-hover border-b border-slate-50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">
                      {o.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-800">{o.user_name || "—"}</p>
                      <p className="text-xs text-slate-400">{o.user_email}</p>
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-700">
                      ₹{o.total_amount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3">
                      <span className={statusBadge(o.status)}>{o.status}</span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-400">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
