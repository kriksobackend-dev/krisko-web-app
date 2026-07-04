import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { courseService } from "../services/courseService";
import { CourseCard } from "../components/CourseCard";

const difficulties = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "🌱 Beginner" },
  { value: "intermediate", label: "🌿 Intermediate" },
  { value: "advanced", label: "🌳 Advanced" },
];

const categoryTags = [
  { value: "", label: "All Topics" },
  { value: "organic-farming", label: "Organic Farming" },
  { value: "irrigation", label: "Irrigation" },
  { value: "crop-management", label: "Crop Management" },
  { value: "smart-farming", label: "Smart Farming" },
  { value: "soil-management", label: "Soil Health" },
  { value: "protected-farming", label: "Protected Farming" },
  { value: "business", label: "Farm Business" },
];

export function CoursesPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [categoryTag, setCategoryTag] = useState("");
  const [sort, setSort] = useState("latest");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", search, difficulty, categoryTag, sort],
    queryFn: () => courseService.listCourses(search, difficulty || undefined, categoryTag || undefined, sort),
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-600 to-krikso-600 p-8 text-white shadow-xl shadow-purple-500/20 md:p-10"
      >
        <div className="pattern-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 right-20 h-32 w-32 rounded-full bg-purple-400/30 blur-xl" />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            Learn from India's Top Agriculture Experts
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-4 text-3xl font-bold leading-tight md:text-4xl"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Farming Courses
            <br />
            <span className="text-white/70">खेती सीखें, उपज बढ़ाएं</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-3 max-w-md text-white/80 text-sm"
          >
            Expert-led courses on organic farming, irrigation, crop management, and more. 
            Upgrade your skills and boost your farm's productivity.
          </motion.p>
        </div>
      </motion.section>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
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
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-krikso-400 focus:outline-none focus:ring-2 focus:ring-krikso-100 transition-all"
          />
        </div>

        {/* Difficulty chips */}
        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                difficulty === d.value
                  ? "bg-gradient-to-r from-krikso-500 to-krikso-600 text-white shadow-md shadow-krikso-500/25"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-krikso-300 hover:text-krikso-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap gap-2">
          {categoryTags.map((tag) => (
            <button
              key={tag.value}
              onClick={() => setCategoryTag(tag.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                categoryTag === tag.value
                  ? "bg-krikso-100 text-krikso-700 border border-krikso-300"
                  : "bg-stone-50 text-stone-500 border border-stone-100 hover:bg-stone-100 hover:text-stone-700"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">
            <span className="font-semibold text-stone-800">{courses.length}</span> courses found
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 focus:border-krikso-400 focus:outline-none"
          >
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-stone-100 bg-white p-0 overflow-hidden">
              <div className="aspect-[16/9] bg-stone-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-stone-100" />
                <div className="h-3 w-1/2 rounded bg-stone-100" />
                <div className="h-3 w-full rounded bg-stone-100" />
                <div className="h-10 rounded-xl bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
          <span className="text-5xl">📚</span>
          <h3 className="mt-4 text-lg font-bold text-stone-700">No courses found</h3>
          <p className="mt-1 text-sm text-stone-400">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
