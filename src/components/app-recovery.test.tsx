// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import {
  AppErrorBoundary,
  EarlyAppRecoveryScript,
  RECOVERY_RELOAD_STORAGE_KEY,
  hasMeaningfulAppShell,
  installEarlyAppRecovery,
  isRecoverableAssetLoadError,
  recoverFromAssetLoadError,
  recoverFromMissingAppShell,
} from "./app-recovery";

function createMemoryStorage() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

function BrokenRoute(): ReactNode {
  throw new Error("route crashed");
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("app restore recovery", () => {
  it("installs a pre-hydration recovery script in the document head", () => {
    render(<EarlyAppRecoveryScript />);
    const script = document.querySelector("script[data-doji-app-recovery]");
    expect(script?.textContent).toContain("early-missing-app-shell");
    expect(script?.textContent).toContain('addEventListener("pageshow"');
    expect(script?.textContent).toContain("early-asset-load-failure");
  });

  it("recovers an empty shell restored before React hydration", () => {
    const storage = createMemoryStorage();
    const reload = vi.fn();
    const frames: FrameRequestCallback[] = [];
    document.body.innerHTML = '<main class="app-shell">Doga Fincan</main>';
    const cleanupRecovery = installEarlyAppRecovery({
      cancelFrame: () => {},
      reload,
      requestFrame: (callback) => {
        frames.push(callback);
        return frames.length;
      },
      root: document,
      storage,
    });
    if (frames.length === 0) document.dispatchEvent(new Event("DOMContentLoaded"));
    frames.shift()?.(0);
    expect(reload).not.toHaveBeenCalled();
    document.body.innerHTML = "";
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    frames.shift()?.(0);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.getItem(RECOVERY_RELOAD_STORAGE_KEY)).toBe("early-missing-app-shell");
    cleanupRecovery();
  });

  it("recognizes a meaningful app shell and clears a previous reload guard", () => {
    const storage = createMemoryStorage();
    storage.setItem(RECOVERY_RELOAD_STORAGE_KEY, "missing-app-shell");
    document.body.innerHTML = '<main class="app-shell">Doga Fincan</main>';
    const reload = vi.fn();

    expect(hasMeaningfulAppShell(document)).toBe(true);
    expect(recoverFromMissingAppShell({ reload, root: document, storage })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
    expect(storage.getItem(RECOVERY_RELOAD_STORAGE_KEY)).toBeNull();
  });

  it("reloads once when Safari restores an empty shell over the page background", () => {
    const storage = createMemoryStorage();
    const reload = vi.fn();

    expect(recoverFromMissingAppShell({ reload, root: document, storage })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.getItem(RECOVERY_RELOAD_STORAGE_KEY)).toBe("missing-app-shell");

    expect(recoverFromMissingAppShell({ reload, root: document, storage })).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reloads once for stale or missing dynamic asset chunks", () => {
    const storage = createMemoryStorage();
    const reload = vi.fn();
    const chunkFailure = new Error(
      "Failed to fetch dynamically imported module: https://dogafincan.com/assets/index-old.js",
    );

    expect(isRecoverableAssetLoadError(chunkFailure)).toBe(true);
    expect(recoverFromAssetLoadError(chunkFailure, { reload, storage })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.getItem(RECOVERY_RELOAD_STORAGE_KEY)).toBe("asset-load-failure");

    expect(recoverFromAssetLoadError(chunkFailure, { reload, storage })).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("ignores unrelated runtime errors", () => {
    const reload = vi.fn();

    expect(isRecoverableAssetLoadError(new Error("Project link was blocked."))).toBe(false);
    expect(recoverFromAssetLoadError(new Error("Project link was blocked."), { reload })).toBe(
      false,
    );
    expect(reload).not.toHaveBeenCalled();
  });
});

describe("AppErrorBoundary", () => {
  it("shows a visible reload fallback instead of leaving only the page background", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <BrokenRoute />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: "The app needs a refresh" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reload app" })).toBeTruthy();
  });
});
