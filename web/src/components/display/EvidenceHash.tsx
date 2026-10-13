import { useState } from "react";

import { CopyButton } from "@components/common/CopyButton";

import { formatHash } from "@lib/utils";

interface EvidenceHashProps {
  hash: string;
}

export function EvidenceHash({ hash }: EvidenceHashProps) {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="flex items-start gap-2">
      <code className="flex-1 break-all font-mono text-xs text-gray-900 dark:text-white">
        {showFull ? hash : formatHash(hash, 8)}
      </code>
      <button
        type="button"
        onClick={() => setShowFull((show) => !show)}
        className="shrink-0 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        {showFull ? "Hide" : "Show Full"}
      </button>
      <CopyButton text={hash} label="Copy hash" className="shrink-0" />
    </div>
  );
}
