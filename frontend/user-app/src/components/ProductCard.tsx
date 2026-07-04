import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import type { ProductSummary } from "../services/marketplaceService";

export function ProductCard({ product }: { product: ProductSummary }) {
  const add = useCartStore((s) => s.add);
  const addToast = useToastStore((s) => s.addToast);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: product.id,
      name: product.name,
      price: product.unit_price,
      qty: 1,
      image: product.image,
      unitLabel: product.unit_label,
    });
    addToast(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <Link to={`/app/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-stone-50">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-stone-300">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
          {/* Price badge */}
          <div className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2.5 py-1 text-sm font-bold text-krikso-700 shadow-sm backdrop-blur-sm">
            ₹{product.unit_price.toLocaleString("en-IN")}
            <span className="ml-0.5 text-xs font-normal text-stone-500">/{product.unit_label}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-800 group-hover:text-krikso-700 transition-colors">
            {product.name}
          </h3>
          {product.avg_rating && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-500">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="font-medium">{product.avg_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart button */}
      <div className="px-3.5 pb-3.5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="w-full rounded-xl bg-krikso-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-krikso-600 active:bg-krikso-700"
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Add to Cart
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
