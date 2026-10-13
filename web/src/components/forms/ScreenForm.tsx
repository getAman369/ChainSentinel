import { useState, type FormEvent } from "react";

import { NETWORKS } from "@/lib/constants";
import type { ScreenRequest } from "@/types";

import { Button } from "@components/ui/Button";
import { FormField } from "@components/ui/FormField";

import { isEthereumAddress, isTransactionHash } from "@lib/utils";

import { AddressInput } from "./AddressInput";
import { NetworkSelect } from "./NetworkSelect";
import { TxHashInput } from "./TxHashInput";

interface ScreenFormProps {
  onSubmit: (request: ScreenRequest) => Promise<void>;
  submitLabel?: string;
}

export function ScreenForm({ onSubmit, submitLabel = "Screen Address" }: ScreenFormProps) {
  const [address, setAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [chainId, setChainId] = useState<number>(NETWORKS[0].chainId);
  const [errors, setErrors] = useState<{ address?: string; txHash?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: { address?: string; txHash?: string } = {};
    if (!isEthereumAddress(address.trim())) {
      nextErrors.address =
        "Please enter a valid Ethereum address (0x followed by 40 hex characters)";
    }
    if (txHash.trim() && !isTransactionHash(txHash.trim())) {
      nextErrors.txHash = "Transaction hash must be 0x followed by 64 hex characters";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        address: address.trim().toLowerCase(),
        txHash: txHash.trim() || null,
        chainId,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to screen address. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormField
        label="Ethereum Address"
        htmlFor="address"
        required
        error={errors.address}
        helpText="Enter a valid Ethereum address (42 characters starting with 0x)"
      >
        <AddressInput
          id="address"
          name="address"
          value={address}
          onChange={(v) => {
            setAddress(v);
            setErrors((prev) => ({ ...prev, address: undefined }));
          }}
          placeholder="Enter 0x address..."
        />
      </FormField>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormField label="Transaction Hash (Optional)" htmlFor="txHash" error={errors.txHash}>
          <TxHashInput
            id="txHash"
            name="txHash"
            value={txHash}
            onChange={(v) => {
              setTxHash(v);
              setErrors((prev) => ({ ...prev, txHash: undefined }));
            }}
          />
        </FormField>

        <FormField label="Network" htmlFor="chainId">
          <NetworkSelect value={chainId} onChange={setChainId} />
        </FormField>
      </div>

      <Button type="submit" loading={isSubmitting} fullWidth>
        {submitLabel}
      </Button>

      {submitError && (
        <p
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400"
          role="alert"
        >
          {submitError}
        </p>
      )}
    </form>
  );
}
