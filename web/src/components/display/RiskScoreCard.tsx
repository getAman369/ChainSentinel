import { motion } from "framer-motion";

import { riskLevelFromScore } from "@/lib/constants";

import { Card, CardBody } from "@components/ui/Card";

import { cn, formatPercentage } from "@lib/utils";

interface RiskScoreCardProps {
  score: number;
  confidence: number;
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "bg-green-500";
  if (confidence >= 0.6) return "bg-blue-500";
  return "bg-gray-400";
}

export function RiskScoreCard({ score, confidence }: RiskScoreCardProps) {
  const { label, level } = riskLevelFromScore(score);
  const confidencePercent = Math.round(confidence * 100);

  return (
    <Card variant="bordered">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Score</span>
          <span
            className={cn(
              "text-sm font-semibold",
              level === "minimal" || level === "low"
                ? "text-green-600 dark:text-green-400"
                : level === "medium"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400",
            )}
          >
            {label}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{score}</span>
          <span className="text-lg text-gray-400">/5</span>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Confidence</span>
            <span>{formatPercentage(confidence)}</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              className={cn("h-2 rounded-full", confidenceColor(confidence))}
              initial={{ width: 0 }}
              animate={{ width: `${confidencePercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
