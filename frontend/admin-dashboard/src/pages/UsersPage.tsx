import { useQuery } from "@tanstack/react-query";
import { adminServices } from "../lib/services";

const roleBadge: Record<string, string> = {
  admin: "badge badge-purple",
  buyer: "badge badge-blue",
  seller: "badge badge-green",
};

export function UsersPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminServices.listUsers,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-outfit">Users</h1>
        <p className="mt-1 text-sm text-slate-500">All registered users ({users.length})</p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-6 py-4"><div className="h-4 w-40 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 animate-pulse rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="table-row-hover border-b border-slate-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.full_name || "—"}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{u.phone || "—"}</td>
                    <td className="px-6 py-3">
                      <span className={roleBadge[u.role] || "badge badge-slate"}>{u.role}</span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-400">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
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
