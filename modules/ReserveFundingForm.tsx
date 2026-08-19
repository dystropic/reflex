"use client";

import { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useAccount, useConnect, useSendTransaction, useSwitchChain, useWriteContract } from "wagmi";
import {
  AppChainId,
  COIN_MODE,
  coinOptions,
  formatUsd,
  payableNow,
  unitsForCents,
  unitsForUsdAtPrice,
} from "../hooks/coins";
import { payNear } from "../hooks/nearPay";
import { paySolToken } from "../hooks/solanaPay";
import { COLORS } from "../hooks/theme";
import { CoinOption } from "../types/funding";
import { Constraint } from "../types/reflex";

interface PayResult {
  ok: boolean;
  lines: string[];
}

const NEAR_WALLETS = [
  { id: "my-near-wallet", label: "my near wallet" },
  { id: "meteor-wallet", label: "meteor" },
  { id: "here-wallet", label: "here wallet" },
];

export function ReserveFundingForm({
  constraint,
  signedIn,
  scale,
  onRequireAuth,
  onFunded,
  onSuccess,
}: {
  constraint: Constraint;
  signedIn: boolean;
  scale: number;
  onRequireAuth: () => void;
  onFunded: () => void;
  onSuccess: (lines: string[]) => void;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const [amount, setAmount] = useState("");
  const [coinsOpen, setCoinsOpen] = useState(false);
  const [nearOption, setNearOption] = useState<CoinOption | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<PayResult | null>(null);

  useEffect(() => {
    const onShow = () => {
      setBusy(false);
      setStatus("");
    };
    window.addEventListener("pageshow", onShow);
    document.addEventListener("visibilitychange", onShow);
    return () => {
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  const s = (v: number) => v * scale;
  const usd = (() => {
    const value = Number.parseFloat(amount);
    return Number.isFinite(value) && value > 0 ? value : null;
  })();
  const cents = usd !== null ? Math.round(usd * 100) : 0;

  const finish = (option: CoinOption, txHash: string, totalCents: number) => {
    setStatus("");
    setCoinsOpen(false);
    setNearOption(null);
    setAmount("");
    setResult(null);
    onFunded();
    onSuccess([
      "payment confirmed ✓",
      `paid ${formatUsd(cents)} via ${option.asset} on ${option.chain}`,
      `tx ${txHash.slice(0, 10)}…${txHash.slice(-8)}`,
      `${constraint.code} funded ${formatUsd(totalCents)} total`,
    ]);
  };

  const fail = (option: CoinOption, e: unknown) => {
    setStatus("");
    setResult({
      ok: false,
      lines: [
        "failed · nothing was recorded",
        e instanceof Error ? e.message : "payment failed",
        `wanted ${formatUsd(cents)} via ${option.asset} on ${option.chain}`,
      ],
    });
  };

  const verify = async (path: string, payload: Record<string, unknown>) => {
    setStatus("waiting for confirmation…");
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error ?? "verification failed");
    return data;
  };

  const payEvm = async (option: CoinOption) => {
    if (!isConnected) {
      setStatus("connecting wallet…");
      const connector = connectors[0];
      if (!connector) throw new Error("no wallet extension detected");
      await connectAsync({ connector });
    }
    if (chainId !== option.chainId) {
      setStatus("switching network…");
      await switchChainAsync({ chainId: option.chainId as AppChainId });
    }
    const units = unitsForCents(cents, option.decimals);
    setStatus(`confirm ${option.asset} in your wallet…`);
    const treasury = (
      option.chainId === 31337
        ? (process.env.NEXT_PUBLIC_ANVIL_TREASURY_ADDRESS ?? "")
        : (process.env.NEXT_PUBLIC_TREASURY_ADDRESS ?? "")
    ) as `0x${string}`;
    const txHash =
      option.kind === "evm-native"
        ? await sendTransactionAsync({
            to: treasury,
            value: units,
            chainId: option.chainId as AppChainId,
          })
        : await writeContractAsync({
            address: option.contract as `0x${string}`,
            abi: erc20Abi,
            functionName: "transfer",
            args: [treasury, units],
            chainId: option.chainId as AppChainId,
          });
    const data = await verify("/api/reserve/crypto", {
      txHash,
      optionId: option.id,
      code: constraint.code,
      cents,
    });
    finish(option, txHash, data.totalCents ?? cents);
  };

  const paySol = async (option: CoinOption) => {
    const units = unitsForCents(cents, option.decimals);
    setStatus(`confirm ${option.asset} in your solana wallet…`);
    const signature = await paySolToken(
      option.contract ?? "",
      units,
      process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS ?? "",
    );
    const data = await verify("/api/reserve/solana", {
      signature,
      optionId: option.id,
      code: constraint.code,
      cents,
    });
    finish(option, signature, data.totalCents ?? cents);
  };

  const payNearWith = async (option: CoinOption, walletId: string) => {
    setBusy(true);
    setError("");
    try {
      let units: bigint;
      if (option.usdPegged) {
        units = unitsForCents(cents, option.decimals);
      } else {
        setStatus("fetching near price…");
        const res = await fetch("/api/near/price");
        const data = await res.json().catch(() => null);
        if (!data?.usd) throw new Error("near price unavailable");
        units = unitsForUsdAtPrice(cents / 100, data.usd, option.decimals);
      }
      window.localStorage.setItem(
        "rca_near_pay",
        JSON.stringify({ optionId: option.id, code: constraint.code, cents }),
      );
      setStatus(`confirm ${option.asset} in your near wallet…`);
      const outcome = await payNear(walletId, option, units, `${window.location.origin}/`);
      if (outcome.txHash) {
        const data = await verify("/api/reserve/near", {
          txHash: outcome.txHash,
          senderId: outcome.senderId,
          optionId: option.id,
          code: constraint.code,
          cents,
        });
        window.localStorage.removeItem("rca_near_pay");
        finish(option, outcome.txHash, data.totalCents ?? cents);
      }
    } catch (e) {
      window.localStorage.removeItem("rca_near_pay");
      fail(option, e);
    }
    setBusy(false);
  };

  const payCoin = async (option: CoinOption) => {
    if (usd === null) {
      setError("enter a valid amount first");
      return;
    }
    if (!payableNow(option)) {
      setError(`${option.asset} on ${option.chain} isn't live in this mode`);
      return;
    }
    if (option.kind === "near-native" || option.kind === "near-ft") {
      setNearOption(nearOption?.id === option.id ? null : option);
      return;
    }
    setNearOption(null);
    setBusy(true);
    setError("");
    setResult(null);
    try {
      if (option.kind === "sol-spl") {
        await paySol(option);
      } else {
        await payEvm(option);
      }
    } catch (e) {
      fail(option, e);
    }
    setBusy(false);
  };

  const payCard = async () => {
    if (!signedIn) {
      onRequireAuth();
      return;
    }
    if (usd === null) {
      setError("enter a valid amount first");
      return;
    }
    setBusy(true);
    setError("");
    setStatus("opening checkout…");
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: constraint.code, cents }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) {
      setError(data?.error ?? "checkout failed");
      setStatus("");
      setBusy(false);
      return;
    }
    window.location.href = data.url;
  };

  const openCoins = () => {
    if (!signedIn) {
      onRequireAuth();
      return;
    }
    if (usd === null) {
      setError("enter a valid amount first");
      return;
    }
    setError("");
    setCoinsOpen((v) => !v);
  };

  return (
    <div className="flex relative flex-col" style={{ marginTop: s(16), gap: s(8) }}>
      <div className="flex relative flex-row items-baseline" style={{ gap: s(12) }}>
        <span style={{ color: COLORS.yellow, fontSize: s(34) }}>$</span>
        <input
          value={amount}
          onChange={(event) => {
            const next = event.target.value;
            if (/^\d{0,10}(\.\d{0,2})?$/.test(next)) setAmount(next);
          }}
          placeholder="0.00"
          inputMode="decimal"
          className="flex-1"
          style={{
            minWidth: 0,
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${COLORS.dim}`,
            outline: "none",
            fontFamily: "HighTower, serif",
            fontSize: s(34),
            color: COLORS.text,
            padding: `0 0 ${s(3)}px 0`,
          }}
        />
      </div>
      <div className="flex relative flex-row items-baseline justify-between cursor-pointer" onClick={openCoins}>
        <span style={{ color: COLORS.green }}>{"coin >"}</span>
        <span style={{ color: COLORS.dim, fontSize: s(18) }}>
          {COIN_MODE === "anvil" ? "ETH · local anvil · 1:1 USD (test)" : "USDC multi-chain · NEAR · Solana"}
        </span>
      </div>
      {coinsOpen
        ? coinOptions().map((option) => {
            const live = payableNow(option);
            return (
              <div key={option.id} className="flex relative flex-col">
                <div
                  className={`flex relative flex-row items-baseline justify-between ${live ? "cursor-pointer" : ""}`}
                  style={{ paddingLeft: s(21), opacity: live ? 1 : 0.4 }}
                  onClick={() => (busy || !live ? null : payCoin(option))}
                >
                  <span style={{ color: COLORS.cyan }}>{`[${option.asset} · ${option.chain}]`}</span>
                  <span style={{ color: COLORS.dim, fontSize: s(17) }}>
                    {live ? option.desc : `${option.desc} · soon`}
                  </span>
                </div>
                {nearOption?.id === option.id
                  ? NEAR_WALLETS.map((wallet) => (
                      <div
                        key={wallet.id}
                        className="cursor-pointer"
                        style={{ paddingLeft: s(42), color: COLORS.green, fontSize: s(19) }}
                        onClick={() => (busy ? null : payNearWith(option, wallet.id))}
                      >
                        {`> ${wallet.label}`}
                      </div>
                    ))
                  : null}
              </div>
            );
          })
        : null}
      <div
        className="flex relative flex-row items-baseline justify-between cursor-pointer"
        onClick={() => (busy ? null : payCard())}
      >
        <span style={{ color: COLORS.green }}>{"card >"}</span>
        <span style={{ color: COLORS.dim, fontSize: s(18) }}>USD · Stripe</span>
      </div>
      {status ? <div style={{ color: COLORS.yellow, fontSize: s(19) }}>{status}</div> : null}
      {error ? <div style={{ color: COLORS.err, fontSize: s(19) }}>{error}</div> : null}
      {result ? (
        <div className="flex relative flex-col" style={{ gap: s(4) }}>
          {result.lines.map((line, index) => (
            <div
              key={index}
              style={{
                color: index === 0 ? (result.ok ? COLORS.ready : COLORS.err) : COLORS.text,
                fontSize: s(19),
              }}
            >
              {line}
            </div>
          ))}
          {!result.ok ? (
            <div
              className="cursor-pointer"
              style={{ color: COLORS.cyan, fontSize: s(19) }}
              onClick={() => setResult(null)}
            >
              [try again]
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
