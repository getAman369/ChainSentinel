import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { riskLevelFromScore } from "@/lib/constants";
import type { Attestation } from "@/types";

import { Input } from "@components/ui/Input";
import { Badge } from "@components/ui/Badge";

import { formatAddress, formatDate } from "@lib/utils";

interface AttestationHistoryProps {
  attestations: Attestation[];
  loading?: boolean;
}

const HEADERS = ["Address", "Risk Score", "Risk Level", "Attestation ID", "Date", "Status"];

export function AttestationHistory({ attestations, loading = false }: AttestationHistoryProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return attestations;
    return attestations.filter(
      (attestation) =>
        attestation.address.toLowerCase().includes(q) ||
        attestation.riskLabel.toLowerCase().includes(q) ||
        String(attestation.riskScore).includes(q) ||
        String(attestation.attestationId).includes(q),
    );
  }, [attestations, debouncedQuery]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 p-6" aria-label="Loading attestations">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by address, risk score, or attestation ID..."
          leftIcon={<MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />}
          aria-label="Search attestations"
          className="py-2.5"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          {attestations.length === 0
            ? "No attestations found for this address."
            : "No attestations match your search."}
        </p>
      ) : (
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
              {filtered.map((attestation, index) => {
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
                      <code className="font-mono text-sm text-gray-900 dark:text-white">
                        {formatAddress(attestation.address)}
                      </code>
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
                      <Badge
                        color={attestation.valid ? "minimal" : "critical"}
                        badgeStyle="outline"
                      >
                        {attestation.valid ? "Valid" : "Revoked"}
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
