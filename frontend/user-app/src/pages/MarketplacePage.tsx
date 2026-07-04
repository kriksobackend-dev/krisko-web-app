import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { marketplaceService } from "../services/marketplaceService";
import { ProductCard } from "../components/ProductCard";
import { motion } from "framer-motion";

type SortOption = "latest" | "price_asc" | "price_desc";

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortOption>("latest");
  const categoryFromUrl = searchParams.get("category") || undefined;
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(categoryFromUrl);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: marketplaceService.listCategories,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", q, selectedCategory, sort],
    queryFn: () => marketplaceService.listProducts(q, selectedCategory, sort),
  });

  const handleCategoryClick = (catId: string | undefined) => {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Marketplace
        </h1>
        <p className="mt-1 text-sm text-stone-500">Discover quality products from verified sellers</p>
      </motion.div>

      {/* Search + Sort */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search seeds, fertilizers, tools..."
            className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm text-stone-800 shadow-sm transition-all focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100 placeholder:text-stone-400"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 shadow-sm transition-all focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100"
        >
          <option value="latest">Latest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </motion.div>

      {/* Category Chips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        <button
          onClick={() => handleCategoryClick(undefined)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
            !selectedCategory
              ? "bg-krikso-500 text-white shadow-md shadow-krikso-500/25"
              : "bg-white text-stone-600 border border-stone-200 hover:border-krikso-300 hover:text-krikso-700"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? "bg-krikso-500 text-white shadow-md shadow-krikso-500/25"
                : "bg-white text-stone-600 border border-stone-200 hover:border-krikso-300 hover:text-krikso-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </motion.div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-stone-100 bg-white p-3">
              <div className="aspect-square rounded-xl bg-stone-100" />
              <div className="mt-3 h-4 w-3/4 rounded bg-stone-100" />
              <div className="mt-2 h-3 w-1/2 rounded bg-stone-100" />
              <div className="mt-3 h-10 rounded-xl bg-stone-100" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="text-lg font-semibold text-stone-700">No products found</h3>
          <p className="mt-1 text-sm text-stone-500">Try adjusting your search or filters</p>
          <button
            onClick={() => { setQ(""); handleCategoryClick(undefined); }}
            className="mt-4 rounded-xl bg-krikso-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-krikso-600"
          >
            Clear Filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
