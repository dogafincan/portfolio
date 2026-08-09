import { PROJECT_SUBMISSION_FEE_MIST } from "@/lib/registry-contract";
import { isValidSuiAddress, normalizeSuiAddress } from "@/lib/sui-identifiers";

export { PROJECT_SUBMISSION_FEE_MIST } from "@/lib/registry-contract";

export const SUI_U64_MAX_MIST = "18446744073709551615" as const;
export const PAYMENT_MARKER_VERSION = 1 as const;
export const PAYMENT_MARKER_PREFIX = `doji:v${PAYMENT_MARKER_VERSION}:` as const;
export const PAYMENT_MARKER_MAX_DECODED_BYTES = 1_024;

export type ProjectSubmissionPaymentTerms = {
  purpose: "project_submission";
  network: "mainnet";
  configurationRevision: string;
  treasuryAddress: string;
  amountMist: typeof PROJECT_SUBMISSION_FEE_MIST;
  executionValidFromMs: number;
  executionValidUntilMs: number | null;
};

type ProjectSubmissionMarker = {
  c: string;
  n: "mainnet";
  p: "project_submission";
  v: 1;
};

export function buildProjectSubmissionPaymentTerms(input: {
  configurationRevision: string;
  treasuryAddress: string;
  executionValidFromMs: number;
  executionValidUntilMs?: number | null;
}): ProjectSubmissionPaymentTerms {
  const executionWindow = normalizeExecutionWindow(
    input.executionValidFromMs,
    input.executionValidUntilMs,
  );
  return {
    purpose: "project_submission",
    network: "mainnet",
    configurationRevision: normalizeMarkerPart(
      input.configurationRevision,
      "configuration revision",
    ),
    treasuryAddress: normalizeAddress(input.treasuryAddress),
    amountMist: PROJECT_SUBMISSION_FEE_MIST,
    ...executionWindow,
  };
}

export function validatePositiveU64Mist(value: string) {
  if (!/^[1-9][0-9]{0,19}$/u.test(value)) {
    throw new Error("Invalid MIST amount.");
  }
  const amount = BigInt(value);
  if (amount > BigInt(SUI_U64_MAX_MIST)) {
    throw new Error("Invalid MIST amount.");
  }
  return amount.toString();
}

export function buildProjectSubmissionPaymentMarker(terms: ProjectSubmissionPaymentTerms) {
  if (
    terms.purpose !== "project_submission" ||
    terms.network !== "mainnet" ||
    validatePositiveU64Mist(terms.amountMist) !== PROJECT_SUBMISSION_FEE_MIST
  ) {
    throw new Error("Invalid project submission payment terms.");
  }
  const marker: ProjectSubmissionMarker = {
    c: normalizeMarkerPart(terms.configurationRevision, "configuration revision"),
    n: "mainnet",
    p: "project_submission",
    v: PAYMENT_MARKER_VERSION,
  };
  const bytes = new TextEncoder().encode(canonicalJson(marker));
  if (bytes.byteLength > PAYMENT_MARKER_MAX_DECODED_BYTES) {
    throw new Error("Payment marker exceeds the decoded size limit.");
  }
  return `${PAYMENT_MARKER_PREFIX}${encodeBase64Url(bytes)}`;
}

function canonicalJson(value: Record<string, string | number>) {
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${JSON.stringify(value[key])}`)
    .join(",")}}`;
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function normalizeAddress(value: string) {
  if (!isValidSuiAddress(value)) {
    throw new Error("Invalid Sui address.");
  }
  return normalizeSuiAddress(value);
}

function normalizeMarkerPart(value: string, label: string) {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9._:-]{1,160}$/u.test(normalized)) {
    throw new Error(`Invalid ${label}.`);
  }
  return normalized;
}

function normalizeExecutionWindow(
  executionValidFromMs: number,
  executionValidUntilMs: number | null | undefined,
) {
  if (!Number.isSafeInteger(executionValidFromMs) || executionValidFromMs <= 0) {
    throw new Error("Invalid payment execution window.");
  }
  const normalizedUntil = normalizeOptionalDeadline(executionValidUntilMs);
  if (normalizedUntil !== null && normalizedUntil < executionValidFromMs) {
    throw new Error("Invalid payment execution window.");
  }
  return { executionValidFromMs, executionValidUntilMs: normalizedUntil };
}

function normalizeOptionalDeadline(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("Invalid payment execution deadline.");
  }
  return value;
}
