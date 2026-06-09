import { Component, useEffect, type ErrorInfo, type ReactNode } from "react";

export const RECOVERY_RELOAD_STORAGE_KEY = "doji-app-shell-recovery:reload-attempted";

type RecoveryStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

type RecoveryOptions = {
  reload?: () => void;
  root?: ParentNode;
  storage?: RecoveryStorage | null;
};

let volatileReloadAttempted = false;

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
        <main className="app-shell relative z-10 mx-auto flex min-h-screen w-full min-w-0 max-w-full flex-col justify-center text-foreground sm:max-w-3xl">
          <section className="flex flex-col gap-6 rounded-3xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-semibold">The app needs a refresh</h1>
              <p className="text-base text-muted-foreground">
                Safari kept the page open, but the app interface stopped running. Refresh to load
                the current version.
              </p>
            </div>
            <button
              className="inline-flex h-11 w-fit shrink-0 items-center justify-center rounded-4xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload app
            </button>
          </section>
        </main>
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
