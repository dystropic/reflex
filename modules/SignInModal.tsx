"use client";

import { useState } from "react";
import { COLORS } from "../hooks/theme";
import { NearAuth } from "./NearAuth";
import { Popup } from "./Popup";
import { SolanaAuth } from "./SolanaAuth";
import { WalletAuth } from "./WalletAuth";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${COLORS.dim}`,
  padding: "8px 2px",
  fontFamily: "IosevkaDiamond, monospace",
  fontSize: 14,
  color: COLORS.text,
  outline: "none",
};

export function SignInModal({
  onClose,
  onSignedIn,
}: {
  onClose: () => void;
  onSignedIn: () => void;
}) {
  const [tab, setTab] = useState<"email" | "wallet">("email");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [unverified, setUnverified] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    setUnverified(false);
    const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "that did not go through");
      if (data?.unverified) setUnverified(true);
    } else if (data?.verify) {
      setNotice(data.message ?? "a link is on its way · verify your email to enter");
      setPassword("");
    } else {
      onSignedIn();
    }
    setBusy(false);
  };

  const forgot = async () => {
    setError("");
    if (!email.includes("@")) {
      setError("type your email above first");
      return;
    }
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    setNotice(data?.message ?? data?.error ?? "");
  };

  const resend = async () => {
    if (!email.includes("@")) {
      setError("type your email above first");
      return;
    }
    setError("");
    setUnverified(false);
    const res = await fetch("/api/auth/verify/resend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    setNotice(data?.message ?? "if that email needs a link, a fresh one is on its way");
  };

  return (
    <Popup title="RCA ACCESS" onClose={onClose} width={520}>
      <div className="flex relative flex-col" style={{ gap: 18, padding: "6px 4px" }}>
        <div className="flex relative flex-row" style={{ gap: 22 }}>
          {(["email", "wallet"] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setError("");
                setNotice("");
              }}
              className="flex relative cursor-pointer"
              style={{
                fontFamily: "ChicagoKare, monospace",
                fontSize: 14,
                color: tab === key ? COLORS.yellow : COLORS.green,
                background: "transparent",
                border: "none",
                borderBottom: tab === key ? `1px solid ${COLORS.yellow}` : "1px solid transparent",
                paddingBottom: 2,
              }}
            >
              {key}
            </button>
          ))}
          <span
            className="flex-1 overflow-hidden whitespace-nowrap"
            style={{ fontFamily: "ChicagoKare, monospace", fontSize: 14, color: COLORS.dim, alignSelf: "flex-end" }}
          >
            {".".repeat(80)}
          </span>
        </div>

        {tab === "wallet" ? (
          <div className="flex relative flex-col" style={{ gap: 16 }}>
            <span style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.green }}>
              eth · polygon
            </span>
            <WalletAuth onSignedIn={onSignedIn} />
            <span
              className="overflow-hidden whitespace-nowrap"
              style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.dim }}
            >
              {".".repeat(120)}
            </span>
            <span style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.green }}>
              near
            </span>
            <NearAuth onSignedIn={onSignedIn} />
            <span
              className="overflow-hidden whitespace-nowrap"
              style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.dim }}
            >
              {".".repeat(120)}
            </span>
            <span style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.green }}>
              solana
            </span>
            <SolanaAuth onSignedIn={onSignedIn} />
          </div>
        ) : (
          <div className="flex relative flex-col" style={{ gap: 16 }}>
            <div className="flex relative flex-row" style={{ gap: 18 }}>
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="flex relative cursor-pointer"
                style={{
                  fontFamily: "ChicagoKare, monospace",
                  fontSize: 13,
                  color: mode === "login" ? COLORS.yellow : COLORS.dim,
                  background: "transparent",
                  border: "none",
                }}
              >
                log in
              </button>
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="flex relative cursor-pointer"
                style={{
                  fontFamily: "ChicagoKare, monospace",
                  fontSize: 13,
                  color: mode === "register" ? COLORS.yellow : COLORS.dim,
                  background: "transparent",
                  border: "none",
                }}
              >
                create account
              </button>
            </div>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email"
              style={inputStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password · 8 or more"
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              style={inputStyle}
            />

            <div className="flex relative flex-row items-center" style={{ gap: 18 }}>
              <button
                onClick={submit}
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
                {busy ? "…" : mode === "login" ? "log in" : "create account"}
              </button>
              {mode === "login" ? (
                <button
                  onClick={forgot}
                  className="flex relative cursor-pointer"
                  style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.dim, background: "transparent", border: "none" }}
                >
                  forgot password
                </button>
              ) : null}
            </div>
          </div>
        )}

        {error ? (
          <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.err }}>
            {error}
          </span>
        ) : null}
        {unverified ? (
          <button
            onClick={resend}
            className="flex relative self-start cursor-pointer"
            style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.yellow, background: "transparent", border: "none" }}
          >
            resend the link
          </button>
        ) : null}
        {notice ? (
          <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 12, color: COLORS.yellow }}>
            {notice}
          </span>
        ) : null}
      </div>
    </Popup>
  );
}
