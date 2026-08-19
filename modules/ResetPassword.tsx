"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { COLORS } from "../hooks/theme";

export function ResetPassword() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "that did not go through");
      setBusy(false);
      return;
    }
    router.push("/");
  };

  if (!token) {
    return (
      <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 14, color: COLORS.dim }}>
        no token here · use the link from your email
      </span>
    );
  }

  return (
    <div className="flex relative flex-col" style={{ gap: 18, width: "min(92vw, 420px)" }}>
      <span style={{ fontFamily: "ChicagoKare, monospace", fontSize: 14, color: COLORS.warm }}>
        **** a new password ****
      </span>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="password · 8 or more"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${COLORS.dim}`,
          padding: "8px 2px",
          fontFamily: "IosevkaDiamond, monospace",
          fontSize: 14,
          color: COLORS.text,
          outline: "none",
        }}
      />
      <button
        onClick={submit}
        disabled={busy || password.length < 8}
        className="flex relative self-start cursor-pointer disabled:opacity-30"
        style={{
          padding: "8px 18px",
          border: `1px solid ${COLORS.green}`,
          fontFamily: "ChicagoKare, monospace",
          fontSize: 13,
          color: COLORS.green,
          background: "transparent",
        }}
      >
        {busy ? "saving…" : "set it"}
      </button>
      {error ? (
        <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.err }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
