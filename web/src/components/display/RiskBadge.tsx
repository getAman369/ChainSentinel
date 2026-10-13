import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

import { riskLevelFromScore } from "@/lib/constants";

import { Badge } from "@components/ui/Badge";

import { cn } from "@lib/utils";

interface RiskBadgeProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function RiskBadge({ score, showLabel = true, className }: RiskBadgeProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    spring.set(score);
  }, [score, spring]);

  const { level, label } = riskLevelFromScore(score);

  return (
    <Badge color={level} className={cn("font-mono", className)}>
      <motion.span>{display}</motion.span>
      /5
      {showLabel && <span className="ml-1 font-sans font-normal">({label})</span>}
    </Badge>
  );
}
