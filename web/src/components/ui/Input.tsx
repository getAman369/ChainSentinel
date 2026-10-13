import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, leftIcon, rightIcon, className, ...props },
  ref,
) {
  return (
    <div className="relative">
      {leftIcon && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border bg-white px-4 py-3 text-gray-900",
          "placeholder-gray-400 transition-all dark:bg-gray-700 dark:text-white",
          "dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-primary-500 dark:border-gray-600",
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {rightIcon && (
        <span
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      )}
    </div>
  );
});
