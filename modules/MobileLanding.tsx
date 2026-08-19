"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { stamp } from "../hooks/clock";
import { CONSTRAINTS } from "../hooks/constraints";
import { RESERVE_ROWS, rowDisplay } from "../hooks/reserveDisplay";
import { COLORS } from "../hooks/theme";
import { useMe } from "../hooks/useMe";
import { TIP_POS } from "../hooks/popups";
import { useNearCallback } from "../hooks/useNearCallback";
import { useNearPayReturn } from "../hooks/useNearPayReturn";
import { useReserves } from "../hooks/useReserves";
import { useStripeReturn } from "../hooks/useStripeReturn";
import { useTerminalKeys } from "../hooks/useTerminalKeys";
import { Constraint } from "../types/reflex";
import { InfoTip } from "./InfoTip";
import { PaymentResult } from "./PaymentResult";
import { ReserveBox } from "./ReserveBox";
import { SignInModal } from "./SignInModal";
import { StripeResult } from "./StripeResult";

function categoryParts(label: string) {
  const bracket = label.indexOf(" [");
  if (bracket === -1) {
    return { name: label, tag: null };
  }
  return { name: label.slice(0, bracket), tag: label.slice(bracket + 1) };
}

export function MobileLanding() {
  const { user, loading, refresh } = useMe();
  useNearCallback(refresh);
  const [authOpen, setAuthOpen] = useState(false);
  const [reserveCode, setReserveCode] = useState<string | null>(null);
  const [infoPopup, setInfoPopup] = useState<string | null>(null);
  const { selected, setSelected, chosen, setChosen } = useTerminalKeys(
    CONSTRAINTS.length,
    reserveCode === null && !authOpen && infoPopup === null,
  );
  const { totals, history, refresh: refreshReserves } = useReserves(user?.id ?? null);
  const { result: stripeResult, clear: clearStripeResult } = useStripeReturn(refreshReserves);
  const [payResult, setPayResult] = useState<{ ok: boolean; lines: string[] } | null>(null);
  const handlePayResult = useCallback((r: { ok: boolean; lines: string[] }) => setPayResult(r), []);
  useNearPayReturn(refreshReserves, handlePayResult);
  const streamVideo = useRef<HTMLVideoElement | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [boxScale, setBoxScale] = useState(0.9);

  useEffect(() => {
    const update = () =>
      setBoxScale(
        Math.min(0.9, (window.innerWidth - 24) / 382, (window.innerHeight - 80) / 470),
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (chosen === null) return;
    const constraint = CONSTRAINTS[chosen];
    setChosen(null);
    if (TIP_POS[constraint.code]) {
      setInfoPopup(constraint.code);
    } else if (constraint.code === "rc-03") {
      setInfoPopup("rc-assembly");
    }
  }, [chosen, setChosen]);

  useEffect(() => {
    if (!infoPopup) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInfoPopup(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [infoPopup]);

  const reserveConstraint =
    reserveCode !== null ? (CONSTRAINTS.find((c) => c.code === reserveCode) ?? null) : null;

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
  };

  const categories: { label: string; items: { constraint: Constraint; index: number }[] }[] = [];
  CONSTRAINTS.forEach((constraint, index) => {
    const last = categories[categories.length - 1];
    if (!last || last.label !== constraint.category) {
      categories.push({ label: constraint.category, items: [{ constraint, index }] });
    } else {
      last.items.push({ constraint, index });
    }
  });

  return (
    <div className="flex relative flex-col w-full" style={{ background: COLORS.bg, minHeight: "100vh" }}>
      <img draggable={false} src="/img/deco-bar.png" alt="" style={{ width: "100%", height: 16, marginTop: 14 }} />

      <div
        className="flex relative flex-col"
        style={{ padding: "26px 20px 0 20px", fontFamily: "HighTower, serif", fontSize: 22, lineHeight: "26px", color: COLORS.text }}
      >
        <span>BEFORE AGENTS WORK WITH YOU</span>
        <span style={{ fontStyle: "italic", fontSize: 19 }}>
          This reflex gives you a PHD in model language, in one file
        </span>
      </div>

      <div
        className="flex relative flex-col"
        style={{ padding: "20px 20px 0 20px", gap: 14, fontFamily: "HighTower, serif", fontSize: 16, lineHeight: "22px", color: "#f4f3f5" }}
      >
        <span>
          The mechanism inside this reflex maps abstractions, intents, and contraints to &quot;microhires&quot;.
        </span>
        <div className="flex relative flex-col" style={{ color: COLORS.green, lineHeight: "26px" }}>
          <span className="cursor-pointer self-start" onClick={() => setInfoPopup("microhire")}>what is a microhire?</span>
          <span className="cursor-pointer self-start" onClick={() => setInfoPopup("not-contract")}>not a contract</span>
          <span className="cursor-pointer self-start" onClick={() => setInfoPopup("not-grant")}>not a grant</span>
          <span className="cursor-pointer self-start" onClick={() => setInfoPopup("reverse-grant")}>maybe a reverse grant</span>
          <span>almost a retroactive preflex* (huh?)</span>
        </div>
        <span>
          A word can pull a thought behind it, new constraints at every turn, and for each one a thousand
          possibilities left unresolved.
        </span>
      </div>

      <img draggable={false} src="/img/logo.png" alt="" style={{ width: "100%", height: "auto", marginTop: 10 }} />

      <div
        className="flex relative flex-col"
        style={{ padding: "8px 20px 0 20px", fontFamily: "HighTower, serif", fontSize: 16, lineHeight: "24px", color: COLORS.text }}
      >
        <span style={{ fontFamily: "ChicagoKare, monospace", color: COLORS.warm, fontSize: 14 }} className="overflow-hidden whitespace-nowrap">
          {"******** "}
          <span style={{ fontFamily: "IosevkaDiamond, monospace", fontSize: 12 }}>
            {`RCA ${now ? stamp(now) : ""}`}
          </span>
          {" ********"}
        </span>
        <div
          className="flex relative flex-row justify-between cursor-pointer"
          style={{ color: COLORS.green }}
          onClick={() => setInfoPopup("constraint-reservoir")}
        >
          <span>constraint</span>
          <span>reservoir</span>
        </div>
        <span className="overflow-hidden whitespace-nowrap" style={{ fontFamily: "ChicagoKare, monospace", color: COLORS.warm, fontSize: 14 }}>
          *******************************************
        </span>
        <span>&nbsp;</span>
        <div
          className="flex relative flex-row justify-between cursor-pointer"
          style={{ color: COLORS.yellow }}
          onClick={() => setInfoPopup("reflex-constraints")}
        >
          <span>reflex</span>
          <span>constraints:</span>
        </div>
        {categories.map((category) => {
          const parts = categoryParts(category.label);
          return (
            <div key={category.label} className="flex relative flex-col">
              <div className="flex relative flex-row items-baseline">
                <span className="whitespace-nowrap" style={{ color: COLORS.cyan }}>{parts.name}</span>
                {parts.tag && (
                  <span className="whitespace-nowrap" style={{ fontFamily: "IosevkaDiamond, monospace", color: COLORS.warm, marginLeft: 8, fontSize: 13 }}>
                    {parts.tag}
                  </span>
                )}
                <span
                  className="flex-1 overflow-hidden whitespace-nowrap"
                  style={{ fontFamily: "ChicagoKare, monospace", color: COLORS.warm, marginLeft: 8, fontSize: 14 }}
                >
                  {".".repeat(80)}
                </span>
              </div>
              {category.items.map(({ constraint, index }) => {
                const isSelected = selected === index;
                const isChosen = chosen === index;
                return (
                  <div
                    key={constraint.code}
                    className="relative cursor-pointer"
                    style={{
                      background: isSelected ? COLORS.select : "transparent",
                      color: isSelected || isChosen ? COLORS.yellow : COLORS.green,
                      textAlign: "justify",
                      textAlignLast: "justify",
                    }}
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => setChosen(index)}
                  >
                    {constraint.code}: {constraint.name}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div
        className="relative"
        style={{ margin: "26px 20px 0 20px", fontFamily: "HighTower, serif", fontSize: 17, color: COLORS.text, textAlign: "justify", textAlignLast: "justify" }}
      >
        * * * * *
      </div>
      <img draggable={false} src="/img/blueprint.png" alt="" style={{ width: "calc(100% - 40px)", height: "auto", margin: "12px 20px 0 20px" }} />

      <div
        className="relative"
        style={{ margin: "26px 20px 0 20px", fontFamily: "HighTower, serif", fontSize: 17, color: COLORS.text, textAlign: "justify", textAlignLast: "justify" }}
      >
        * * * <span style={{ fontFamily: "IosevkaDiamond, monospace", fontSize: 15 }}>MAP</span> * * *
      </div>
      <img
        draggable={false}
        src="/img/bearings.png"
        alt=""
        style={{ width: "calc(100% - 40px)", height: "auto", margin: "12px 20px 0 20px" }}
      />

      <div className="flex relative flex-col" style={{ padding: "22px 20px 0 20px" }}>
        {RESERVE_ROWS.map((row, index) => {
          const display = rowDisplay(row, totals);
          const clickable = row.kind === "fund";
          return (
            <div
              key={index}
              className={`flex relative flex-row items-baseline ${clickable ? "cursor-pointer" : ""}`}
              style={{
                fontFamily: display.thin ? "IosevkaDiamondThin, monospace" : "IosevkaDiamond, monospace",
                fontSize: display.thin ? 13.5 : 14,
                lineHeight: "22px",
                color: COLORS.reserve,
              }}
              onClick={() => {
                if (!clickable || !row.code) {
                  setInfoPopup("reserves");
                  return;
                }
                setReserveCode(row.code);
              }}
            >
              <span>RESERVES</span>
              <span className="flex-1 overflow-hidden whitespace-nowrap">{".".repeat(60)}</span>
              <span style={{ color: display.color }}>{display.value}</span>
            </div>
          );
        })}
      </div>

      <div className="flex relative flex-col" style={{ margin: "26px 12px 0 12px", background: COLORS.bezel, borderRadius: 8, padding: 10 }}>
        <div className="flex relative flex-col" style={{ background: "#000000", padding: "12px 12px 10px 12px" }}>
          <video
            ref={streamVideo}
            src="/video/stream.mp4"
            poster="/img/stream.png"
            autoPlay
            loop
            muted
            playsInline
            className="cursor-pointer"
            style={{ width: "100%", height: "auto" }}
            onClick={() => setInfoPopup("stream")}
          />
          <div className="flex relative flex-row items-center justify-end" style={{ marginTop: 10, gap: 8 }}>
            <div
              className="cursor-pointer"
              style={{
                width: 0,
                height: 0,
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                borderLeft: `5px solid ${COLORS.glyph}`,
              }}
              onClick={() => streamVideo.current?.play()}
            />
            <div className="flex relative flex-row cursor-pointer" style={{ gap: 3 }} onClick={() => streamVideo.current?.pause()}>
              <div style={{ width: 3, height: 10, background: COLORS.glyph }} />
              <div style={{ width: 3, height: 10, background: COLORS.glyph }} />
            </div>
            <span
              className="overflow-hidden whitespace-nowrap"
              style={{ fontFamily: "ChicagoKare, monospace", fontSize: 13, color: COLORS.text }}
            >
              ANTICS BBS STREAMING 24/7
            </span>
          </div>
        </div>
      </div>

      <img draggable={false} src="/img/deco-bar.png" alt="" style={{ width: "100%", height: 16, marginTop: 30 }} />

      <div
        className="flex relative flex-col"
        style={{ padding: "24px 20px 0 20px", gap: 6, fontFamily: "HighTower, serif", fontSize: 16, lineHeight: "24px", color: "#f4f3f5" }}
      >
        <span>Plain language is not specialized language with easier words.</span>
        <span>It makes structure visible without needing to invent missing context.</span>
      </div>

      <div className="flex relative flex-col items-end" style={{ padding: "26px 20px 40px 20px", gap: 6 }}>
        <div
          className="flex relative overflow-hidden cursor-pointer"
          style={{ width: 56, height: 56, borderRadius: 10, border: `2px solid ${COLORS.text}` }}
          onClick={() => (user ? logout() : setAuthOpen(true))}
        >
          <img draggable={false} src="/img/avatar.png" alt="" className="w-full h-full object-cover" />
        </div>
        <span
          className="cursor-pointer"
          style={{ fontFamily: "ChicagoKare, monospace", fontSize: 11, color: COLORS.text }}
          onClick={() => (user ? logout() : setAuthOpen(true))}
        >
          {loading ? "" : user ? "[sign out]" : "[sign in]"}
        </span>
      </div>

      {reserveConstraint !== null ? (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(0,0,0,0.6)" }}
            onClick={() => setReserveCode(null)}
          />
          <div
            className="flex relative flex-row justify-center"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 50,
            }}
          >
            <ReserveBox
              key={reserveConstraint.code}
              constraint={reserveConstraint}
              fundedCents={totals[reserveConstraint.code] ?? 0}
              receipts={history[reserveConstraint.code] ?? []}
              signedIn={!!user}
              scale={boxScale}
              onClose={() => setReserveCode(null)}
              onRequireAuth={() => setAuthOpen(true)}
              onFunded={refreshReserves}
              onPaid={(lines) => setPayResult({ ok: true, lines })}
            />
          </div>
        </>
      ) : null}

      {authOpen && !user ? (
        <SignInModal
          onClose={() => setAuthOpen(false)}
          onSignedIn={() => {
            setAuthOpen(false);
            refresh();
          }}
        />
      ) : null}

      {stripeResult ? <StripeResult result={stripeResult} onClose={clearStripeResult} /> : null}

      {payResult ? <PaymentResult result={payResult} onClose={() => setPayResult(null)} /> : null}

      {infoPopup ? (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 49 }}
            onClick={() => setInfoPopup(null)}
          />
          <div
            style={{
              position: "fixed",
              top: 76,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(92vw, 480px)",
              zIndex: 50,
            }}
          >
            <InfoTip id={infoPopup} scale={0.8} />
          </div>
        </>
      ) : null}
    </div>
  );
}
