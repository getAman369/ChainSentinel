import { useCallback, useState } from "react";

import { ADDRESS_HISTORY_KEY, MAX_ADDRESS_HISTORY } from "@/lib/constants";

export function loadAddressHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(ADDRESS_HISTORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((a): a is string => typeof a === "string") : [];
  } catch {
    return [];
  }
}

export function useAddressHistory() {
  const [history, setHistory] = useState<string[]>(loadAddressHistory);

  const addAddress = useCallback((address: string) => {
    setHistory((prev) => {
      const next = [address, ...prev.filter((a) => a !== address)].slice(0, MAX_ADDRESS_HISTORY);
      window.localStorage.setItem(ADDRESS_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { history, addAddress };
}
