import { motion } from "framer-motion";

import { riskLevelFromScore } from "@/lib/constants";
import type { Attestation } from "@/types";

import { Badge } from "@components/ui/Badge";

import { formatAddress, formatDate } from "@lib/utils";

interface AttestationHistoryProps {
  attestations: Attestation[];
  loading?: boolean;
}

const HEADERS = ["Address", "Risk Score", "Risk Level", "Attestation ID", "Date", "Status"];

export function AttestationHistory({ attestations, loading = false }: AttestationHistoryProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3 p-6" aria-label="Loading attestations">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (attestations.length === 0) {
    return (
      <p className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
        No attestations found for this address.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {HEADERS.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {attestations.map((attestation, index) => {
            const { label, level } = riskLevelFromScore(attestation.riskScore);
            return (
              <motion.tr
                key={`${attestation.attestationId}-${attestation.address}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm text-gray-900 dark:text-white">
                      {formatAddress(attestation.address)}
                    </code>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge color={level}>{attestation.riskScore}/5</Badge>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{label}</td>
                <td className="px-6 py-4">
                  <code className="font-mono text-sm text-gray-900 dark:text-white">
                    {attestation.attestationId}
                  </code>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(attestation.timestamp)}
                </td>
                <td className="px-6 py-4">
                  <Badge color={attestation.valid ? "minimal" : "critical"} badgeStyle="outline">
                    {attestation.valid ? "Valid" : "Revoked"}
                  </Badge>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
