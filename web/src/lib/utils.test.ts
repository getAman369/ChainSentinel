import { describe, expect, it } from "vitest";

import {
  formatAddress,
  formatHash,
  formatPercentage,
  isEthereumAddress,
  isTransactionHash,
} from "./utils";

describe("utils", () => {
  describe("isEthereumAddress", () => {
    it("accepts a valid address", () => {
      expect(isEthereumAddress("0x1234567890123456789012345678901234567890")).toBe(true);
    });

    it("rejects addresses without the 0x prefix", () => {
      expect(isEthereumAddress("1234567890123456789012345678901234567890")).toBe(false);
    });

    it("rejects non-hex characters", () => {
      expect(isEthereumAddress("0xZZZ")).toBe(false);
    });
  });

  describe("isTransactionHash", () => {
    it("accepts a 66-character hash", () => {
      expect(isTransactionHash(`0x${"a".repeat(64)}`)).toBe(true);
    });

    it("rejects short hashes", () => {
      expect(isTransactionHash("0xabc")).toBe(false);
    });
  });

  describe("formatAddress", () => {
    it("shortens an address", () => {
      expect(formatAddress("0x1234567890123456789012345678901234567890")).toBe("0x1234...7890");
    });

    it("returns empty for empty input", () => {
      expect(formatAddress("")).toBe("");
    });
  });

  describe("formatHash", () => {
    it("shortens a long hash", () => {
      expect(formatHash(`0x${"a".repeat(64)}`, 4)).toBe(`0xaaaa...aaaa`);
    });
  });

  describe("formatPercentage", () => {
    it("formats a confidence value", () => {
      expect(formatPercentage(0.8734)).toBe("87.3%");
    });
  });
});
