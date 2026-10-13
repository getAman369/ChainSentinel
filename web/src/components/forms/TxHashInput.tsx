import type { InputHTMLAttributes } from "react";

import { Input } from "@components/ui/Input";

import { cn, isTransactionHash } from "@lib/utils";

const TX_HASH_LENGTH = 66;

interface TxHashInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
}

export function TxHashInput({ value, onChange, className, ...props }: TxHashInputProps) {
  const trimmed = value.trim();
  const isValid = isTransactionHash(trimmed);
  const showValid = trimmed.length > 0 && isValid;
  const showInvalid = trimmed.length > 0 && !isValid;

  return (
    <div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={TX_HASH_LENGTH}
        placeholder="0x..."
        className={cn(
          "font-mono",
          showValid && "border-green-500 focus:ring-green-500",
          showInvalid && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />
      <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Format: 0x followed by 64 hex characters</span>
        <span aria-live="polite">
          {value.length}/{TX_HASH_LENGTH}
        </span>
      </div>
    </div>
  );
}
