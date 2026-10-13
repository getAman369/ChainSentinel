import { motion } from "framer-motion";

import type { ScreenResponse } from "@/types";

import { CopyButton } from "@components/common/CopyButton";
import { Badge } from "@components/ui/Badge";
import { Card, CardBody } from "@components/ui/Card";

import { fadeInUp, staggerContainer } from "@lib/animations";
import { formatPercentage } from "@lib/utils";

import { AttestationDetails } from "./AttestationDetails";
import { EvidenceHash } from "./EvidenceHash";
import { RiskBadge } from "./RiskBadge";
import { RiskScoreCard } from "./RiskScoreCard";

interface ResultsDisplayProps {
  result: ScreenResponse;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
      aria-live="polite"
    >
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xl text-gray-900 dark:text-white">{result.address}</span>
        <CopyButton text={result.address} label="Copy address" />
        <RiskBadge score={result.riskScore} />
        <Badge color="purple">{formatPercentage(result.confidence)} Confidence</Badge>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <RiskScoreCard score={result.riskScore} confidence={result.confidence} />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Card variant="bordered">
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Evidence Hash
              </p>
              <EvidenceHash hash={result.evidenceHash} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Screened At
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <AttestationDetails
          attestationId={result.attestationId}
          txHash={result.attestationTx}
          timestamp={result.timestamp}
        />
      </motion.div>
    </motion.div>
  );
}
