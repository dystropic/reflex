"use client";

import { useState } from "react";
import bs58 from "bs58";
import { getPhantom } from "../hooks/solanaPay";
import { COLORS } from "../hooks/theme";

export function SolanaAuth({ onSignedIn }: { onSignedIn: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signIn = async () => {
    setBusy(true);
    setError("");
    try {
      const provider = getPhantom();
      if (!provider) throw new Error("no Solana wallet detected (install Phantom)");
      const { publicKey } = await provider.connect();
      const address = publicKey.toString();
      const nonceRes = await fetch("/api/auth/solana/nonce", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const nonceData = await nonceRes.json().catch(() => null);
      if (!nonceRes.ok || !nonceData?.message) {
        throw new Error(nonceData?.error ?? "that did not go through");
      }
      const signed = await provider.signMessage(
        new TextEncoder().encode(nonceData.message),
        "utf8",
      );
      const res = await fetch("/api/auth/solana", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, signature: bs58.encode(signed.signature) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "that did not go through");
      }
      onSignedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "solana sign-in rejected");
    }
    setBusy(false);
  };

  return (
    <div className="flex relative flex-col w-full" style={{ gap: 14 }}>
      <div className="flex relative flex-row flex-wrap" style={{ gap: 10 }}>
        <button
          onClick={signIn}
          disabled={busy}
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
          {busy ? "signing…" : "phantom"}
        </button>
      </div>
      {error ? (
        <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.err }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
