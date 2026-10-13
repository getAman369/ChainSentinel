import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { NETWORKS } from "@/lib/constants";

import { Badge } from "@components/ui/Badge";

import { cn } from "@lib/utils";

interface NetworkSelectProps {
  value: number;
  onChange: (chainId: number) => void;
}

export function NetworkSelect({ value, onChange }: NetworkSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = NETWORKS.find((n) => n.chainId === value) ?? NETWORKS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id="chainId"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-left transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <span className="font-medium">{selected.name}</span>
        <ChevronDownIcon
          className={cn("h-5 w-5 text-gray-400 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
            role="listbox"
            aria-label="Select network"
          >
            {NETWORKS.map((network) => (
              <li key={network.chainId} role="option" aria-selected={network.chainId === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(network.chainId);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors",
                    network.chainId === value
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                      : "text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-600",
                  )}
                >
                  <span className="font-medium">{network.name}</span>
                  {network.isTestnet && <Badge color="purple">Testnet</Badge>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
