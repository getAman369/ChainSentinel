import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { cn } from "@lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <motion.button
      type="button"
      onClick={() => copy(text)}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        "bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200",
        "dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
        copied && "bg-green-600 text-white hover:bg-green-600 dark:text-white",
        className,
      )}
      aria-label={copied ? "Copied to clipboard" : `Copy ${label}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "check" : "clipboard"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          {copied ? <CheckIcon /> : <ClipboardDocumentIcon />}
        </motion.span>
      </AnimatePresence>
      <span>{copied ? "Copied!" : label}</span>
    </motion.button>
  );
}
