import publication from "@/config/development-publication.json";
import { describe, expect, it } from "vite-plus/test";

import { PROJECT_SUBMISSION_FEE_MIST, validateRegistryManifest } from "@/lib/registry-contract";
import { publicProjectSubmissionConfiguration } from "@/lib/public-config";

describe("generated Registry contract", () => {
  it("validates the checked-in fail-closed publication", () => {
    expect(validateRegistryManifest(publication)).toBe(true);
    expect(PROJECT_SUBMISSION_FEE_MIST).toBe("10000000000");
    expect(publicProjectSubmissionConfiguration).toMatchObject({
      available: false,
      feeMist: "10000000000",
      treasuryAddress: null,
      executionValidFromMs: Date.parse("2026-07-29T00:00:00.000Z"),
    });
  });

  it("rejects additional or noncanonical payment fields", () => {
    expect(validateRegistryManifest({ ...publication, unexpected: true })).toBe(false);
    expect(
      validateRegistryManifest({
        ...publication,
        submission: { ...publication.submission, feeMist: "010000000000" },
      }),
    ).toBe(false);
  });
});
