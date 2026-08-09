import { useEffect, useRef, useState } from "react";
import { WalletCards } from "lucide-react";

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
import { CHAIN_MIGRATION_DESCRIPTION } from "@/lib/chain-migration";

export function WalletControl() {
  const chooserSurfaceRef = useRef<HTMLDivElement>(null);
  const [isChooserOpen, setIsChooserOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash !== "#connect-wallet") {
      return;
    }

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    setIsChooserOpen(true);
  }, []);

  return (
    <>
      <WalletActionButton isConnected={false} onAction={() => setIsChooserOpen(true)} />
      <Drawer open={isChooserOpen} onOpenChange={setIsChooserOpen} showSwipeHandle>
        <DrawerContent
          className="data-[swipe-direction=down]:h-[min(85dvh,36rem)]"
          finalFocus={() => document.querySelector<HTMLElement>("[data-wallet-action]")}
          initialFocus={chooserSurfaceRef}
          placement="responsive-center"
          ref={chooserSurfaceRef}
        >
          <DrawerHeader className="p-(--ds-surface-inset) pb-0">
            <DrawerTitle>Connect wallet</DrawerTitle>
            <DrawerDescription>
              Wallet connections are paused during the chain migration.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col px-(--ds-surface-inset) py-6">
            <Empty className="min-h-0 border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WalletCards aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Wallet connections are temporarily unavailable</EmptyTitle>
                <EmptyDescription>{CHAIN_MIGRATION_DESCRIPTION}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>

          <DrawerFooter className="p-(--ds-surface-inset) pt-0">
            <DrawerClose render={<Button className="w-full" variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function WalletActionButton({
  isConnected,
  isPending = false,
  onAction,
}: {
  isConnected: boolean;
  isPending?: boolean;
  onAction: () => void;
}) {
  return (
    <Button
      aria-busy={isPending || undefined}
      className={isConnected ? "bg-card" : undefined}
      data-wallet-action=""
      disabled={isPending}
      id="connect-wallet"
      onClick={onAction}
      type="button"
      variant={isConnected ? "outline" : "default"}
    >
      {isConnected ? "Disconnect wallet" : "Connect wallet"}
    </Button>
  );
}
