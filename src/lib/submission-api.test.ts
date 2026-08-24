// @vitest-environment jsdom

import { describe, expect, it, vi } from "vite-plus/test";

import type { ValidatedProjectSubmission } from "@/lib/project-submission";
import { ProjectSubmissionApiError, createRegistrySubmissionApi } from "@/lib/submission-api";

const WALLET = `0x${"1".repeat(64)}`;
const DIGEST = "11111111111111111111111111111111";

describe("Registry submission API", () => {
  it("binds the fresh challenge to the payment digest and paying wallet", async () => {
    const expiresAtMs = Date.now() + 60_000;
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        token: "t".repeat(64),
        message: "Doji payment receipt verification\n".padEnd(64, "."),
        expiresAtMs,
      }),
    );
    const api = createRegistrySubmissionApi({ fetchImpl });

    await api.createChallenge({ digest: DIGEST, walletAddress: WALLET });

    expect(fetchImpl).toHaveBeenCalledWith("/api/v1/payment/challenge", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ digest: DIGEST, walletAddress: WALLET }),
    });
  });

  it("accepts idempotent redemption after Registry already accepted the submission", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        status: "submission_accepted",
        submissionId: "submission_12345678",
        action: "update",
      }),
    );
    const api = createRegistrySubmissionApi({ fetchImpl });

    await expect(
      api.redeemPayment({
        digest: DIGEST,
        walletAddress: WALLET,
        configurationRevision: "registry-v1",
        challengeToken: "challenge",
        signature: "signature",
      }),
    ).resolves.toEqual({
      status: "submission_accepted",
      submissionId: "submission_12345678",
      action: "update",
    });
  });

  it("uploads exactly one normalized image under the paid capability", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse(
          { status: "accepted", submissionId: "submission_12345678", action: "create" },
          201,
        ),
      );
    const api = createRegistrySubmissionApi({ fetchImpl });
    const submission = createSubmission();

    await api.uploadSubmission({ capability: "paid-capability", submission });

    const [, request] = fetchImpl.mock.calls[0];
    const form = request?.body as FormData;
    expect(request?.headers).toEqual({
      Accept: "application/json",
      Authorization: "Bearer paid-capability",
    });
    expect(form.get("image")).toBe(submission.profileImage.file);
    expect(JSON.parse(form.get("fields") as string)).toEqual({
      suiType: submission.assetType,
      name: "Doji",
      description: "A shared project.",
      ticker: "DOJI",
      website: "https://doji.example/",
      x: null,
      telegram: null,
      discord: null,
    });
  });

  it("surfaces a Registry refund obligation and bounded retry guidance", async () => {
    const refundApi = createRegistrySubmissionApi({
      fetchImpl: vi
        .fn<typeof fetch>()
        .mockResolvedValue(jsonResponse({ status: "refund_owed", refundId: "refund_12345678" })),
    });
    const error = await refundApi
      .redeemPayment({
        digest: DIGEST,
        walletAddress: WALLET,
        configurationRevision: "registry-v1",
        challengeToken: "challenge",
        signature: "signature",
      })
      .catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(ProjectSubmissionApiError);
    expect(error).toMatchObject({
      code: "payment_refund_owed",
      refundId: "refund_12345678",
    });
  });

  it.each([
    ["redemption", "redeemPayment"],
    ["upload", "uploadSubmission"],
  ] as const)(
    "preserves processing exhaustion from %s as a terminal error",
    async (_label, call) => {
      const fetchImpl = vi
        .fn<typeof fetch>()
        .mockResolvedValue(jsonResponse({ status: "processing_exhausted" }, 409));
      const api = createRegistrySubmissionApi({ fetchImpl });

      const error = await (
        call === "redeemPayment"
          ? api.redeemPayment({
              digest: DIGEST,
              walletAddress: WALLET,
              configurationRevision: "registry-v1",
              challengeToken: "challenge",
              signature: "signature",
            })
          : api.uploadSubmission({
              capability: "paid-capability",
              submission: createSubmission(),
            })
      ).catch((reason: unknown) => reason);

      expect(error).toBeInstanceOf(ProjectSubmissionApiError);
      expect(error).toMatchObject({ code: "processing_exhausted" });
    },
  );
});

function createSubmission(): ValidatedProjectSubmission {
  const file = new File(["image"], "doji.png", { type: "image/png" });
  return {
    assetType: `0x${"0".repeat(63)}2::doji::DOJI`,
    projectName: "Doji",
    shortDescription: "A shared project.",
    ticker: "DOJI",
    links: {
      website: "https://doji.example/",
      x: null,
      telegram: null,
      discord: null,
    },
    profileImage: {
      file,
      width: 320,
      height: 320,
      mimeType: "image/png",
    },
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
