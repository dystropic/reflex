"use client";

import { getNearSelector } from "./nearSelector";
import { CoinOption } from "../types/funding";

export interface NearPayOutcome {
  txHash: string | null;
  senderId: string;
}

export const nearTreasury = () => process.env.NEXT_PUBLIC_NEAR_TREASURY ?? "";

export const payNear = async (
  walletId: string,
  option: CoinOption,
  units: bigint,
  callbackUrl: string,
): Promise<NearPayOutcome> => {
  const treasury = nearTreasury();
  if (!treasury) {
    throw new Error("near treasury isn't set up here");
  }
  const selector = await getNearSelector();
  const wallet = await selector.wallet(walletId);
  const state = selector.store.getState();
  const senderId = state.accounts.find((a) => a.active)?.accountId ?? state.accounts[0]?.accountId ?? "";
  if (!senderId) {
    await wallet.signIn({ contractId: "", accounts: [] });
  }
  const actions =
    option.kind === "near-native"
      ? [
          {
            type: "Transfer" as const,
            params: { deposit: units.toString() },
          },
        ]
      : [
          {
            type: "FunctionCall" as const,
            params: {
              methodName: "ft_transfer",
              args: { receiver_id: treasury, amount: units.toString() },
              gas: "30000000000000",
              deposit: "1",
            },
          },
        ];
  const receiverId = option.kind === "near-native" ? treasury : (option.contract ?? "");
  type WalletActions = Parameters<(typeof wallet)["signAndSendTransaction"]>[0]["actions"];
  const outcome = await wallet.signAndSendTransaction({
    receiverId,
    actions: actions as unknown as WalletActions,
    callbackUrl,
  });
  const refreshed = (await getNearSelector()).store.getState();
  const account =
    refreshed.accounts.find((a) => a.active)?.accountId ?? refreshed.accounts[0]?.accountId ?? senderId;
  if (outcome && typeof outcome === "object" && "transaction" in outcome) {
    const tx = (outcome as { transaction: { hash: string } }).transaction;
    return { txHash: tx.hash, senderId: account };
  }
  return { txHash: null, senderId: account };
};
