export type CoinKind = "evm-native" | "evm-erc20" | "near-native" | "near-ft" | "sol-spl";

export interface CoinOption {
  id: string;
  asset: string;
  chain: string;
  desc: string;
  kind: CoinKind;
  chainId: number | null;
  contract: string | null;
  decimals: number;
  usdPegged: boolean;
}

export interface ReserveTotals {
  [code: string]: number;
}

export interface ReserveLast {
  cents: number;
  method: string;
  createdAt: string;
  txHash: string | null;
  chainId: number | null;
}

export interface ReserveHistoryMap {
  [code: string]: ReserveLast[];
}
