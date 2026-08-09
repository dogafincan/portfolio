import type {
  DojiRegistryLatestPointerV1,
  DojiRegistryManifestV1,
} from "@/generated/registry-manifest.generated";
import {
  validateRegistryLatestPointer as validateGeneratedRegistryLatestPointer,
  validateRegistryManifest as validateGeneratedRegistryManifest,
} from "@/generated/registry-contract.validators.mjs";

export const REGISTRY_MANIFEST_SCHEMA_VERSION = 1 as const;
export const PROJECT_SUBMISSION_FEE_MIST = "10000000000" as const;
export const REGISTRY_STATIC_ORIGIN = "https://registry.dogafincan.com";

export function validateRegistryLatestPointer(
  value: unknown,
): value is DojiRegistryLatestPointerV1 {
  return validateGeneratedRegistryLatestPointer(value);
}

export function validateRegistryManifest(value: unknown): value is DojiRegistryManifestV1 {
  return validateGeneratedRegistryManifest(value);
}
