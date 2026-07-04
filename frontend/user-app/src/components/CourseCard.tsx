import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";
import type { CourseSummary } from "../services/courseService";

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: "Beginner", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  intermediate: { label: "Intermediate", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  advanced: { label: "Advanced", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
};

export function CourseCard({ course }: { course: CourseSummary }) {
  const add = useCartStore((s) => s.add);
  const addToast = useToastStore((s) => s.addToast);
  const diff = difficultyConfig[course.difficulty] || difficultyConfig.beginner;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({
      productId: course.id,
      name: course.title,
      price: course.price,
      qty: 1,
      image: course.thumbnail_url,
      unitLabel: "course",
      type: "course",
    });
    addToast(`${course.title} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <Link to={`/app/courses/${course.id}`} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-krikso-100 via-krikso-50 to-emerald-50">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <span className="text-4xl">📚</span>
                <p className="mt-1 text-xs font-medium text-krikso-600/60">{course.category_tag.replace("-", " ")}</p>
              </div>
            </div>
          )}
          {/* Difficulty badge */}
          <div className={`absolute top-2 left-2 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${diff.bg} ${diff.color}`}>
            {diff.label}
          </div>
          {/* Price badge */}
          <div className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-2.5 py-1 text-sm font-bold text-krikso-700 shadow-sm backdrop-blur-sm">
            ₹{course.price.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-800 group-hover:text-krikso-700 transition-colors">
            {course.title}
          </h3>
          <p className="mt-1 text-xs text-stone-400">
            by {course.instructor_name}
          </p>

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-3 text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {course.duration_hours}h
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {course.lessons_count} lessons
            </span>
            {course.avg_rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="font-medium">{course.avg_rating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart button */}
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          className="w-full rounded-xl bg-gradient-to-r from-krikso-500 to-krikso-600 px-3 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-krikso-500/25 active:from-krikso-600 active:to-krikso-700"
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Add to Cart — ₹{course.price.toLocaleString("en-IN")}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
