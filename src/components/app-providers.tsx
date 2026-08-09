import type { ReactNode } from "react";

import { DojiWalletProvider } from "@/components/doji-wallet";

export function AppProviders({ children }: { children: ReactNode }) {
  return <DojiWalletProvider>{children}</DojiWalletProvider>;
}
