"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { COLORS } from "../hooks/theme";

export function WalletAuth({ onSignedIn }: { onSignedIn: () => void }) {
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const choices = connectors.filter(
    (c, _, all) =>
      c.id !== "injected" ||
      !all.some((o) => o.type === "injected" && o.id !== "injected"),
  );

  const connectorLabel = (c: (typeof connectors)[number]) => {
    if (c.type === "walletConnect") return "phone wallet · qr";
    if (c.name === "Injected") return "browser wallet";
    return c.name.toLowerCase();
  };

  const connect = async (connector: (typeof connectors)[number]) => {
    setError("");
    try {
      await connectAsync({ connector });
    } catch {
      setError("wallet connection rejected");
    }
  };

  const signIn = async () => {
    if (!address) return;
    setBusy(true);
    setError("");
    try {
      const nonceRes = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { message } = await nonceRes.json();
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "that did not go through");
      } else {
        onSignedIn();
      }
    } catch {
      setError("signature rejected");
    }
    setBusy(false);
  };

  return (
    <div className="flex relative flex-col w-full" style={{ gap: 14 }}>
      {isConnected ? (
        <div className="flex relative flex-col" style={{ gap: 14 }}>
          <span className="flex relative break-all" style={{ fontFamily: "IosevkaDiamond, monospace", fontSize: 12, color: COLORS.reserve }}>
            {address}
          </span>
          <div className="flex relative flex-row items-center" style={{ gap: 18 }}>
            <button
              onClick={signIn}
              disabled={busy}
              className="flex relative cursor-pointer disabled:opacity-30"
              style={{
                padding: "8px 18px",
                border: `1px solid ${COLORS.green}`,
                fontFamily: "ChicagoKare, monospace",
                fontSize: 13,
                color: COLORS.green,
                background: "transparent",
              }}
            >
              {busy ? "signing…" : "sign in with wallet"}
            </button>
            <button
              onClick={() => disconnect()}
              className="flex relative cursor-pointer"
              style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.dim, background: "transparent", border: "none" }}
            >
              disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="flex relative flex-row flex-wrap" style={{ gap: 10 }}>
          {choices.length === 0 ? (
            <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.dim }}>
              no wallet found here
            </span>
          ) : (
            choices.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect(connector)}
                className="flex relative cursor-pointer"
                style={{
                  padding: "8px 18px",
                  border: `1px solid ${COLORS.cyan}`,
                  fontFamily: "ChicagoKare, monospace",
                  fontSize: 13,
                  color: COLORS.cyan,
                  background: "transparent",
                }}
              >
                {connectorLabel(connector)}
              </button>
            ))
          )}
        </div>
      )}
      {error ? (
        <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.err }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
