import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

export function OrderConfirmationPage() {
  const { orderId } = useParams();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-krikso-100 shadow-xl shadow-krikso-500/20"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="h-12 w-12 text-krikso-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
        </motion.svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-stone-800 md:text-3xl"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Order Placed Successfully! 🎉
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-3 max-w-md text-stone-600"
      >
        Your order has been placed and is being processed. You'll receive updates on your order status.
      </motion.p>

      {orderId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-5 rounded-2xl border border-stone-100 bg-white px-6 py-4 shadow-sm"
        >
          <p className="text-xs text-stone-500">Order ID</p>
          <p className="mt-1 font-mono text-sm font-bold text-krikso-700">#{orderId.slice(0, 8).toUpperCase()}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <Link
          to="/app/orders"
          className="inline-flex items-center gap-2 rounded-xl bg-krikso-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:bg-krikso-600 hover:shadow-xl"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View My Orders
        </Link>
        <Link
          to="/app/marketplace"
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-all hover:bg-stone-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Continue Shopping
        </Link>
      </motion.div>
    </motion.div>
  );
}
