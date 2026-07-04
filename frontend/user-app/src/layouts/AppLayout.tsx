import { Outlet } from "react-router-dom";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Navbar } from "../components/Navbar";
import { ToastProvider } from "../components/ToastProvider";
import { Footer } from "../components/Footer";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-0 flex flex-col justify-between">
      <div className="flex-grow">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </main>
      </div>
      <Footer />
      <MobileBottomNav />
      <ToastProvider />
    </div>
  );
}
