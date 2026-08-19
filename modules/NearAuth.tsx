"use client";

import { Buffer } from "buffer";
import { useState } from "react";
import { NEAR_MESSAGE, NEAR_RECIPIENT } from "../hooks/nearMessage";
import { getNearSelector } from "../hooks/nearSelector";
import { COLORS } from "../hooks/theme";
import { NearSignMessageWallet } from "../types/near";

const WALLETS = [
  { id: "my-near-wallet", label: "my near wallet" },
  { id: "meteor-wallet", label: "meteor" },
  { id: "here-wallet", label: "here wallet · mobile" },
];

export function NearAuth({ onSignedIn }: { onSignedIn: () => void }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const start = async (walletId: string) => {
    setBusy(walletId);
    setError("");
    try {
      const nonceRes = await fetch("/api/auth/near/nonce", { method: "POST" });
      const { key, nonce } = await nonceRes.json();
      const callbackUrl = `${window.location.origin}/`;
      localStorage.setItem("rca_near_auth", JSON.stringify({ key, callbackUrl }));
      const selector = await getNearSelector();
      const wallet = await selector.wallet(walletId);
      const result = await (wallet as unknown as NearSignMessageWallet).signMessage?.({
        message: NEAR_MESSAGE,
        recipient: NEAR_RECIPIENT,
        nonce: Buffer.from(nonce, "base64"),
        callbackUrl,
      });
      if (result) {
        const res = await fetch("/api/auth/near", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            key,
            accountId: result.accountId,
            publicKey: result.publicKey,
            signature: result.signature,
            callbackUrl,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "that did not go through");
        } else {
          localStorage.removeItem("rca_near_auth");
          onSignedIn();
        }
      }
    } catch {
      setError("near sign-in rejected");
    }
    setBusy("");
  };

  return (
    <div className="flex relative flex-col w-full" style={{ gap: 14 }}>
      <div className="flex relative flex-row flex-wrap" style={{ gap: 10 }}>
        {WALLETS.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => start(wallet.id)}
            disabled={busy !== ""}
            className="flex relative cursor-pointer disabled:opacity-30"
            style={{
              padding: "8px 18px",
              border: `1px solid ${COLORS.cyan}`,
              fontFamily: "ChicagoKare, monospace",
              fontSize: 13,
              color: COLORS.cyan,
              background: "transparent",
            }}
          >
            {busy === wallet.id ? "signing…" : wallet.label}
          </button>
        ))}
      </div>
      {error ? (
        <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.err }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
