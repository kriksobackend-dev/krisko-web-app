import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../services/courseService";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: "Beginner", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  intermediate: { label: "Intermediate", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  advanced: { label: "Advanced", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
};

export function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const add = useCartStore((s) => s.add);
  const addToast = useToastStore((s) => s.addToast);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getCourse(courseId!),
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 rounded-lg bg-stone-100" />
        <div className="aspect-[21/9] rounded-2xl bg-stone-100" />
        <div className="space-y-3">
          <div className="h-8 w-3/4 rounded bg-stone-100" />
          <div className="h-4 w-1/2 rounded bg-stone-100" />
          <div className="h-20 w-full rounded bg-stone-100" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl">😕</span>
        <h2 className="mt-4 text-xl font-bold text-stone-700">Course not found</h2>
        <p className="mt-2 text-sm text-stone-400">This course may have been removed or doesn't exist.</p>
        <Link
          to="/app/courses"
          className="mt-6 rounded-xl bg-krikso-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-krikso-600"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  const diff = difficultyConfig[course.difficulty] || difficultyConfig.beginner;

  const handleAddToCart = () => {
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-stone-400">
        <Link to="/app/courses" className="transition hover:text-krikso-600">
          Courses
        </Link>
        <span>›</span>
        <span className="text-stone-600 font-medium truncate">{course.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-50 to-krikso-50 shadow-lg"
          >
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <span className="text-7xl">📚</span>
                  <p className="mt-3 text-sm font-medium text-stone-400">
                    {course.category_tag.replace(/-/g, " ")}
                  </p>
                </div>
              </div>
            )}
            <div className={`absolute top-4 left-4 rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${diff.bg} ${diff.color}`}>
              {diff.label}
            </div>
          </motion.div>

          {/* Title and Instructor */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <h1
              className="text-2xl font-extrabold text-stone-900 leading-tight md:text-3xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {course.title}
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              by <span className="font-semibold text-stone-700">{course.instructor_name}</span>
            </p>
          </motion.div>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-1.5 rounded-xl bg-stone-50 border border-stone-100 px-3 py-2 text-sm text-stone-600">
              <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{course.duration_hours}h</span> duration
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-stone-50 border border-stone-100 px-3 py-2 text-sm text-stone-600">
              <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-semibold">{course.lessons_count}</span> lessons
            </div>
            {course.avg_rating > 0 && (
              <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-700">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="font-semibold">{course.avg_rating.toFixed(1)}</span> rating
              </div>
            )}
            <div className={`rounded-xl border px-3 py-2 text-sm font-semibold ${diff.bg} ${diff.color}`}>
              {diff.label}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
              About this Course
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 whitespace-pre-line">
              {course.description || "No description available."}
            </p>
          </motion.div>

          {/* What you'll learn */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
              What You'll Learn
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Expert-guided practical techniques",
                "Real-world Indian farming case studies",
                "Lifetime access to course materials",
                "Certificate of completion",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-krikso-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-stone-600">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar — Purchase card */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="sticky top-20 rounded-2xl border border-stone-100 bg-white p-6 shadow-lg"
          >
            <div className="text-center">
              <p className="text-3xl font-extrabold text-krikso-700" style={{ fontFamily: "'Outfit', sans-serif" }}>
                ₹{course.price.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-stone-400">One-time purchase • Lifetime access</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-krikso-500 to-krikso-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-krikso-500/25 transition-all hover:shadow-xl hover:shadow-krikso-500/30 hover:brightness-110"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Add to Cart
              </span>
            </motion.button>

            <Link
              to="/app/cart"
              className="mt-3 block w-full rounded-xl border-2 border-krikso-200 bg-krikso-50 px-4 py-3 text-center text-sm font-semibold text-krikso-700 transition-all hover:bg-krikso-100"
            >
              Go to Cart
            </Link>

            <div className="mt-6 space-y-3 border-t border-stone-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">This course includes</h3>
              {[
                { icon: "🎥", text: `${course.duration_hours} hours of video content` },
                { icon: "📖", text: `${course.lessons_count} detailed lessons` },
                { icon: "📱", text: "Access on mobile & desktop" },
                { icon: "🏆", text: "Certificate of completion" },
                { icon: "♾️", text: "Lifetime access" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-stone-600">
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
