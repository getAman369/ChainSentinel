import type { ReactNode } from "react";

import { cn } from "@lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  helpText,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {helpText && !error && (
        <p
          id={htmlFor ? `${htmlFor}-help` : undefined}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
      {error && (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
