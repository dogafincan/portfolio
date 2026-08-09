// @vitest-environment jsdom

import { useEffect } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { DojiWalletProvider, useDojiWallet } from "@/components/doji-wallet";
import { ProjectSubmissionFlow, ProjectSubmissionForm } from "@/components/project-submission-form";
import type { PublicProjectSubmissionConfiguration } from "@/lib/public-config";
import { ProjectSubmissionApiError, type RegistrySubmissionApi } from "@/lib/submission-api";

const DIGEST = "11111111111111111111111111111111";
const WALLET_ADDRESS = "0x1111111111111111111111111111111111111111111111111111111111111111";
const CONFIGURATION: PublicProjectSubmissionConfiguration = {
  available: true,
  configurationRevision: "registry-submission-v1",
  feeMist: "10000000000",
  feeSui: "10",
  network: "mainnet",
  treasuryAddress: WALLET_ADDRESS,
  executionValidFromMs: Date.parse("2026-07-29T00:00:00.000Z"),
};

beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn().mockReturnValue("blob:portfolio-preview"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ProjectSubmissionFlow", () => {
  it("keeps required payment and recovery terms in one informative item", () => {
    const { container } = render(
      <ProjectSubmissionForm
        configuration={CONFIGURATION}
        isWalletConnected={false}
        migrationLocked={false}
      />,
    );

    expect(screen.getByText("One submission across every Doji app")).toBeTruthy();
    expect(container.querySelectorAll('[data-slot="item"]')).toHaveLength(1);
    expect(screen.queryByText("Payment deadlines")).toBeNull();
    expect(document.body.textContent).toContain("seven days");
    expect(document.body.textContent).toContain("90 days");
  });

  it("keeps the digest and forbids repayment after all image attempts are spent", async () => {
    const uploadSubmission = vi.fn(async () => ({
      action: "create" as const,
      submissionId: "unexpected-upload",
    }));
    const api: RegistrySubmissionApi = {
      createChallenge: vi.fn(async () => ({
        expiresAtMs: 1_786_000_000_000,
        message: "Sign this one-time project submission challenge.",
        token: "t".repeat(32),
      })),
      redeemPayment: vi.fn(async () => {
        throw new ProjectSubmissionApiError(
          "processing_exhausted",
          "All image-processing attempts are spent.",
        );
      }),
      uploadSubmission,
    };

    render(
      <DojiWalletProvider>
        <WalletRuntime />
        <ProjectSubmissionFlow api={api} configuration={CONFIGURATION} migrationLocked={false} />
      </DojiWalletProvider>,
    );
    await enterValidProject();

    fireEvent.click(screen.getByRole("button", { name: "Pay 10 SUI" }));

    expect(await screen.findByText("Image processing limit reached")).toBeTruthy();
    expect(document.body.textContent).toContain("all three image-processing attempts");
    expect(document.body.textContent).toContain("manual support");
    expect(document.body.textContent).toContain("do not pay again");
    expect(document.body.textContent).toContain(DIGEST);
    expect(uploadSubmission).not.toHaveBeenCalled();
  });

  it("keeps submission actions enabled-looking but inert below a persistent migration alert", () => {
    const createChallenge = vi.fn(async () => {
      throw new Error("Locked migration action unexpectedly created a challenge.");
    });
    const redeemPayment = vi.fn(async () => {
      throw new Error("Locked migration action unexpectedly redeemed a payment.");
    });
    const uploadSubmission = vi.fn(async () => {
      throw new Error("Locked migration action unexpectedly uploaded a submission.");
    });
    const api: RegistrySubmissionApi = {
      createChallenge,
      redeemPayment,
      uploadSubmission,
    };
    const { container } = render(<ProjectSubmissionFlow api={api} configuration={CONFIGURATION} />);

    const pay = screen.getByRole("button", { name: "Pay 10 SUI" });
    const recover = screen.getByRole("button", { name: "Recover payment" });
    expect(pay.hasAttribute("disabled")).toBe(false);
    expect(recover.hasAttribute("disabled")).toBe(false);

    fireEvent.click(pay);
    fireEvent.click(recover);

    expect(createChallenge).not.toHaveBeenCalled();
    expect(redeemPayment).not.toHaveBeenCalled();
    expect(uploadSubmission).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Temporarily unavailable")).toBeTruthy();

    const footer = container.querySelector('[data-slot="card-footer"]');
    expect(footer?.lastElementChild?.hasAttribute("data-chain-migration-alert")).toBe(true);
  });

  it("documents the project and asset selector migration drawer as not applicable", () => {
    const { container } = render(<ProjectSubmissionFlow configuration={CONFIGURATION} />);

    expect(screen.getByLabelText("Sui asset type").tagName).toBe("INPUT");
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(container.querySelector('[data-slot="drawer-trigger"]')).toBeNull();
  });
});

function WalletRuntime() {
  const wallet = useDojiWallet();
  useEffect(() => {
    wallet.reportRuntimeConnection({
      accountAddress: WALLET_ADDRESS,
      actions: {
        disconnect: async () => undefined,
        signAndExecutePayment: async () => DIGEST,
        signPersonalMessage: async () => "wallet-signature",
      },
      status: "connected",
    });
  }, [wallet.reportRuntimeConnection]);
  return null;
}

async function enterValidProject() {
  fireEvent.change(screen.getByLabelText("Sui asset type"), {
    target: { value: "0x2::sui::SUI" },
  });
  fireEvent.change(screen.getByLabelText("Project name"), {
    target: { value: "Sui" },
  });
  fireEvent.change(screen.getByLabelText("Short description"), {
    target: { value: "The native asset." },
  });
  fireEvent.change(screen.getByLabelText("Profile image"), {
    target: { files: [createPngFile()] },
  });
  await waitFor(() => {
    expect(screen.getByRole("img", { name: "Selected project profile preview" })).toBeTruthy();
  });
}

function createPngFile() {
  const bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x00, 0x00, 0x00, 0x0d], 8);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, 320);
  view.setUint32(20, 320);
  const file = new File([bytes], "profile.png", { type: "image/png" });
  if (typeof file.arrayBuffer !== "function") {
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => bytes.slice().buffer,
    });
  }
  return file;
}
