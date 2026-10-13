import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { useAddressHistory } from "@/hooks/useAddressHistory";
import { getAttestation } from "@/services/api";
import type { Attestation } from "@/types";

import { AttestationHistory } from "@components/display/AttestationHistory";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";

import { formatAddress } from "@lib/utils";

const PAGE_SIZE = 5;

export default function History() {
  const { history: recentAddresses, addAddress } = useAddressHistory();
  const [lookup, setLookup] = useState("");
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const loadAttestations = useCallback(async (addresses: string[]) => {
    if (addresses.length === 0) {
      setAttestations([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(addresses.map((address) => getAttestation(address)));
      const loaded = results
        .filter(
          (result): result is PromiseFulfilledResult<Attestation> => result.status === "fulfilled",
        )
        .map((result) => result.value);
      setAttestations(loaded);
      if (loaded.length === 0) {
        setError("Could not load attestations. The API may be unavailable.");
      }
    } catch {
      setError("Failed to load history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttestations(recentAddresses);
    setPage(1);
  }, [recentAddresses, loadAttestations]);

  const handleLookup = () => {
    const address = lookup.trim().toLowerCase();
    if (!address) return;
    addAddress(address);
    setLookup("");
  };

  const pageCount = Math.max(1, Math.ceil(attestations.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = attestations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attestation History</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Look up on-chain attestations for screened addresses.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLookup();
            }}
            placeholder="Enter an address to look up..."
            aria-label="Address to look up"
          />
        </div>
        <Button onClick={handleLookup}>Look Up</Button>
      </div>

      {recentAddresses.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Recent:</span>
          {recentAddresses.map((address) => (
            <button
              key={address}
              type="button"
              onClick={() => {
                addAddress(address);
              }}
              className="rounded-full border border-gray-200 px-3 py-1 font-mono text-xs text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-gray-600 dark:text-gray-300 dark:hover:text-primary-400"
            >
              {formatAddress(address)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {error && (
          <p
            className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        <AttestationHistory attestations={pageItems} loading={loading} />
        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {pageCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
                leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                rightIcon={<ChevronRightIcon className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
