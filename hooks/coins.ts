import { Chain } from "viem";
import { anvil, arbitrum, base, mainnet, polygon } from "viem/chains";
import { IS_PROD } from "./appMode";
import { CoinOption } from "../types/funding";

export const COIN_MODE = IS_PROD ? "production" : "anvil";

export type AppChainId = 1 | 137 | 8453 | 42161 | 31337;

export const EVM_CHAINS: Record<number, Chain> = {
  [anvil.id]: anvil,
  [mainnet.id]: mainnet,
  [base.id]: base,
  [arbitrum.id]: arbitrum,
  [polygon.id]: polygon,
};

export const OPTIONS: CoinOption[] = [
  {
    id: "usdc-near",
    asset: "USDC",
    chain: "NEAR",
    desc: "native USDC on NEAR",
    kind: "near-ft",
    chainId: null,
    contract: "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
    decimals: 6,
    usdPegged: true,
  },
  {
    id: "usdc-ethereum",
    asset: "USDC",
    chain: "Ethereum",
    desc: "ERC20 on Ethereum",
    kind: "evm-erc20",
    chainId: mainnet.id,
    contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    usdPegged: true,
  },
  {
    id: "usdc-base",
    asset: "USDC",
    chain: "Base",
    desc: "ERC20 on Base",
    kind: "evm-erc20",
    chainId: base.id,
    contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    usdPegged: true,
  },
  {
    id: "usdc-arbitrum",
    asset: "USDC",
    chain: "Arbitrum",
    desc: "ERC20 on Arbitrum",
    kind: "evm-erc20",
    chainId: arbitrum.id,
    contract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    usdPegged: true,
  },
  {
    id: "usdc-polygon",
    asset: "USDC",
    chain: "Polygon",
    desc: "ERC20 on Polygon",
    kind: "evm-erc20",
    chainId: polygon.id,
    contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimals: 6,
    usdPegged: true,
  },
  {
    id: "usdc-solana",
    asset: "USDC",
    chain: "Solana",
    desc: "SPL token on Solana",
    kind: "sol-spl",
    chainId: null,
    contract: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    usdPegged: true,
  },
  {
    id: "near-native",
    asset: "NEAR",
    chain: "NEAR",
    desc: "native NEAR token",
    kind: "near-native",
    chainId: null,
    contract: null,
    decimals: 24,
    usdPegged: false,
  },
  {
    id: "near-ethereum",
    asset: "NEAR",
    chain: "Ethereum",
    desc: "NEAR as ERC20 on Ethereum",
    kind: "evm-erc20",
    chainId: mainnet.id,
    contract: "0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4",
    decimals: 24,
    usdPegged: false,
  },
];

export const ANVIL_OPTIONS: CoinOption[] = [
  {
    id: "anvil-eth",
    asset: "ETH",
    chain: "Anvil",
    desc: "native ETH on local anvil · 1:1 USD (test)",
    kind: "evm-native",
    chainId: anvil.id,
    contract: null,
    decimals: 18,
    usdPegged: true,
  },
  {
    id: "anvil-token",
    asset: "TOKEN",
    chain: "Anvil",
    desc: "ERC20 on local anvil · 1:1 USD (test)",
    kind: "evm-erc20",
    chainId: anvil.id,
    contract: process.env.NEXT_PUBLIC_ANVIL_TOKEN ?? null,
    decimals: 18,
    usdPegged: true,
  },
];

export const coinOptions = () => {
  if (COIN_MODE === "anvil") {
    return ANVIL_OPTIONS[1].contract ? ANVIL_OPTIONS : ANVIL_OPTIONS.slice(0, 1);
  }
  return OPTIONS;
};

export const coinById = (id: string): CoinOption | null =>
  [...ANVIL_OPTIONS, ...OPTIONS].find((option) => option.id === id) ?? null;

export const payableNow = (option: CoinOption) => {
  if (!IS_PROD) return option.chainId === 31337;
  if (option.chainId === 31337) return false;
  if (option.kind === "evm-erc20" && option.contract === null) return false;
  return true;
};

export const unitsForCents = (cents: number, decimals: number) =>
  (BigInt(cents) * 10n ** BigInt(decimals)) / 100n;

export const unitsForUsdAtPrice = (usd: number, price: number, decimals: number) => {
  const tokens = usd / price;
  return BigInt(Math.round(tokens * 1e8)) * 10n ** BigInt(decimals - 8);
};

export const formatUsd = (cents: number) => `$${(cents / 100).toFixed(2)}`;
