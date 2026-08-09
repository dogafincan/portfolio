// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { WalletActionButton, WalletControl } from "@/components/wallet-control";
import { CHAIN_MIGRATION_DESCRIPTION } from "@/lib/chain-migration";

describe("WalletActionButton", () => {
  afterEach(cleanup);

  it("uses the primary Connect label and outline Disconnect label without an address", () => {
    const onAction = vi.fn();
    const { rerender } = render(<WalletActionButton isConnected={false} onAction={onAction} />);
    const connect = screen.getByRole("button", { name: "Connect wallet" });
    expect(connect.className).toContain("bg-primary");
    expect(connect.className).toContain("control-target");
    expect(connect.className).toContain("focus-visible:ring-focus-ring");
    fireEvent.click(connect);
    expect(onAction).toHaveBeenCalledOnce();

    rerender(<WalletActionButton isConnected onAction={onAction} />);
    const disconnect = screen.getByRole("button", { name: "Disconnect wallet" });
    expect(disconnect.className).toContain("border-border");
    expect(disconnect.textContent).not.toMatch(/0x/u);
  });

  it("opens a migration Empty without loading wallet choices or disabling the trigger", async () => {
    render(<WalletControl />);

    const trigger = screen.getByRole("button", { name: "Connect wallet" });
    expect(trigger.hasAttribute("disabled")).toBe(false);
    expect(document.querySelector("[data-chain-migration-alert]")).toBeNull();
    fireEvent.click(trigger);

    expect(await screen.findByText("Wallet connections are temporarily unavailable")).toBeTruthy();
    expect(screen.getByText(CHAIN_MIGRATION_DESCRIPTION)).toBeTruthy();
    expect(screen.queryByLabelText("Available Sui wallets")).toBeNull();
    expect(screen.queryByRole("button", { name: /wallet$/iu })).toBeNull();
    expect(document.querySelector("[data-chain-migration-alert]")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
