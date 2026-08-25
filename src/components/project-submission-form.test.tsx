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
  it("keeps the direct form focused on project details without a redundant fee item", () => {
    const { container } = render(
      <ProjectSubmissionForm
        configuration={CONFIGURATION}
        isWalletConnected={false}
        migrationLocked={false}
      />,
    );

    expect(screen.queryByText("One submission across every Doji app")).toBeNull();
    expect(container.querySelectorAll('[data-slot="item"]')).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Ticker"), { target: { value: "$DO$JI" } });
    expect((screen.getByLabelText("Ticker") as HTMLInputElement).value).toBe("DOJI");
    expect(screen.getByText("0/60 characters")).toBeTruthy();
    expect(screen.getByText("0/160 characters")).toBeTruthy();
    expect(screen.getAllByText("Optional")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Browse profile image" })).toBeTruthy();
    expect(screen.getByLabelText("Profile image").className).toContain("hidden");
    expect(screen.queryByText(/40 MP/u)).toBeNull();
  });

  it("keeps one stable supporting slot and replaces the image picker after selection", async () => {
    render(
      <ProjectSubmissionForm
        configuration={CONFIGURATION}
        isWalletConnected={false}
        migrationLocked={false}
      />,
    );

    const assetIdentifier = screen.getByLabelText("Asset identifier");
    const restingSlot = assetIdentifier.nextElementSibling;
    expect(restingSlot?.getAttribute("data-slot")).toBe("field-description");
    expect(restingSlot?.getAttribute("aria-hidden")).toBe("true");
    expect(restingSlot?.className).toContain("min-h-6");

    fireEvent.blur(assetIdentifier);
    const errorSlot = assetIdentifier.nextElementSibling;
    expect(errorSlot?.getAttribute("data-slot")).toBe("field-error");
    expect(errorSlot?.className).toContain("min-h-6");

    fireEvent.change(screen.getByLabelText("Profile image"), {
      target: { files: [createPngFile()] },
    });
    await waitFor(() => {
      expect(screen.getByRole("img", { name: "Selected project profile preview" })).toBeTruthy();
    });

    expect(screen.queryByText("JPG, PNG, WebP, or AVIF up to 5 MB.")).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove image" })).toBeNull();
    const browseAgain = screen.getByRole("button", {
      name: "Browse for another profile image",
    });
    expect(browseAgain.className).toContain("w-full");
    expect(browseAgain.className).toContain("sm:w-auto");
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

    fireEvent.click(screen.getByRole("button", { name: "Pay submission fee" }));

    expect(await screen.findByText("Image processing limit reached")).toBeTruthy();
    expect(document.body.textContent).toContain("all three image-processing attempts");
    expect(document.body.textContent).toContain("support");
    expect(document.body.textContent).toContain("do not pay again");
    expect(document.body.textContent).toContain(DIGEST);
    expect(uploadSubmission).not.toHaveBeenCalled();
  });

  it("keeps Pay enabled-looking but inert above a persistent migration alert", () => {
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

    const pay = screen.getByRole("button", { name: "Pay submission fee" });
    expect(pay.hasAttribute("disabled")).toBe(false);
    expect(pay.className).toContain("bg-primary");
    expect(pay.className).toContain("text-primary-foreground");
    expect(pay.className).toContain("border-transparent");

    fireEvent.click(pay);

    expect(createChallenge).not.toHaveBeenCalled();
    expect(redeemPayment).not.toHaveBeenCalled();
    expect(uploadSubmission).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Temporarily unavailable")).toBeTruthy();

    const content = container.querySelector('[data-slot="card-content"]');
    expect(pay.nextElementSibling?.hasAttribute("data-chain-migration-alert")).toBe(true);
    expect(screen.queryByRole("button", { name: /Recover/u })).toBeNull();
    expect(
      Array.from(content?.querySelectorAll("label") ?? []).map((label) => label.textContent),
    ).toEqual([
      "Asset identifier",
      "Project name",
      "Short description",
      "Ticker",
      "Profile image",
      "Website URL",
      "X URL",
      "Telegram URL",
      "Discord URL",
    ]);
    expect(content?.querySelector('[data-slot="empty"]')).toBeNull();
    expect(content?.querySelector('[data-slot="alert"]')).toBeNull();
  });

  it("documents the project and asset selector migration drawer as not applicable", () => {
    const { container } = render(<ProjectSubmissionFlow configuration={CONFIGURATION} />);

    expect(screen.getByLabelText("Asset identifier").tagName).toBe("INPUT");
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
  fireEvent.change(screen.getByLabelText("Asset identifier"), {
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
