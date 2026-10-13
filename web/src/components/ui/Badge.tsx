import type { HTMLAttributes, ReactNode } from "react";

import type { RiskLevel } from "@/lib/constants";

import { cn } from "@lib/utils";

export type BadgeStyle = "solid" | "outline";
export type BadgeColor = RiskLevel | "gray" | "purple";

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children?: ReactNode;
  color?: BadgeColor;
  badgeStyle?: BadgeStyle;
}

const colors: Record<BadgeColor, Record<BadgeStyle, string>> = {
  minimal: {
    solid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    outline: "border border-green-500 text-green-700 dark:text-green-400",
  },
  low: {
    solid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    outline: "border border-blue-500 text-blue-700 dark:text-blue-400",
  },
  medium: {
    solid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    outline: "border border-yellow-500 text-yellow-700 dark:text-yellow-400",
  },
  high: {
    solid: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    outline: "border border-orange-500 text-orange-700 dark:text-orange-400",
  },
  critical: {
    solid: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    outline: "border border-red-500 text-red-700 dark:text-red-400",
  },
  gray: {
    solid: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    outline: "border border-gray-400 text-gray-600 dark:text-gray-300",
  },
  purple: {
    solid: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    outline: "border border-purple-500 text-purple-700 dark:text-purple-400",
  },
};

export function Badge({
  color = "gray",
  badgeStyle = "solid",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        colors[color][badgeStyle],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
