import { describe, expect, it } from "vite-plus/test";

import {
  PROJECT_SUBMISSION_FEE_MIST,
  buildProjectSubmissionPaymentMarker,
  buildProjectSubmissionPaymentTerms,
  validatePositiveU64Mist,
} from "@/lib/registry-payment";

const TREASURY = `0x${"a".repeat(64)}`;

describe("Registry project payment contract", () => {
  it("uses an exact fixed 10 SUI positive u64 amount", () => {
    const terms = buildProjectSubmissionPaymentTerms({
      configurationRevision: "registry-20260729",
      treasuryAddress: TREASURY,
      executionValidFromMs: 1_785_283_200_000,
    });

    expect(terms.amountMist).toBe(PROJECT_SUBMISSION_FEE_MIST);
    expect(terms.amountMist).toBe("10000000000");
    expect(buildProjectSubmissionPaymentMarker(terms)).toMatch(/^doji:v1:[A-Za-z0-9_-]+$/u);
  });

  it("rejects noncanonical, zero, negative, and overflowing MIST values", () => {
    for (const value of ["", "0", "-1", "+1", "01", "1.0", "18446744073709551616"]) {
      expect(() => validatePositiveU64Mist(value)).toThrow("Invalid MIST amount.");
    }
    expect(validatePositiveU64Mist("18446744073709551615")).toBe("18446744073709551615");
  });
});
