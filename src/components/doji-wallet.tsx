import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { ProjectSubmissionPaymentTerms } from "@/lib/registry-payment";

export type WalletConnectionStatus = "disconnected" | "initializing" | "connecting" | "connected";

type RuntimeActions = {
  disconnect: () => Promise<void>;
  signAndExecutePayment: (terms: ProjectSubmissionPaymentTerms) => Promise<string>;
  signPersonalMessage: (message: Uint8Array) => Promise<string>;
};

type RuntimeConnectionState = {
  accountAddress: string | null;
  actions: RuntimeActions | null;
  status: Exclude<WalletConnectionStatus, "initializing">;
};

type WalletState = {
  accountAddress: string | null;
  activated: boolean;
  closeWalletChooser: () => void;
  connectionError: boolean;
  disconnect: () => Promise<void>;
  isChooserOpen: boolean;
  openWalletChooser: () => void;
  reportConnectionError: (hasError: boolean) => void;
  reportRuntimeConnection: (state: RuntimeConnectionState) => void;
  signAndExecutePayment: (terms: ProjectSubmissionPaymentTerms) => Promise<string>;
  signPersonalMessage: (message: Uint8Array) => Promise<string>;
  status: WalletConnectionStatus;
};

const WalletContext = createContext<WalletState | null>(null);

export function DojiWalletProvider({ children }: { children: ReactNode }) {
  const [activated, setActivated] = useState(false);
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [runtime, setRuntime] = useState<RuntimeConnectionState>({
    accountAddress: null,
    actions: null,
    status: "disconnected",
  });

  const value = useMemo<WalletState>(() => {
    const status = activated && runtime.actions === null ? "initializing" : runtime.status;
    return {
      accountAddress: runtime.accountAddress,
      activated,
      closeWalletChooser: () => {
        setIsChooserOpen(false);
        setConnectionError(false);
      },
      connectionError,
      disconnect: async () => {
        setConnectionError(false);
        if (runtime.actions) {
          await runtime.actions.disconnect();
        }
      },
      isChooserOpen,
      openWalletChooser: () => {
        setConnectionError(false);
        setActivated(true);
        setIsChooserOpen(true);
      },
      reportConnectionError: setConnectionError,
      reportRuntimeConnection: setRuntime,
      signAndExecutePayment: async (terms) => {
        if (!runtime.actions) {
          throw new Error("Connect a Sui wallet before paying.");
        }
        return runtime.actions.signAndExecutePayment(terms);
      },
      signPersonalMessage: async (message) => {
        if (!runtime.actions) {
          throw new Error("Connect a Sui wallet before signing.");
        }
        return runtime.actions.signPersonalMessage(message);
      },
      status,
    };
  }, [activated, connectionError, isChooserOpen, runtime]);

  return <WalletContext value={value}>{children}</WalletContext>;
}

export function useDojiWallet() {
  const value = useContext(WalletContext);
  if (!value) {
    throw new Error("useDojiWallet must be used inside DojiWalletProvider.");
  }
  return value;
}
