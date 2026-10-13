import { useCallback } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";

import { useApi } from "@/hooks/useApi";
import { getHealth } from "@/services/api";
import type { HealthCheck } from "@/types";

import { LoadingSpinner } from "@components/feedback/LoadingSpinner";
import { Button } from "@components/ui/Button";
import { Card, CardBody } from "@components/ui/Card";

import { formatDate } from "@lib/utils";

const DEPENDENCY_LABELS: Record<string, string> = {
  blockchain: "Blockchain Provider",
  ml_model: "ML Model",
  smart_contract: "Smart Contract",
  wallet: "Wallet",
};

function StatusIndicator({ status }: { status: string }) {
  if (status === "ok" || status === "configured") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
        <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
        Healthy
      </span>
    );
  }
  if (status === "missing" || status === "unconfigured") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-600 dark:text-yellow-400">
        <MinusCircleIcon className="h-5 w-5" aria-hidden="true" />
        {status === "missing" ? "Missing" : "Unconfigured"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
      <ExclamationCircleIcon className="h-5 w-5" aria-hidden="true" />
      Error
    </span>
  );
}

export default function Health() {
  const fetcher = useCallback(() => getHealth(), []);
  const { data: health, loading, error, refetch } = useApi<HealthCheck>(fetcher);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Status</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time status of ChainSentinel dependencies.
          </p>
        </div>
        <Button variant="secondary" onClick={refetch} loading={loading}>
          Refresh
        </Button>
      </div>

      <div className="mt-8">
        {loading && !health ? (
          <LoadingSpinner size="lg" label="Checking health" className="py-16" />
        ) : error && !health ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
            role="alert"
          >
            {error.message}
          </p>
        ) : health ? (
          <div className="space-y-6">
            <Card variant="bordered">
              <CardBody className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Overall Status
                  </p>
                  <p className="mt-1 text-2xl font-bold capitalize text-gray-900 dark:text-white">
                    {health.status}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <p>Service: {health.service}</p>
                  <p>Checked: {formatDate(health.timestamp)}</p>
                  <p>Uptime: {Math.floor(health.uptime)}s</p>
                </div>
              </CardBody>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(health.dependencies).map(([key, dependency]) => (
                <Card key={key} variant="bordered">
                  <CardBody className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {DEPENDENCY_LABELS[key] ?? key}
                    </p>
                    <StatusIndicator status={dependency.status} />
                    {dependency.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dependency.message}
                      </p>
                    )}
                    {dependency.blockNumber !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Block: {dependency.blockNumber}
                      </p>
                    )}
                    {dependency.address && (
                      <p className="break-all font-mono text-xs text-gray-500 dark:text-gray-400">
                        {dependency.address}
                      </p>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
