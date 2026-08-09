import { readBoundedJsonResponse } from "@/lib/bounded-json-response";
import type { ValidatedProjectSubmission } from "@/lib/project-submission";

const PAYMENT_CHALLENGE_PATH = "/api/v1/payment/challenge";
const PROJECT_SUBMISSION_REDEMPTION_PATH = "/api/v1/payment/redeem-project-submission";
const PROJECT_SUBMISSIONS_PATH = "/api/v1/submissions";
const MAX_RESPONSE_BYTES = 32_768;

export type SubmissionChallenge = {
  expiresAtMs: number;
  message: string;
  token: string;
};

export type ProjectSubmissionReceipt = {
  action: "create" | "update";
  submissionId: string;
};

export type ProjectSubmissionApiErrorCode =
  | "capability_consumed"
  | "capability_invalid"
  | "configuration_unavailable"
  | "network"
  | "payment_invalid"
  | "payment_receipt_in_use"
  | "payment_refund_owed"
  | "payment_verification_retryable"
  | "processing_exhausted"
  | "processing_unavailable"
  | "response_invalid"
  | "submission_invalid";

export class ProjectSubmissionApiError extends Error {
  readonly code: ProjectSubmissionApiErrorCode;
  readonly refundId: string | null;
  readonly retryAfterSeconds: number | null;

  constructor(
    code: ProjectSubmissionApiErrorCode,
    message: string,
    options: { cause?: unknown; refundId?: string; retryAfterSeconds?: number } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "ProjectSubmissionApiError";
    this.code = code;
    this.refundId = options.refundId ?? null;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
  }
}

export type RegistrySubmissionApi = {
  createChallenge(input: { digest: string; walletAddress: string }): Promise<SubmissionChallenge>;
  redeemPayment(input: {
    challengeToken: string;
    configurationRevision?: string;
    digest: string;
    signature: string;
    walletAddress: string;
  }): Promise<
    | { capability: string; expiresAtMs: number; status: "capability_issued" }
    | { action: "create" | "update"; status: "submission_accepted"; submissionId: string }
  >;
  uploadSubmission(input: {
    capability: string;
    submission: ValidatedProjectSubmission;
  }): Promise<ProjectSubmissionReceipt>;
};

