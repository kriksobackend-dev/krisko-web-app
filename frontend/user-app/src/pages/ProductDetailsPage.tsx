import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { marketplaceService } from "../services/marketplaceService";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

export function ProductDetailsPage() {
  const { productId } = useParams();
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const addToast = useToastStore((s) => s.addToast);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => marketplaceService.getProduct(productId!),
    enabled: !!productId,
  });

  const handleAddToCart = () => {
    if (!product) return;
    add({
      productId: product.id,
      name: product.name,
      price: product.unit_price,
      qty,
      image: product.images?.[0]?.image_url ?? null,
      unitLabel: product.unit_label,
    });
    addToast(`${product.name} (×${qty}) added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-stone-100" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded-lg bg-stone-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-stone-100" />
          <div className="h-24 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-12 animate-pulse rounded-xl bg-stone-100" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="mb-4 text-5xl">😕</div>
        <h2 className="text-lg font-semibold text-stone-700">Product not found</h2>
        <Link to="/app/marketplace" className="mt-4 rounded-xl bg-krikso-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-krikso-600">
          Back to Marketplace
        </Link>
      </motion.div>
    );
  }

  const mainImage = product.images?.[0]?.image_url ?? null;
  const inStock = product.inventory ? product.inventory.stock_available > 0 : true;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-stone-500">
        <Link to="/app" className="hover:text-krikso-600 transition-colors">Home</Link>
        <span>›</span>
        <Link to="/app/marketplace" className="hover:text-krikso-600 transition-colors">Marketplace</Link>
        <span>›</span>
        <span className="text-stone-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm"
        >
          {mainImage ? (
            <img src={mainImage} alt={product.name} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-stone-50 text-6xl text-stone-300">
              <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3">
              {product.images.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-stone-200 object-cover"
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-5"
        >
          <div>
            <h1 className="text-2xl font-bold text-stone-800 md:text-3xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {product.name}
            </h1>
            {product.avg_rating && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`h-4 w-4 ${i < Math.round(product.avg_rating!) ? "fill-current" : "fill-stone-200"}`} viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-stone-600">
                  {product.avg_rating.toFixed(1)} ({product.reviews?.length || 0} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="rounded-xl bg-krikso-50 p-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-krikso-700">₹{product.unit_price.toLocaleString("en-IN")}</span>
              <span className="text-sm text-stone-500">per {product.unit_label}</span>
            </div>
            {inStock ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-krikso-600">
                <span className="h-2 w-2 rounded-full bg-krikso-500" />
                In stock {product.inventory && `(${product.inventory.stock_available} available)`}
              </p>
            ) : (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Out of stock
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-stone-700">Description</h3>
              <p className="text-sm leading-relaxed text-stone-600">{product.description}</p>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-stone-700">Quantity:</span>
                <div className="flex items-center rounded-xl border border-stone-200 bg-white">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3.5 py-2 text-lg font-medium text-stone-600 transition-colors hover:text-krikso-700"
                  >
                    −
                  </button>
                  <span className="min-w-[2.5rem] text-center text-sm font-semibold text-stone-800">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3.5 py-2 text-lg font-medium text-stone-600 transition-colors hover:text-krikso-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-krikso-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:bg-krikso-600 hover:shadow-xl"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Add to Cart — ₹{(product.unit_price * qty).toLocaleString("en-IN")}
              </motion.button>
            </div>
          )}

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-stone-700">Customer Reviews</h3>
              <div className="space-y-2">
                {product.reviews.map((review, i) => (
                  <div key={i} className="rounded-xl border border-stone-100 bg-white p-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <svg key={j} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    {review.comment && <p className="mt-1.5 text-sm text-stone-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
