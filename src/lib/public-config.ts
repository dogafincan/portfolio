import publication from "@/config/development-publication.json";
import { PROJECT_SUBMISSION_FEE_MIST, validateRegistryManifest } from "@/lib/registry-contract";

export type PublicProjectSubmissionConfiguration = {
  available: boolean;
  configurationRevision: string;
  feeMist: typeof PROJECT_SUBMISSION_FEE_MIST;
  feeSui: "10";
  network: "mainnet";
  treasuryAddress: string | null;
  executionValidFromMs: number;
};

if (!validateRegistryManifest(publication)) {
  throw new Error("The checked-in Registry publication is invalid.");
}

const submission = publication.submission;
const executionValidFromMs = Date.parse(submission.validFrom);

if (!Number.isSafeInteger(executionValidFromMs) || executionValidFromMs < 0) {
  throw new Error("The checked-in Registry publication has an invalid submission valid-from.");
}

export const publicProjectSubmissionConfiguration: PublicProjectSubmissionConfiguration =
  Object.freeze({
    available: submission.enabled && submission.treasuryAddress !== null,
    configurationRevision: submission.configurationRevision,
    feeMist: PROJECT_SUBMISSION_FEE_MIST,
    feeSui: "10",
    network: "mainnet",
    treasuryAddress: submission.treasuryAddress,
    executionValidFromMs,
  });
