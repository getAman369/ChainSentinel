import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">404 — Page Not Found</h1>
      <Link to="/" className="text-primary-600 dark:text-primary-400 underline">
        Go home
      </Link>
    </section>
  );
}
