import { lazy, Suspense } from "react";

import { useDojiWallet } from "@/components/doji-wallet";

const WalletRuntimeIsland = lazy(async () => {
  const module = await import("@/components/wallet-runtime");
  return { default: module.WalletRuntimeIsland };
});

export function WalletRuntimeLoader() {
  const wallet = useDojiWallet();
  if (!wallet.activated) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <WalletRuntimeIsland />
    </Suspense>
  );
}
