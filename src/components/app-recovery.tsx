import { Component, useEffect, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const RECOVERY_RELOAD_STORAGE_KEY = "doji-app-shell-recovery:reload-attempted";

type EarlyRecoveryOptions = {
  browserWindow?: Window;
  cancelFrame?: (frameId: number) => void;
  reload?: () => void;
  requestFrame?: (callback: FrameRequestCallback) => number;
  root?: Document;
  storage?: RecoveryStorage | null;
};

type RecoveryStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

type RecoveryOptions = {
  reload?: () => void;
  root?: ParentNode;
  storage?: RecoveryStorage | null;
};

let volatileReloadAttempted = false;

/** Installs the bounded app-shell guard before React hydration. */
export function installEarlyAppRecovery(options: EarlyRecoveryOptions = {}) {
  const browserWindow = options.browserWindow ?? window;
  const root = options.root ?? document;
  const reload = options.reload ?? (() => browserWindow.location.reload());
  const requestFrame =
    options.requestFrame ?? browserWindow.requestAnimationFrame.bind(browserWindow);
  const cancelFrame = options.cancelFrame ?? browserWindow.cancelAnimationFrame.bind(browserWindow);
  const storage =
    options.storage === undefined
      ? (() => {
          try {
            return browserWindow.sessionStorage;
          } catch {
            return null;
          }
        })()
      : options.storage;
  const storageKey = "doji-app-shell-recovery:reload-attempted";
  let frameId: number | null = null;
  let volatileAttempted = false;

  function hasShell() {
    const shell = root.querySelector(".app-shell");
    if (!shell) return false;
    const text = shell.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return (
      text.length > 0 ||
      shell.querySelector("a, button, input, select, textarea, img, svg, [role], [data-slot]") !==
        null
    );
  }
  function clearGuard() {
    volatileAttempted = false;
    try {
      storage?.removeItem(storageKey);
    } catch {
      /* Storage can be unavailable. */
    }
  }
  function reloadOnce(reason: string) {
    if (storage) {
      try {
        if (storage.getItem(storageKey)) return;
        storage.setItem(storageKey, reason);
        reload();
        return;
      } catch {
        /* Fall back to the in-memory guard. */
      }
    }
    if (volatileAttempted) return;
    volatileAttempted = true;
    reload();
  }
  function scheduleShellCheck() {
    if (root.visibilityState === "hidden") return;
    if (frameId !== null) cancelFrame(frameId);
    frameId = requestFrame(() => {
      frameId = null;
      if (hasShell()) {
        clearGuard();
        return;
      }
      reloadOnce("early-missing-app-shell");
    });
  }
  function assetFailureText(event: Event | PromiseRejectionEvent) {
    const candidate = event as Event & {
      filename?: string;
      message?: string;
      reason?: { message?: string } | string;
      target?: { href?: string; src?: string } | null;
    };
    const reason =
      typeof candidate.reason === "string" ? candidate.reason : candidate.reason?.message;
    return [
      candidate.message,
      candidate.filename,
      reason,
      candidate.target?.src,
      candidate.target?.href,
    ]
      .filter(Boolean)
      .join(" ");
  }
  function handleAssetFailure(event: Event | PromiseRejectionEvent) {
    if (
      /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|chunkloaderror|loading chunk \S+ failed|\/assets\/[^"' >]+\.js(?:\?|$)/i.test(
        assetFailureText(event),
      )
    ) {
      reloadOnce("early-asset-load-failure");
    }
  }
  browserWindow.addEventListener("pageshow", scheduleShellCheck);
  browserWindow.addEventListener("focus", scheduleShellCheck);
  root.addEventListener("visibilitychange", scheduleShellCheck);
  browserWindow.addEventListener("error", handleAssetFailure, true);
  browserWindow.addEventListener("unhandledrejection", handleAssetFailure);
  if (root.readyState === "loading")
    root.addEventListener("DOMContentLoaded", scheduleShellCheck, { once: true });
  else scheduleShellCheck();
  return () => {
    if (frameId !== null) cancelFrame(frameId);
    browserWindow.removeEventListener("pageshow", scheduleShellCheck);
    browserWindow.removeEventListener("focus", scheduleShellCheck);
    root.removeEventListener("visibilitychange", scheduleShellCheck);
    browserWindow.removeEventListener("error", handleAssetFailure, true);
    browserWindow.removeEventListener("unhandledrejection", handleAssetFailure);
  };
}

export function EarlyAppRecoveryScript() {
  const source = `(${installEarlyAppRecovery.toString()})()`;
  return <script data-doji-app-recovery dangerouslySetInnerHTML={{ __html: source }} />;
}

export function hasMeaningfulAppShell(root: ParentNode = document) {
  const shell = root.querySelector(".app-shell");

  if (!shell) {
    return false;
  }

  const text = shell.textContent?.replace(/\s+/g, " ").trim() ?? "";
  const visibleSurface = shell.querySelector(
    "a, button, input, select, textarea, img, svg, [role], [data-slot]",
  );

  return text.length > 0 || visibleSurface !== null;
}

export function isRecoverableAssetLoadError(error: unknown) {
  const message = getErrorText(error);

  return (
    /failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /importing a module script failed/i.test(message) ||
    /chunkloaderror/i.test(message) ||
    /loading chunk \S+ failed/i.test(message) ||
    /\/assets\/[^"' >]+\.js(?:\?|$)/i.test(message)
  );
}

export function recoverFromMissingAppShell(options: RecoveryOptions = {}) {
  const storage = options.storage ?? getSessionStorage();

  if (hasMeaningfulAppShell(options.root ?? document)) {
    clearReloadGuard(storage);
    return false;
  }

  return reloadOnce("missing-app-shell", { ...options, storage });
}

export function recoverFromAssetLoadError(error: unknown, options: RecoveryOptions = {}) {
  if (!isRecoverableAssetLoadError(error)) {
    return false;
  }

  return reloadOnce("asset-load-failure", options);
}

export function AppRecovery() {
  useEffect(() => {
    let frameId: number | null = null;

    function scheduleShellCheck() {
      if (document.visibilityState === "hidden") {
        return;
      }

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        recoverFromMissingAppShell();
      });
    }

    function handleAssetError(event: Event) {
      if (recoverFromAssetLoadError(event)) {
        event.preventDefault();
      }
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      if (recoverFromAssetLoadError(event.reason)) {
        event.preventDefault();
      }
    }

    scheduleShellCheck();

    window.addEventListener("pageshow", scheduleShellCheck);
    window.addEventListener("focus", scheduleShellCheck);
    document.addEventListener("visibilitychange", scheduleShellCheck);
    window.addEventListener("error", handleAssetError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("pageshow", scheduleShellCheck);
      window.removeEventListener("focus", scheduleShellCheck);
      document.removeEventListener("visibilitychange", scheduleShellCheck);
      window.removeEventListener("error", handleAssetError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Root app render failed", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen bg-background" data-slot="app-recovery-page">
          <main className="app-shell relative z-10 mx-auto flex w-full min-w-0 max-w-full flex-1 flex-col justify-center text-foreground sm:max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle role="heading" aria-level={1}>
                  The app needs a refresh
                </CardTitle>
                <CardDescription>
                  Safari kept the page open, but the app interface stopped running. Refresh to load
                  the current version.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-fit" onClick={() => window.location.reload()} type="button">
                  Reload app
                </Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function clearReloadGuard(storage: RecoveryStorage | null) {
  volatileReloadAttempted = false;

  try {
    storage?.removeItem(RECOVERY_RELOAD_STORAGE_KEY);
  } catch {
    // Session storage can be unavailable in private or constrained browser modes.
  }
}

function reloadOnce(reason: string, options: RecoveryOptions = {}) {
  const storage = options.storage ?? getSessionStorage();
  const reload = options.reload ?? (() => window.location.reload());

  if (storage) {
    try {
      if (storage.getItem(RECOVERY_RELOAD_STORAGE_KEY)) {
        return false;
      }

      storage.setItem(RECOVERY_RELOAD_STORAGE_KEY, reason);
      reload();
      return true;
    } catch {
      // Fall back to the in-memory guard below.
    }
  }

  if (volatileReloadAttempted) {
    return false;
  }

  volatileReloadAttempted = true;
  reload();
  return true;
}

function getErrorText(value: unknown): string {
  const parts: string[] = [];

  collectErrorText(value, parts, new Set());

  return parts.join(" ");
}

function collectErrorText(value: unknown, parts: string[], seen: Set<unknown>) {
  if (value === null || value === undefined || seen.has(value)) {
    return;
  }

  seen.add(value);

  if (typeof value === "string") {
    parts.push(value);
    return;
  }

  if (value instanceof Error) {
    parts.push(value.name, value.message, value.stack ?? "");
    return;
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    parts.push(value.toString());
    return;
  }

  if (typeof value === "symbol") {
    parts.push(value.description ?? "symbol");
    return;
  }

  if (typeof value === "function") {
    parts.push(value.name);
    return;
  }

  const record = value as Record<string, unknown>;

  for (const key of ["message", "filename", "reason", "error", "src", "href"]) {
    collectErrorText(record[key], parts, seen);
  }

  const target = record.target;

  if (target && typeof target === "object") {
    const targetRecord = target as Record<string, unknown>;
    collectErrorText(targetRecord.src, parts, seen);
    collectErrorText(targetRecord.href, parts, seen);
  }
}
