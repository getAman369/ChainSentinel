import { motion } from "framer-motion";

import { BASE_SCAN_URL } from "@/lib/constants";

import { fadeInUp, staggerContainer } from "@lib/animations";
import { formatDate, formatHash } from "@lib/utils";

interface AttestationDetailsProps {
  attestationId: number;
  txHash: string;
  timestamp: string;
}

export function AttestationDetails({ attestationId, txHash, timestamp }: AttestationDetailsProps) {
  const scanUrl = `${BASE_SCAN_URL}/tx/${txHash}`;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      <motion.div variants={fadeInUp}>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Attestation ID</p>
        <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">{attestationId}</p>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Transaction</p>
        <a
          href={scanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-mono text-xs text-primary-600 hover:underline dark:text-primary-400"
        >
          {formatHash(txHash, 8)}
        </a>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Timestamp</p>
        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(timestamp)}</p>
      </motion.div>
    </motion.div>
  );
}
