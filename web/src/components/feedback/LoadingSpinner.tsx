import { motion } from "framer-motion";

import { cn } from "@lib/utils";

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerColor = "primary" | "white" | "gray";

const sizes: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const colors: Record<SpinnerColor, string> = {
  primary: "text-primary-600",
  white: "text-white",
  gray: "text-gray-400",
};

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "primary",
  label = "Loading",
  className,
}: LoadingSpinnerProps) {
  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <motion.svg
        className={cn(sizes[size], colors[color])}
        viewBox="0 0 24 24"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </motion.svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
