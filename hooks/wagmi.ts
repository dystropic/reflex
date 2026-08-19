import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { anvil, arbitrum, base, mainnet, polygon } from "viem/chains";

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export function getConfig() {
  return createConfig({
    chains: [anvil, mainnet, polygon, base, arbitrum],
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
    connectors: [
      injected(),
      ...(wcProjectId
        ? [
            walletConnect({
              projectId: wcProjectId,
              showQrModal: true,
              metadata: {
                name: "REFLEX",
                description: "RCA reflex cartridge antics",
                url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
                icons: [],
              },
            }),
          ]
        : []),
    ],
    transports: {
      [anvil.id]: http("http://127.0.0.1:8545"),
      [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_ETH || undefined),
      [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_POLYGON || undefined),
      [base.id]: http(process.env.NEXT_PUBLIC_RPC_BASE || undefined),
      [arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_ARBITRUM || undefined),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
