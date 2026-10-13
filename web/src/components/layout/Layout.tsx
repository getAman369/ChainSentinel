import { Outlet } from "react-router-dom";

import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <a
        href="#main-content"
        className="sr-only focus:absolute focus:left-0 focus:top-0 focus:z-[60] focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
