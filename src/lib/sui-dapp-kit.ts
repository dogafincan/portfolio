import { createDAppKit } from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";

const MAINNET_GRPC_URL = "https://fullnode.mainnet.sui.io:443";

export const portfolioDAppKit = createDAppKit({
  networks: ["mainnet"],
  defaultNetwork: "mainnet",
  createClient: (network) =>
    new SuiGrpcClient({
      network,
      baseUrl: MAINNET_GRPC_URL,
    }),
  autoConnect: false,
  slushWalletConfig: null,
  storage: null,
});

declare module "@mysten/dapp-kit-react" {
  interface Register {
    dAppKit: typeof portfolioDAppKit;
  }
}
