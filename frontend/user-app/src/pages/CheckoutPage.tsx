import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, selectTotalPrice } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import { userService } from "../services/userService";
import { orderService } from "../services/orderService";
import { queryClient } from "../lib/queryClient";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type AddressForm = {
  full_name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postal_code: string;
};

const steps = ["Address", "Review", "Payment"];

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore(selectTotalPrice);
  const addToast = useToastStore((s) => s.addToast);

  const [step, setStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");

  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: userService.addresses,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>();

  const addAddressMutation = useMutation({
    mutationFn: (data: AddressForm) => userService.createAddress({ ...data, country: "India" }),
    onSuccess: async (newAddress) => {
      reset();
      setShowNewAddress(false);
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      await refetchAddresses();
      setSelectedAddressId(newAddress.id);
      addToast("Address saved!");
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (data) => {
      clearCart();
      addToast("Order placed successfully! 🎉");
      navigate(`/app/order-confirmation/${data.order_id}`);
    },
    onError: () => {
      addToast("Failed to place order. Please try again.", "error");
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedAddressId) return;

    if (paymentMethod === "razorpay") {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxxxx",
        amount: Math.round(totalPrice * 100),
        currency: "INR",
        name: "KRIKSO",
        description: `Order for ${items.length} items`,
        handler: () => {
          createOrderMutation.mutate({
            address_id: selectedAddressId,
            payment_method: "razorpay",
            items: items.map((i) => ({ product_id: i.productId, quantity: i.qty })),
          });
        },
      };
      new window.Razorpay(options).open();
    } else {
      createOrderMutation.mutate({
        address_id: selectedAddressId,
        payment_method: "cod",
        items: items.map((i) => ({ product_id: i.productId, quantity: i.qty })),
      });
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  if (items.length === 0) {
    navigate("/app/cart");
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Checkout
        </h1>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (i < step) setStep(i);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i <= step
                  ? "bg-krikso-500 text-white shadow-md shadow-krikso-500/30"
                  : "bg-stone-100 text-stone-400"
              }`}
            >
              {i < step ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </button>
            <span className={`text-sm font-medium ${i <= step ? "text-krikso-700" : "text-stone-400"}`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-8 rounded-full transition-colors ${i < step ? "bg-krikso-400" : "bg-stone-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {/* Step 1: Address */}
        {step === 0 && (
          <motion.div
            key="address"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-stone-800">Select Delivery Address</h2>

            {addresses.length === 0 && !showNewAddress && (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
                <div className="mb-3 text-4xl">📍</div>
                <p className="text-sm text-stone-600">No addresses saved yet</p>
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="mt-3 rounded-xl bg-krikso-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-krikso-600"
                >
                  Add New Address
                </button>
              </div>
            )}

            <div className="space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`block cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                    selectedAddressId === address.id
                      ? "border-krikso-500 bg-krikso-50 shadow-md shadow-krikso-500/10"
                      : "border-stone-100 bg-white hover:border-krikso-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1 h-4 w-4 text-krikso-500 accent-krikso-500"
                    />
                    <div>
                      <p className="font-semibold text-stone-800">{address.full_name}</p>
                      <p className="mt-0.5 text-sm text-stone-600">
                        {address.line1}, {address.city}, {address.state} - {address.postal_code}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-400">{address.phone || ""}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {!showNewAddress && addresses.length > 0 && (
              <button
                onClick={() => setShowNewAddress(true)}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-stone-300 px-4 py-3 text-sm font-medium text-stone-600 transition-all hover:border-krikso-400 hover:text-krikso-700 w-full justify-center"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add New Address
              </button>
            )}

            {/* New Address Form */}
            <AnimatePresence>
              {showNewAddress && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit((data) => addAddressMutation.mutate(data))}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <h3 className="mb-4 text-sm font-semibold text-stone-700">New Address</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
                      placeholder="Full Name *"
                      {...register("full_name", { required: true })}
                    />
                    <input
                      className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
                      placeholder="Phone *"
                      {...register("phone", { required: true })}
                    />
                    <input
                      className="col-span-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
                      placeholder="Address Line 1 *"
                      {...register("line1", { required: true })}
                    />
                    <input
                      className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
                      placeholder="City *"
                      {...register("city", { required: true })}
                    />
                    <input
                      className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
                      placeholder="State *"
                      {...register("state", { required: true })}
                    />
                    <input
                      className="rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
                      placeholder="Postal Code *"
                      {...register("postal_code", { required: true })}
                    />
                  </div>
                  {Object.keys(errors).length > 0 && (
                    <p className="mt-2 text-xs text-red-500">Please fill all required fields</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={addAddressMutation.isPending}
                      className="rounded-xl bg-krikso-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-krikso-600 disabled:opacity-60"
                    >
                      {addAddressMutation.isPending ? "Saving..." : "Save Address"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewAddress(false); reset(); }}
                      className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <button
              disabled={!selectedAddressId}
              onClick={() => setStep(1)}
              className="w-full rounded-xl bg-krikso-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:bg-krikso-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Review →
            </button>
          </motion.div>
        )}

        {/* Step 2: Review */}
        {step === 1 && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <h2 className="text-lg font-semibold text-stone-800">Order Review</h2>

            {/* Delivery Address */}
            {selectedAddress && (
              <div className="rounded-2xl border border-stone-100 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-700">Delivery Address</h3>
                  <button onClick={() => setStep(0)} className="text-xs font-medium text-krikso-600 hover:text-krikso-700">
                    Change
                  </button>
                </div>
                <p className="text-sm text-stone-700 font-medium">{selectedAddress.full_name}</p>
                <p className="text-sm text-stone-600">
                  {selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="rounded-2xl border border-stone-100 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-stone-700">Items ({items.length})</h3>
              <div className="divide-y divide-stone-50">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-50 text-stone-300">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-stone-500">Qty: {item.qty} × ₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <span className="text-sm font-semibold text-stone-800">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-2xl border border-stone-100 bg-krikso-50 p-4">
              <div className="flex justify-between">
                <span className="font-semibold text-stone-700">Total</span>
                <span className="text-xl font-bold text-krikso-700">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="rounded-xl border border-stone-200 px-6 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl bg-krikso-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 hover:bg-krikso-600"
              >
                Continue to Payment →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === 2 && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <h2 className="text-lg font-semibold text-stone-800">Payment Method</h2>

            <div className="space-y-3">
              <label
                className={`block cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                  paymentMethod === "cod"
                    ? "border-krikso-500 bg-krikso-50 shadow-md shadow-krikso-500/10"
                    : "border-stone-100 bg-white hover:border-krikso-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-4 w-4 accent-krikso-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💵</span>
                    <div>
                      <p className="font-semibold text-stone-800">Cash on Delivery</p>
                      <p className="text-xs text-stone-500">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`block cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-krikso-500 bg-krikso-50 shadow-md shadow-krikso-500/10"
                    : "border-stone-100 bg-white hover:border-krikso-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="h-4 w-4 accent-krikso-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="font-semibold text-stone-800">Pay Online (Razorpay)</p>
                      <p className="text-xs text-stone-500">UPI, Cards, Net Banking, Wallets</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-stone-100 bg-krikso-50 p-4">
              <div className="flex justify-between">
                <span className="font-semibold text-stone-700">Total to Pay</span>
                <span className="text-xl font-bold text-krikso-700">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-xl border border-stone-200 px-6 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50"
              >
                ← Back
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePlaceOrder}
                disabled={createOrderMutation.isPending}
                className="flex-1 rounded-xl bg-krikso-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:bg-krikso-600 hover:shadow-xl disabled:opacity-60"
              >
                {createOrderMutation.isPending
                  ? "Placing Order..."
                  : paymentMethod === "razorpay"
                    ? `Pay ₹${totalPrice.toLocaleString("en-IN")}`
                    : "Place Order (COD)"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
