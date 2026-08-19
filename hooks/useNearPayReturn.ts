"use client";

import { useEffect } from "react";
import { getNearSelector } from "./nearSelector";
import { formatUsd } from "./coins";

export const useNearPayReturn = (
  onFunded: () => void,
  onResult: (result: { ok: boolean; lines: string[] }) => void,
) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashes = params.get("transactionHashes");
    const errorCode = params.get("errorCode");
    const stored = window.localStorage.getItem("rca_near_pay");
    if (!hashes && !errorCode) return;
    window.history.replaceState(null, "", window.location.pathname);
    if (!stored) return;
    window.localStorage.removeItem("rca_near_pay");
    if (errorCode || !hashes) return;
    let ctx: { optionId: string; code: string; cents: number };
    try {
      ctx = JSON.parse(stored);
    } catch {
      return;
    }
    const txHash = hashes.split(",").pop() ?? "";
    (async () => {
      const selector = await getNearSelector();
      const state = selector.store.getState();
      const senderId =
        state.accounts.find((a) => a.active)?.accountId ?? state.accounts[0]?.accountId ?? "";
      const res = await fetch("/api/reserve/near", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          txHash,
          senderId,
          optionId: ctx.optionId,
          code: ctx.code,
          cents: ctx.cents,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        onFunded();
        onResult({
          ok: true,
          lines: [
            "payment confirmed ✓",
            `paid ${formatUsd(ctx.cents)} via NEAR`,
            `tx ${txHash.slice(0, 10)}…${txHash.slice(-6)}`,
            `${ctx.code} funded ${formatUsd(data.totalCents ?? ctx.cents)} total`,
          ],
        });
      } else {
        onResult({
          ok: false,
          lines: ["failed · nothing was recorded", data?.error ?? "verification failed"],
        });
      }
    })();
  }, [onFunded, onResult]);
};
