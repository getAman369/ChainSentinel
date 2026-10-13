import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Input } from "@components/ui/Input";

const POLYGONS = [
  { top: "10%", left: "15%", size: 80, borderRadius: "30%", duration: 7 },
  { top: "60%", left: "80%", size: 120, borderRadius: "40%", duration: 9 },
  { top: "30%", left: "70%", size: 60, borderRadius: "20%", duration: 6 },
  { top: "70%", left: "10%", size: 100, borderRadius: "50%", duration: 8 },
  { top: "15%", left: "50%", size: 50, borderRadius: "25%", duration: 5 },
  { top: "50%", left: "30%", size: 90, borderRadius: "35%", duration: 10 },
];

export default function NotFound() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate("/history");
    }
  };

  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
      <div aria-hidden="true">
        {POLYGONS.map((polygon, index) => (
          <motion.div
            key={index}
            className="absolute border-2 border-primary-200 dark:border-primary-800"
            style={{
              top: polygon.top,
              left: polygon.left,
              width: polygon.size,
              height: polygon.size,
              borderRadius: polygon.borderRadius,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 15, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: polygon.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-4 text-center">
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-8xl font-bold text-primary-600 dark:text-primary-400"
        >
          404
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-4 text-2xl font-bold text-gray-900 dark:text-white"
        >
          Page Not Found
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-2 text-gray-600 dark:text-gray-400"
        >
          The page you are looking for does not exist.
        </motion.p>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mx-auto mt-8 max-w-md"
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search attestations..."
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />}
            aria-label="Search"
          />
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6"
        >
          <motion.button
            type="button"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
            Go Home
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
