export function Footer() {
  return (
    <footer className="bg-stone-900 py-16 text-stone-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="KRIKSO India" className="h-10 w-auto" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              India's smartest agricultural marketplace — connecting farmers with verified
              sellers for seeds, fertilizers, machinery & more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/app" className="transition hover:text-white">Home</a></li>
              <li><a href="/app/marketplace" className="transition hover:text-white">Marketplace</a></li>
              <li><a href="/app/courses" className="transition hover:text-white">Farming Courses</a></li>
              <li><a href="/app/orders" className="transition hover:text-white">My Orders</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition hover:text-white">Help Center</a></li>
              <li><a href="#" className="transition hover:text-white">Seller Application</a></li>
              <li><a href="#" className="transition hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-500">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">📧 kriksoagri@gmail.com, office@krikso.co.in</li>
              <li className="flex items-center gap-2">📞 +91-9818189921, +91-9911233966</li>
              <li className="flex items-center gap-2">📍 India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-800 pt-8 md:flex-row">
          <p className="text-xs text-stone-500">© 2026 KRIKSO. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-stone-500">
            <a href="#" className="transition hover:text-white">Twitter</a>
            <a href="#" className="transition hover:text-white">LinkedIn</a>
            <a href="#" className="transition hover:text-white">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
