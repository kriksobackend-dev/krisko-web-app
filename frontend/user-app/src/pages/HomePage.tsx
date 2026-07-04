import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { courseService } from "../services/courseService";
import { marketplaceService } from "../services/marketplaceService";
import { CourseCard } from "../components/CourseCard";
import { ProductCard } from "../components/ProductCard";

const categoryIcons: Record<string, string> = {
  seeds: "🌾",
  fertilizers: "🧪",
  machinery: "🚜",
  pesticides: "🛡️",
  irrigation: "💧",
  "fresh-produce": "🥭",
};

export function HomePage() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: marketplaceService.listCategories,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => marketplaceService.listProducts("", undefined, "latest"),
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["featured-courses"],
    queryFn: () => courseService.listCourses("", undefined, undefined, "rating"),
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-krikso-700 via-krikso-600 to-krikso-500 p-8 text-white shadow-xl shadow-krikso-500/20 md:p-10"
      >
        <div className="pattern-overlay absolute inset-0" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-3xl font-bold leading-tight md:text-4xl"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            किसानों के लिए
            <br />
            <span className="text-gradient">स्मार्ट बाजार</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-3 max-w-md text-white/85"
          >
            Fresh produce, certified seeds, tools, and bulk offers from verified sellers — delivered to your doorstep.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <Link
              to="/app/marketplace"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-krikso-700 shadow-lg shadow-black/10 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Browse Marketplace
            </Link>
          </motion.div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 right-20 h-32 w-32 rounded-full bg-krikso-400/30 blur-xl" />
      </motion.section>

      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Shop by Category
          </h2>
          <Link to="/app/marketplace" className="text-sm font-medium text-krikso-600 hover:text-krikso-700 transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <Link
                to={`/app/marketplace?category=${cat.id}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-stone-100 bg-white p-4 text-center shadow-sm transition-all hover:shadow-lg hover:border-krikso-200 hover:-translate-y-1"
              >
                <span className="text-2xl">{categoryIcons[cat.slug] || "📦"}</span>
                <span className="text-xs font-semibold text-stone-700 group-hover:text-krikso-700 transition-colors">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Featured Products
          </h2>
          <Link to="/app/marketplace" className="text-sm font-medium text-krikso-600 hover:text-krikso-700 transition-colors">
            See All →
          </Link>
        </div>
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
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Courses */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            📚 Farming Courses
          </h2>
          <Link to="/app/courses" className="text-sm font-medium text-krikso-600 hover:text-krikso-700 transition-colors">
            View All →
          </Link>
        </div>
        {coursesLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-stone-100 bg-white overflow-hidden">
                <div className="aspect-[16/9] bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-stone-100" />
                  <div className="h-3 w-1/2 rounded bg-stone-100" />
                  <div className="h-10 rounded-xl bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : null}
      </section>

      {/* All Products */}
      {products.length > 8 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            More Products
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.slice(8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
