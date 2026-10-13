import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useAddressHistory } from "@/hooks/useAddressHistory";

import { Input } from "@components/ui/Input";

import { cn, isEthereumAddress } from "@lib/utils";

interface AddressInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
}

export function AddressInput({ value, onChange, className, ...props }: AddressInputProps) {
  const { history } = useAddressHistory();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = value.trim();
  const isValid = isEthereumAddress(trimmed);
  const showValid = trimmed.length > 0 && isValid;
  const showInvalid = trimmed.length > 0 && !isValid;

  const query = trimmed.toLowerCase();
  const suggestions =
    query.length > 2 ? history.filter((addr) => addr.toLowerCase().includes(query)) : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length || !open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      onChange(suggestions[activeIndex]);
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `address-suggestion-${activeIndex}` : undefined}
        className={cn(
          "font-mono",
          showValid && "border-green-500 focus:ring-green-500",
          showInvalid && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700"
            role="listbox"
            aria-label="Address history suggestions"
          >
            {suggestions.map((addr, index) => (
              <li key={addr}>
                <button
                  type="button"
                  id={`address-suggestion-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => {
                    onChange(addr);
                    setOpen(false);
                    setActiveIndex(-1);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left font-mono text-sm transition-colors",
                    index === activeIndex
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                      : "text-gray-900 dark:text-gray-100",
                  )}
                >
                  {addr}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
