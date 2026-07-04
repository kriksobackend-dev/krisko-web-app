import { Link, NavLink } from "react-router-dom";
import { useCartStore, selectTotalItems } from "../store/cartStore";

export function Navbar() {
  const totalItems = useCartStore(selectTotalItems);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/app" className="flex items-center">
          <img src="/logo.png" alt="KRIKSO India" className="h-10 w-auto" />
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium text-stone-600 md:flex">
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-krikso-50 text-krikso-700 font-semibold" : "hover:bg-stone-50 hover:text-krikso-700"}`
            }
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </NavLink>
          <NavLink
            to="/app/marketplace"
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-krikso-50 text-krikso-700 font-semibold" : "hover:bg-stone-50 hover:text-krikso-700"}`
            }
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Marketplace
          </NavLink>
          <NavLink
            to="/app/courses"
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-krikso-50 text-krikso-700 font-semibold" : "hover:bg-stone-50 hover:text-krikso-700"}`
            }
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Courses
          </NavLink>
          <NavLink
            to="/app/orders"
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-krikso-50 text-krikso-700 font-semibold" : "hover:bg-stone-50 hover:text-krikso-700"}`
            }
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
          </NavLink>
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-krikso-50 text-krikso-700 font-semibold" : "hover:bg-stone-50 hover:text-krikso-700"}`
            }
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </NavLink>
          <NavLink
            to="/app/cart"
            className={({ isActive }) =>
              `relative flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${isActive ? "bg-krikso-50 text-krikso-700 font-semibold" : "hover:bg-stone-50 hover:text-krikso-700"}`
            }
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Cart
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
