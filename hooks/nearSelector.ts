"use client";

import { setupWalletSelector, WalletSelector } from "@near-wallet-selector/core";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";

let selectorPromise: Promise<WalletSelector> | null = null;

export const getNearSelector = () => {
  if (!selectorPromise) {
    selectorPromise = setupWalletSelector({
      network: process.env.NEXT_PUBLIC_NEAR_NETWORK === "testnet" ? "testnet" : "mainnet",
      modules: [setupMyNearWallet(), setupMeteorWallet(), setupHereWallet()],
    });
  }
  return selectorPromise;
};