export function createRegistrySubmissionApi({
  fetchImpl = globalThis.fetch,
}: {
  fetchImpl?: typeof fetch;
} = {}): RegistrySubmissionApi {
  return {
    async createChallenge({ digest, walletAddress }) {
      const response = await request(fetchImpl, PAYMENT_CHALLENGE_PATH, {
        headers: jsonHeaders(),
        body: JSON.stringify({ digest, walletAddress }),
      });
      const body = await readJsonObject(response);
      if (
        !response.ok ||
        !hasExactKeys(body, ["expiresAtMs", "message", "token"]) ||
        !isSafeFutureTimestamp(body.expiresAtMs) ||
        typeof body.message !== "string" ||
        body.message.length < 32 ||
        body.message.length > 12_000 ||
        typeof body.token !== "string" ||
        body.token.length < 32 ||
        body.token.length > 4_096
      ) {
        throw response.ok
          ? invalidResponse()
          : response.status === 503 || response.status === 429
            ? retryableVerification(response, body)
            : new ProjectSubmissionApiError(
                "payment_invalid",
                "The payment proof challenge could not be issued.",
              );
      }
      return {
        expiresAtMs: body.expiresAtMs,
        message: body.message,
        token: body.token,
      };
    },

    async redeemPayment(input) {
      const response = await request(fetchImpl, PROJECT_SUBMISSION_REDEMPTION_PATH, {
        headers: jsonHeaders(),
        body: JSON.stringify({
          digest: input.digest,
          walletAddress: input.walletAddress,
          ...(input.configurationRevision
            ? { configurationRevision: input.configurationRevision }
            : {}),
          challengeToken: input.challengeToken,
          signature: input.signature,
        }),
      });
      const body = await readJsonObject(response);

      if (
        response.ok &&
        body.status === "capability_issued" &&
        hasExactKeys(body, ["capability", "expiresAtMs", "status"]) &&
        typeof body.capability === "string" &&
        body.capability.length >= 32 &&
        body.capability.length <= 8_192 &&
        isSafeFutureTimestamp(body.expiresAtMs)
      ) {
        return {
          status: "capability_issued",
          capability: body.capability,
          expiresAtMs: body.expiresAtMs,
        };
      }
      if (
        response.ok &&
        body.status === "submission_accepted" &&
        hasExactKeys(body, ["action", "status", "submissionId"]) &&
        (body.action === "create" || body.action === "update") &&
        typeof body.submissionId === "string" &&
        body.submissionId.length >= 8 &&
        body.submissionId.length <= 160
      ) {
        return {
          status: "submission_accepted",
          action: body.action,
          submissionId: body.submissionId,
        };
      }
      if (
        response.ok &&
        body.status === "refund_owed" &&
        hasExactKeys(body, ["refundId", "status"]) &&
        typeof body.refundId === "string" &&
        body.refundId.length >= 8 &&
        body.refundId.length <= 160
      ) {
        throw new ProjectSubmissionApiError(
          "payment_refund_owed",
          "This payment cannot be used for a submission. Registry recorded a refund obligation.",
          { refundId: body.refundId },
        );
      }
      if (response.status === 503 && body.status === "configuration_unavailable") {
        throw new ProjectSubmissionApiError(
          "configuration_unavailable",
          "Project submission payments are not available.",
        );
      }
      if (response.status === 503 || response.status === 429 || body.status === "retryable") {
        throw retryableVerification(response, body);
      }
      if (response.status === 409 && body.status === "processing_exhausted") {
        throw new ProjectSubmissionApiError(
          "processing_exhausted",
          "This paid submission has used all image-processing attempts.",
        );
      }
      if (
        response.status === 409 &&
        (body.status === "invalid_revision" || body.status === "digest_already_reserved")
      ) {
        throw new ProjectSubmissionApiError(
          body.status === "invalid_revision"
            ? "configuration_unavailable"
            : "payment_receipt_in_use",
          body.status === "invalid_revision"
            ? "The published payment configuration has changed."
            : "This payment receipt is already being handled.",
        );
      }
      if (response.status === 400 || body.status === "invalid") {
        throw new ProjectSubmissionApiError(
          "payment_invalid",
          "Registry could not verify this payment receipt.",
        );
      }
      throw invalidResponse();
    },

    async uploadSubmission({ capability, submission }) {
      const form = new FormData();
      form.set("fields", JSON.stringify(toSubmissionFields(submission)));
      form.set("image", submission.profileImage.file);
      const response = await request(fetchImpl, PROJECT_SUBMISSIONS_PATH, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${capability}`,
        },
        body: form,
      });
      const body = await readJsonObject(response);

      if (
        (response.status === 200 || response.status === 201) &&
        body.status === "accepted" &&
        hasExactKeys(body, ["action", "status", "submissionId"]) &&
        (body.action === "create" || body.action === "update") &&
        typeof body.submissionId === "string" &&
        body.submissionId.length >= 8 &&
        body.submissionId.length <= 160
      ) {
        return { action: body.action, submissionId: body.submissionId };
      }
      if (
        response.status === 401 ||
        body.status === "invalid_capability" ||
        body.status === "capability_consumed"
      ) {
        throw new ProjectSubmissionApiError(
          body.status === "capability_consumed" ? "capability_consumed" : "capability_invalid",
          "The paid upload authorization is no longer usable.",
        );
      }
      if (response.status === 409 && body.status === "processing_exhausted") {
        throw new ProjectSubmissionApiError(
          "processing_exhausted",
          "This paid submission has used all image-processing attempts.",
        );
      }
      if (
        response.status === 503 ||
        response.status === 429 ||
        body.status === "processing_unavailable"
      ) {
        throw new ProjectSubmissionApiError(
          "processing_unavailable",
          "Registry could not process the paid submission yet.",
          { retryAfterSeconds: readRetryAfterSeconds(response, body) ?? undefined },
        );
      }
      if (
        response.status === 400 ||
        response.status === 413 ||
        body.status === "invalid_submission" ||
        body.status === "invalid_image"
      ) {
        throw new ProjectSubmissionApiError(
          "submission_invalid",
          "Registry rejected the project details or profile image.",
        );
      }
      throw invalidResponse();
    },
  };
}

export function toSubmissionFields(submission: ValidatedProjectSubmission) {
  return {
    suiType: submission.assetType,
    name: submission.projectName,
    description: submission.shortDescription,
    ticker: submission.ticker,
    website: submission.links.website,
    x: submission.links.x,
    telegram: submission.links.telegram,
    discord: submission.links.discord,
  };
}

async function request(
  fetchImpl: typeof fetch,
  path: string,
  init: Pick<RequestInit, "body" | "headers">,
) {
  try {
    return await fetchImpl(path, {
      ...init,
      method: "POST",
      credentials: "same-origin",
    });
  } catch (error) {
    throw new ProjectSubmissionApiError("network", "Registry could not be reached.", {
      cause: error,
    });
  }
}

async function readJsonObject(response: Response): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await readBoundedJsonResponse(response, MAX_RESPONSE_BYTES);
  } catch (error) {
    throw new ProjectSubmissionApiError(
      "response_invalid",
      "Registry returned an unreadable response.",
      { cause: error },
    );
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw invalidResponse();
  }
  return value as Record<string, unknown>;
}

function jsonHeaders(): HeadersInit {
  return { Accept: "application/json", "Content-Type": "application/json" };
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).sort().join("\n") === [...keys].sort().join("\n");
}

function isSafeFutureTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > Date.now() &&
    value <= Date.now() + 24 * 60 * 60 * 1_000
  );
}

function readRetryAfterSeconds(response: Response, body: Record<string, unknown>) {
  const bodyValue = body.retryAfterSeconds;
  if (
    typeof bodyValue === "number" &&
    Number.isSafeInteger(bodyValue) &&
    bodyValue >= 1 &&
    bodyValue <= 86_400
  ) {
    return bodyValue;
  }
  const headerValue = response.headers.get("Retry-After");
  if (headerValue && /^\d{1,5}$/u.test(headerValue)) {
    const seconds = Number(headerValue);
    if (seconds >= 1 && seconds <= 86_400) {
      return seconds;
    }
  }
  return null;
}

function retryableVerification(response: Response, body: Record<string, unknown>) {
  return new ProjectSubmissionApiError(
    "payment_verification_retryable",
    "Registry could not verify the payment yet.",
    { retryAfterSeconds: readRetryAfterSeconds(response, body) ?? undefined },
  );
}

function invalidResponse() {
  return new ProjectSubmissionApiError(
    "response_invalid",
    "Registry returned an invalid response.",
  );
}
