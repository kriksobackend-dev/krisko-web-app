import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, selectTotalItems, selectTotalPrice } from "../store/cartStore";

export function CartPage() {
  const { items, remove, updateQty } = useCartStore();
  const totalItems = useCartStore(selectTotalItems);
  const totalPrice = useCartStore(selectTotalPrice);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="mb-4 text-6xl">🛒</div>
        <h2 className="text-xl font-bold text-stone-700" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-stone-500">Browse the marketplace and add some products</p>
        <Link
          to="/app/marketplace"
          className="mt-5 rounded-xl bg-krikso-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:bg-krikso-600 hover:shadow-xl"
        >
          Browse Products
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Shopping Cart
        </h1>
        <p className="mt-1 text-sm text-stone-500">{totalItems} {totalItems === 1 ? "item" : "items"} in your cart</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-3 lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <Link to={`/app/products/${item.productId}`} className="flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-stone-50 text-stone-300">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        to={`/app/products/${item.productId}`}
                        className="font-semibold text-stone-800 transition-colors hover:text-krikso-700 line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-stone-500">
                        ₹{item.price.toLocaleString("en-IN")} / {item.unitLabel}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50">
                        <button
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          className="px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-krikso-700"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-stone-800">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          className="px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-krikso-700"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-stone-800">
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => remove(item.productId)}
                          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Remove item"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-fit rounded-2xl border border-stone-100 bg-white p-5 shadow-sm lg:sticky lg:top-24"
        >
          <h2 className="text-lg font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Order Summary
          </h2>
          <div className="mt-4 space-y-3 border-b border-stone-100 pb-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Subtotal ({totalItems} items)</span>
              <span className="font-medium text-stone-800">₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Delivery</span>
              <span className="font-medium text-krikso-600">Free</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <span className="text-base font-bold text-stone-800">Total</span>
            <span className="text-xl font-bold text-krikso-700">₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <Link
            to="/app/checkout"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-krikso-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:bg-krikso-600 hover:shadow-xl"
          >
            Proceed to Checkout
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
