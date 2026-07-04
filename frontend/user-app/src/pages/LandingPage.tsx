import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Footer } from "../components/Footer";

/* ─── Shared animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Data ─── */
const features = [
  {
    icon: "🌾",
    title: "Premium Seeds & Inputs",
    desc: "High-yield, certified seeds and top-grade fertilizers sourced from trusted manufacturers.",
  },
  {
    icon: "✅",
    title: "Verified Sellers",
    desc: "Every seller on KRIKSO is verified for quality, authenticity, and fair pricing.",
  },
  {
    icon: "🚚",
    title: "Fast Pan-India Delivery",
    desc: "From warehouse to farm gate — trackable shipments delivered with care.",
  },
  {
    icon: "💰",
    title: "Best Market Prices",
    desc: "No middlemen. Buy directly from producers and save up to 40% on every order.",
  },
];

const categories = [
  { icon: "🌱", name: "Seeds", desc: "Certified, high-yield varieties" },
  { icon: "🧪", name: "Fertilizers", desc: "Organic & chemical options" },
  { icon: "🚜", name: "Machinery", desc: "Modern farming equipment" },
  { icon: "🛡️", name: "Pesticides", desc: "Crop protection essentials" },
  { icon: "💧", name: "Irrigation", desc: "Drip & sprinkler systems" },
  { icon: "📦", name: "Fresh Produce", desc: "Farm-to-table goods" },
];

const steps = [
  { step: "01", title: "Browse Products", desc: "Explore our curated marketplace of agricultural essentials." },
  { step: "02", title: "Add to Cart", desc: "Select quantity, compare prices, and add items to your cart." },
  { step: "03", title: "Secure Payment", desc: "Pay via Razorpay, UPI, cards, or choose cash on delivery." },
  { step: "04", title: "Track Delivery", desc: "Real-time shipment tracking from dispatch to your doorstep." },
];

const testimonials = [
  {
    name: "Rajesh Patel",
    location: "Gujarat",
    quote: "KRIKSO transformed my farming. I save ₹15,000 every season buying seeds directly. The quality is consistently excellent.",
    rating: 5,
  },
  {
    name: "Sunita Devi",
    location: "Madhya Pradesh",
    quote: "Finally a platform that understands farmers. The delivery is quick and prices are much better than my local dealer.",
    rating: 5,
  },
  {
    name: "Arjun Singh",
    location: "Punjab",
    quote: "Bought a drip irrigation kit here — 30% cheaper than the market. Installation support was superb too!",
    rating: 5,
  },
];

const stats = [
  { value: "50K+", label: "Happy Farmers" },
  { value: "2,000+", label: "Products Listed" },
  { value: "500+", label: "Verified Sellers" },
  { value: "25+", label: "States Covered" },
];

