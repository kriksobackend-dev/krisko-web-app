import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "../lib/queryClient";
import { orderService } from "../services/orderService";
import { useToastStore } from "../store/toastStore";
import type { OrderSummary } from "../services/orderService";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", label: "Pending" },
  paid: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", label: "Paid" },
  packed: { color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", label: "Packed" },
  shipped: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", label: "Shipped" },
  delivered: { color: "text-krikso-700", bg: "bg-krikso-50 border-krikso-200", label: "Delivered" },
  cancelled: { color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Cancelled" },
};

const cancellationReasons = [
  "Changed my mind",
  "Found a better price",
  "Ordered by mistake",
  "Delivery taking too long",
  "Other",
];

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { color: "text-stone-700", bg: "bg-stone-50 border-stone-200", label: status };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

function CancelModal({
  order,
  onClose,
}: {
  order: OrderSummary;
  onClose: () => void;
}) {
  const addToast = useToastStore((s) => s.addToast);
  const [reason, setReason] = useState(cancellationReasons[0]);
  const [customReason, setCustomReason] = useState("");

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      orderService.cancelOrder(orderId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["cancelled-orders"] });
      addToast("Order cancellation requested");
      onClose();
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        addToast("Cancellation already requested for this order", "info");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["cancelled-orders"] });
        onClose();
      } else {
        addToast("Failed to cancel order. Please try again.", "error");
      }
    },
  });

  const handleCancel = () => {
    const finalReason = reason === "Other" ? customReason || "Other" : reason;
    cancelMutation.mutate({ orderId: order.order_id, reason: finalReason });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">Cancel Order</h3>
            <p className="text-xs text-stone-500">Order #{order.order_id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-stone-600">
          Please select a reason for cancellation. This cannot be undone.
        </p>

        <div className="mt-4 space-y-2">
          {cancellationReasons.map((r) => (
            <label
              key={r}
              className={`block cursor-pointer rounded-xl border p-3 text-sm transition-all ${
                reason === r
                  ? "border-red-300 bg-red-50 text-red-700 font-medium"
                  : "border-stone-100 bg-white text-stone-700 hover:border-stone-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="cancelReason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="h-3.5 w-3.5 accent-red-500"
                />
                {r}
              </div>
            </label>
          ))}
        </div>

        <AnimatePresence>
          {reason === "Other" && (
            <motion.textarea
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please tell us more..."
              className="mt-3 w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
              rows={3}
            />
          )}
        </AnimatePresence>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
          >
            Keep Order
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCancel}
            disabled={cancelMutation.isPending || (reason === "Other" && !customReason.trim())}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function OrdersPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [activeTab, setActiveTab] = useState<"active" | "cancelled">("active");
  const [cancellingOrder, setCancellingOrder] = useState<OrderSummary | null>(null);

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: orderService.myOrders,
  });

  const { data: cancelledOrders = [], isLoading: loadingCancelled } = useQuery({
    queryKey: ["cancelled-orders"],
    queryFn: orderService.cancelledOrders,
  });

  const cancellableStatuses = new Set(["pending", "paid", "packed"]);
  const cancelledOrderIds = new Set(cancelledOrders.map((c) => c.order_id));
  const activeOrders = orders.filter((o) => !cancelledOrderIds.has(o.order_id));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
          My Orders
        </h1>
        <p className="mt-1 text-sm text-stone-500">Track and manage your orders</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "active"
              ? "bg-white text-krikso-700 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Active Orders
          {activeOrders.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-krikso-100 text-[10px] font-bold text-krikso-700">
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "cancelled"
              ? "bg-white text-red-600 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Cancelled
          {cancelledOrders.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-[10px] font-bold text-red-600">
              {cancelledOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Active Orders */}
      <AnimatePresence mode="wait">
        {activeTab === "active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {loadingOrders ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-stone-100 bg-white p-5">
                    <div className="h-5 w-40 rounded bg-stone-100" />
                    <div className="mt-3 h-4 w-24 rounded bg-stone-100" />
                    <div className="mt-3 h-8 w-32 rounded-xl bg-stone-100" />
                  </div>
                ))}
              </div>
            ) : activeOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-4 text-5xl">📦</div>
                <h3 className="text-lg font-semibold text-stone-700">No orders yet</h3>
                <p className="mt-1 text-sm text-stone-500">Start shopping to see your orders here</p>
              </motion.div>
            ) : (
              activeOrders.map((order, i) => (
                <motion.div
                  key={order.order_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-bold text-stone-800">
                          #{order.order_id.slice(0, 8).toUpperCase()}
                        </p>
                        <StatusBadge status={order.order_status} />
                      </div>
                      <p className="mt-1 text-xs text-stone-500">{formatDate(order.created_at)}</p>
                    </div>
                    <p className="text-lg font-bold text-stone-800">₹{order.total_amount.toLocaleString("en-IN")}</p>
                  </div>

                  {/* Status details */}
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-stone-500">Payment:</span>
                      <span className="font-medium text-stone-700">{order.payment_status || "Pending"}</span>
                    </div>
                    {order.shipment_status && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-stone-500">Shipping:</span>
                        <span className="font-medium text-stone-700">{order.shipment_status}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {cancellableStatuses.has(order.order_status) && !cancelledOrderIds.has(order.order_id) && (
                    <div className="mt-4 border-t border-stone-50 pt-3">
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Order
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Cancelled Orders */}
        {activeTab === "cancelled" && (
          <motion.div
            key="cancelled"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {loadingCancelled ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-stone-100 bg-white p-5">
                    <div className="h-5 w-40 rounded bg-stone-100" />
                    <div className="mt-3 h-4 w-60 rounded bg-stone-100" />
                  </div>
                ))}
              </div>
            ) : cancelledOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="mb-4 text-5xl">✅</div>
                <h3 className="text-lg font-semibold text-stone-700">No cancelled orders</h3>
                <p className="mt-1 text-sm text-stone-500">That's great! All your orders are active.</p>
              </motion.div>
            ) : (
              cancelledOrders.map((item, i) => (
                <motion.div
                  key={item.order_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-bold text-stone-800">
                          #{item.order_id.slice(0, 8).toUpperCase()}
                        </p>
                        <StatusBadge status="cancelled" />
                      </div>
                      <p className="mt-1 text-xs text-stone-500">{formatDate(item.created_at)}</p>
                    </div>
                    <p className="text-lg font-bold text-stone-800">₹{item.total_amount.toLocaleString("en-IN")}</p>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-stone-500">Reason:</span>
                      <span className="font-medium text-stone-700">{item.cancellation_reason}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-stone-500">Status:</span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-semibold ${
                          item.cancellation_status === "refunded"
                            ? "bg-krikso-50 text-krikso-700"
                            : item.cancellation_status === "approved"
                              ? "bg-blue-50 text-blue-700"
                              : item.cancellation_status === "rejected"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.cancellation_status.charAt(0).toUpperCase() + item.cancellation_status.slice(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancellingOrder && (
          <CancelModal order={cancellingOrder} onClose={() => setCancellingOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
