import { useEffect, useRef, useState } from "react";
import {
  DAppKitProvider,
  useDAppKit,
  useWalletConnection,
  useWallets,
} from "@mysten/dapp-kit-react";
import { WalletCards } from "lucide-react";

import { useDojiWallet } from "@/components/doji-wallet";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { StatusAlert } from "@/components/ui/status-alert";
import { buildProjectSubmissionPaymentTransaction } from "@/lib/payment-transaction";
import { portfolioDAppKit } from "@/lib/sui-dapp-kit";

export function WalletRuntimeIsland() {
  return (
    <DAppKitProvider dAppKit={portfolioDAppKit}>
      <WalletRuntime />
    </DAppKitProvider>
  );
}

function WalletRuntime() {
  const connection = useWalletConnection();
  const wallets = useWallets();
  const dAppKit = useDAppKit();
  const wallet = useDojiWallet();
  const chooserSurfaceRef = useRef<HTMLDivElement>(null);
  const [isDrawerReady, setIsDrawerReady] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setIsDrawerReady(true);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    wallet.reportRuntimeConnection({
      accountAddress: connection.account?.address ?? null,
      actions: {
        disconnect: () => dAppKit.disconnectWallet(),
        async signAndExecutePayment(terms) {
          const accountAddress = connection.account?.address;
          if (!accountAddress) {
            throw new Error("Connect a compatible wallet before paying.");
          }
          const transaction = buildProjectSubmissionPaymentTransaction({
            senderAddress: accountAddress,
            terms,
          });
          const result = await dAppKit.signAndExecuteTransaction({ transaction });
          if (result.$kind === "FailedTransaction") {
            throw new Error("The payment did not complete.");
          }
          return result.Transaction.digest;
        },
        async signPersonalMessage(message) {
          const proof = await dAppKit.signPersonalMessage({ message });
          return proof.signature;
        },
      },
      status:
        connection.status === "connected"
          ? "connected"
          : connection.status === "connecting" || connection.status === "reconnecting"
            ? "connecting"
            : "disconnected",
    });
  }, [connection.account?.address, connection.status, dAppKit, wallet.reportRuntimeConnection]);

  useEffect(() => {
    if (connection.status === "connected") {
      wallet.closeWalletChooser();
    }
  }, [connection.status, wallet.closeWalletChooser]);

  async function connectWallet(availableWallet: (typeof wallets)[number]) {
    wallet.reportConnectionError(false);
    try {
      await dAppKit.connectWallet({ wallet: availableWallet });
    } catch {
      wallet.reportConnectionError(true);
    }
  }

  return (
    <Drawer
      open={isDrawerReady && wallet.isChooserOpen}
      onOpenChange={(open) => {
        if (!open) {
          wallet.closeWalletChooser();
        }
      }}
      showSwipeHandle
    >
      <DrawerContent
        className="data-[swipe-direction=down]:h-[min(85dvh,36rem)]"
        finalFocus={() => document.querySelector<HTMLElement>("[data-wallet-action]")}
        initialFocus={chooserSurfaceRef}
        placement="responsive-center"
        ref={chooserSurfaceRef}
      >
        <DrawerHeader className="p-(--ds-surface-inset) pb-0">
          <DrawerTitle>Connect a wallet</DrawerTitle>
          <DrawerDescription>
            Choose a mainnet wallet. Portfolio never asks for a recovery phrase or private key.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-none px-(--ds-surface-inset) py-6">
          {wallets.length > 0 ? (
            <div aria-label="Available wallets" className="flex flex-col gap-2">
              {wallets.map((availableWallet) => (
                <Button
                  className="w-full"
                  disabled={connection.status === "connecting"}
                  key={availableWallet.name}
                  onClick={() => void connectWallet(availableWallet)}
                  type="button"
                  variant="outline"
                >
                  {availableWallet.name}
                </Button>
              ))}
            </div>
          ) : (
            <Empty className="min-h-0 border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WalletCards aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No compatible wallet found</EmptyTitle>
                <EmptyDescription>
                  Install or enable a compatible wallet in this browser, then try again.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {wallet.connectionError ? (
            <StatusAlert
              description="The wallet did not connect. Check the wallet request, then try again."
              title="Wallet connection incomplete"
              tone="warning"
            />
          ) : null}
        </div>

        <DrawerFooter className="p-(--ds-surface-inset) pt-0">
          <DrawerClose render={<Button className="w-full" variant="outline" />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