/* ─── Component ─── */
export function LandingPage() {
  const token = useAuthStore((s) => s.accessToken);
  const appLink = token ? "/app" : "/login";

  return (
    <div className="min-h-screen">
      {/* ── Sticky Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-card-light mx-4 mt-3 rounded-2xl md:mx-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="KRIKSO India" className="h-10 w-auto" />
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
              <a href="#features" className="transition hover:text-krikso-700">Features</a>
              <a href="#categories" className="transition hover:text-krikso-700">Categories</a>
              <a href="#how-it-works" className="transition hover:text-krikso-700">How It Works</a>
              <a href="#testimonials" className="transition hover:text-krikso-700">Reviews</a>
            </nav>
            <div className="flex items-center gap-3">
              {token ? (
                <Link
                  to="/app"
                  className="btn-glow relative rounded-xl bg-gradient-to-r from-krikso-500 to-krikso-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                >
                  Open App
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-krikso-700 transition hover:bg-krikso-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-glow relative rounded-xl bg-gradient-to-r from-krikso-500 to-krikso-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero-gradient relative overflow-hidden pb-24 pt-32 md:pb-36 md:pt-44">
        <div className="pattern-overlay absolute inset-0 pointer-events-none" />
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-krikso-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-krikso-100 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              India's Fastest Growing Agri-Marketplace
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-gradient text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              किसानों के लिए
              <br />
              <span className="text-white">Smart Marketplace</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl"
            >
              Premium seeds, fertilizers, machinery & fresh produce — directly from
              verified sellers. No middlemen. Best prices. Delivered to your farm.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to={appLink}
                className="btn-glow relative inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-krikso-700 shadow-xl transition"
              >
                <span>🛒</span> Shop Now
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <span>▶</span> How It Works
              </a>
            </motion.div>
          </motion.div>

          {/* Hero stat pills */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i + 4}
                className="glass-card rounded-2xl px-6 py-5 text-center"
              >
                <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-bold uppercase tracking-widest text-krikso-500">
              Why Farmers Love KRIKSO
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Everything Your Farm Needs
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-lg text-stone-500">
              From seeds to machinery, we bring quality products at the best prices directly to your doorstep.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="feature-card group rounded-3xl border border-stone-100 bg-white p-8 shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-krikso-50 text-2xl transition-transform group-hover:scale-110">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-stone-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider mx-auto w-3/4" />

      {/* ── Categories ── */}
      <section id="categories" className="bg-stone-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-bold uppercase tracking-widest text-krikso-500">
              Browse by Category
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              What Are You Looking For?
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6"
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                variants={fadeUp}
                custom={i}
                className="feature-card group cursor-pointer rounded-3xl border border-stone-100 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-krikso-50 to-krikso-100 text-3xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                  {cat.icon}
                </div>
                <h3 className="mt-4 text-sm font-bold text-stone-800">{cat.name}</h3>
                <p className="mt-1 text-xs text-stone-400">{cat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-bold uppercase tracking-widest text-krikso-500">
              Simple & Transparent
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              How KRIKSO Works
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mt-16 grid gap-8 md:grid-cols-4"
          >
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                custom={i}
                className="relative text-center"
              >
                {/* Connector line (hidden on mobile + last item) */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-krikso-500/50 to-krikso-100 md:block" />
                )}
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-krikso-500 to-krikso-700 shadow-lg shadow-krikso-500/30">
                  <span className="text-xl font-extrabold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-stone-900">{s.title}</h3>
                <p className="mt-2 text-sm text-stone-500">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider mx-auto w-3/4" />

      {/* ── Testimonials ── */}
      <section id="testimonials" className="bg-stone-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-bold uppercase tracking-widest text-krikso-500">
              Real Farmer Stories
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Trusted by Thousands
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                custom={i}
                className="testimonial-card rounded-3xl border border-stone-100 bg-white p-8 shadow-sm"
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-stone-600 italic">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-krikso-100 to-krikso-200 text-sm font-bold text-krikso-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Courses Preview ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-bold uppercase tracking-widest text-krikso-500">
              Upgrade Your Skills
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Learn Modern Farming
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-lg text-stone-500">
              Expert-led courses on organic farming, irrigation, crop management, and more — all designed for Indian farmers.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {[
              {
                icon: "🌱",
                title: "Organic Farming Masterclass",
                instructor: "Dr. Ramesh Sharma",
                duration: "12.5h",
                lessons: 24,
                price: "₹1,499",
                tag: "Beginner",
                tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
              },
              {
                icon: "🚜",
                title: "Smart Farming with IoT & Drones",
                instructor: "Vikram Mehra",
                duration: "15h",
                lessons: 30,
                price: "₹2,499",
                tag: "Advanced",
                tagColor: "bg-rose-50 text-rose-700 border-rose-200",
              },
              {
                icon: "💰",
                title: "Farm Business & Marketing",
                instructor: "Priya Nair",
                duration: "9h",
                lessons: 18,
                price: "₹1,299",
                tag: "Intermediate",
                tagColor: "bg-amber-50 text-amber-700 border-amber-200",
              },
            ].map((course, i) => (
              <motion.div
                key={course.title}
                variants={fadeUp}
                custom={i}
                className="feature-card group rounded-3xl border border-stone-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-krikso-50 to-krikso-100 text-2xl transition-transform group-hover:scale-110">
                    {course.icon}
                  </div>
                  <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${course.tagColor}`}>
                    {course.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-stone-900 leading-snug">{course.title}</h3>
                <p className="mt-1 text-xs text-stone-400">by {course.instructor}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
                  <span>🕐 {course.duration}</span>
                  <span>📖 {course.lessons} lessons</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-krikso-700">{course.price}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-10 text-center"
          >
            <Link
              to={appLink}
              className="btn-glow relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-krikso-500 to-krikso-700 px-8 py-4 text-base font-bold text-white shadow-xl transition"
            >
              <span>📚</span> Browse All Courses
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider mx-auto w-3/4" />

      {/* ── CTA Banner ── */}
      <section className="landing-hero-gradient relative overflow-hidden py-20">
        <div className="pattern-overlay absolute inset-0 pointer-events-none" />
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-krikso-500/30 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Ready to Transform Your Farm?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Join 50,000+ farmers who are already saving money and time with KRIKSO.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to={appLink}
                className="btn-glow relative rounded-2xl bg-white px-10 py-4 text-base font-bold text-krikso-700 shadow-xl"
              >
                Start Shopping →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
