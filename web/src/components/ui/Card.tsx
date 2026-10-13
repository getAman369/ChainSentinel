import { motion, type HTMLMotionProps } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";

import { cardHover } from "@lib/animations";
import { cn } from "@lib/utils";

export type CardVariant = "default" | "bordered" | "interactive";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  variant?: CardVariant;
}

const variants: Record<CardVariant, string> = {
  default: "bg-white shadow-card dark:bg-gray-800",
  bordered: "bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800",
  interactive: "bg-white shadow-card dark:bg-gray-800 cursor-pointer",
};

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  if (variant === "interactive") {
    return (
      <motion.div
        className={cn("rounded-xl", variants.interactive, className)}
        variants={cardHover}
        whileHover="whileHover"
        whileTap="whileTap"
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div className={cn("rounded-xl", variants[variant], className)} {...props}>
      {children}
    </motion.div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b border-gray-200 px-6 py-4 dark:border-gray-700", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-gray-200 px-6 py-4 dark:border-gray-700", className)}
      {...props}
    >
      {children}
    </div>
  );
}
