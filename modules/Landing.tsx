"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { stamp } from "../hooks/clock";
import { CONSTRAINTS } from "../hooks/constraints";
import { COLORS } from "../hooks/theme";
import { useIsMobile } from "../hooks/useIsMobile";
import { useMe } from "../hooks/useMe";
import { useNearCallback } from "../hooks/useNearCallback";
import { useNearPayReturn } from "../hooks/useNearPayReturn";
import { RESERVE_ROWS, rowDisplay } from "../hooks/reserveDisplay";
import { useReserves } from "../hooks/useReserves";
import { useStripeReturn } from "../hooks/useStripeReturn";
import { useTerminalKeys } from "../hooks/useTerminalKeys";
import { Constraint } from "../types/reflex";
import { TIP_POS } from "../hooks/popups";
import { InfoTip } from "./InfoTip";
import { MobileLanding } from "./MobileLanding";
import { PaymentResult } from "./PaymentResult";
import { ReserveBox } from "./ReserveBox";

import { SignInModal } from "./SignInModal";
import { Stage } from "./Stage";
import { StripeResult } from "./StripeResult";



function categoryParts(label: string) {
  const bracket = label.indexOf(" [");
  if (bracket === -1) {
    return { name: label, tag: null };
  }
  return { name: label.slice(0, bracket), tag: label.slice(bracket + 1) };
}

export function Landing() {
  const mobile = useIsMobile();
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

  if (mobile === null) {
    return <div className="flex relative w-full" style={{ background: COLORS.bg, height: "100vh" }} />;
  }

  if (mobile) {
    return <MobileLanding />;
  }

  return (
    <>
    <Stage>
      <img draggable={false} src="/img/deco-bar.png" alt="" className="absolute" style={{ left: 77, top: 111, width: 2412, height: 48 }} />
      <img draggable={false} src="/img/deco-bar.png" alt="" className="absolute" style={{ left: 77, top: 1671, width: 2412, height: 48 }} />

      <div
        className="flex relative flex-col"
        style={{ position: "absolute", left: 81, top: 274, whiteSpace: "nowrap", fontFamily: "HighTower, serif", fontSize: 35.7, lineHeight: "40px", color: COLORS.text }}
      >
        <span>BEFORE AGENTS WORK WITH YOU</span>
        <span style={{ fontStyle: "italic", fontSize: 30.4 }}>
          This reflex gives you a PHD in model language, in one file
        </span>
      </div>

      <div
        className="flex relative"
        style={{ position: "absolute", left: 98, top: 387, width: 657, fontFamily: "HighTower, serif", fontSize: 23.8, lineHeight: "33.8px", color: "#f4f3f5" }}
      >
        The mechanism inside this reflex maps abstractions, intents, and contraints to &quot;microhires&quot;.
      </div>
      <div
        className="flex relative flex-col"
        style={{ position: "absolute", left: 98, top: 474, width: 618, whiteSpace: "nowrap", fontFamily: "HighTower, serif", fontSize: 23.8, lineHeight: "43.2px", color: COLORS.green }}
      >
        <span className="cursor-pointer self-start" onClick={() => setInfoPopup("microhire")}>what is a microhire?</span>
        <span className="cursor-pointer self-start" onClick={() => setInfoPopup("not-contract")}>not a contract</span>
        <span className="cursor-pointer self-start" onClick={() => setInfoPopup("not-grant")}>not a grant</span>
        <span className="cursor-pointer self-start" onClick={() => setInfoPopup("reverse-grant")}>maybe a reverse grant</span>
      </div>
      <div
        className="flex relative"
        style={{ position: "absolute", left: 98, top: 719, width: 657, fontFamily: "HighTower, serif", fontSize: 23.8, lineHeight: "27.1px", color: "#f4f3f5" }}
      >
        A word can pull a thought behind it, new constraints at every turn, and for each one a thousand
        possibilities left unresolved.
      </div>

      <div
        className="flex relative flex-col"
        style={{ position: "absolute", left: 79, top: 817, width: 677, fontFamily: "HighTower, serif", fontSize: 35.7, lineHeight: "44px", color: COLORS.text }}
      >
        <span className="whitespace-nowrap" style={{ fontFamily: "ChicagoKare, monospace", color: COLORS.warm }}>
          {"******** "}
          <span style={{ fontFamily: "IosevkaDiamond, monospace", fontSize: 28 }}>
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
        <span className="overflow-hidden whitespace-nowrap" style={{ fontFamily: "ChicagoKare, monospace", color: COLORS.warm }}>
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
                  <span className="whitespace-nowrap" style={{ fontFamily: "IosevkaDiamond, monospace", fontSize: 28, color: COLORS.warm, marginLeft: 16 }}>
                    {parts.tag}
                  </span>
                )}
                <span
                  className="flex-1 overflow-hidden whitespace-nowrap"
                  style={{ fontFamily: "ChicagoKare, monospace", color: COLORS.warm, marginLeft: 16 }}
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
                    className="flex relative cursor-pointer"
                    style={{
                      background: isSelected ? COLORS.select : "transparent",
                      color: isSelected || isChosen ? COLORS.yellow : COLORS.green,
                      textAlign: "justify",
                      textAlignLast: "justify",
                      display: "block",
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

      <div className="absolute" style={{ position: "absolute", left: 772, top: 265, width: 2, height: 1309, background: COLORS.text }} />

      <div
        className="relative"
        style={{ position: "absolute", left: 804, top: 264, width: 370, fontFamily: "HighTower, serif", fontSize: 27.8, color: COLORS.text, textAlign: "justify", textAlignLast: "justify" }}
      >
        * * * * *
      </div>
      <img draggable={false} src="/img/blueprint.png" alt="" className="absolute" style={{ left: 791, top: 288, width: 396, height: 512, objectFit: "cover" }} />
      <div
        className="relative"
        style={{ position: "absolute", left: 804, top: 816, width: 370, fontFamily: "HighTower, serif", fontSize: 27.8, color: COLORS.text, textAlign: "justify", textAlignLast: "justify" }}
      >
        * * * <span style={{ fontFamily: "IosevkaDiamond, monospace", fontSize: 24 }}>MAP</span> * * *
      </div>
      <img
        draggable={false}
        src="/img/bearings.png"
        alt=""
        className="absolute"
        style={{ left: 797, top: 857, width: 383, height: 216 }}
      />

      {reserveConstraint === null ? (
        RESERVE_ROWS.map((row, index) => {
          const display = rowDisplay(row, totals);
          const clickable = row.kind === "fund";
          const constraintIdx = row.code
            ? CONSTRAINTS.findIndex((c) => c.code === row.code)
            : -1;
          return (
            <div
              key={index}
              className="flex relative flex-row items-baseline cursor-pointer"
              style={{
                position: "absolute",
                left: row.x,
                top: row.y,
                width: 1115 - row.x,
                background:
                  constraintIdx !== -1 && selected === constraintIdx
                    ? COLORS.select
                    : "transparent",
                fontFamily: display.thin ? "IosevkaDiamondThin, monospace" : "IosevkaDiamond, monospace",
                fontSize: 24,
                color: COLORS.reserve,
              }}
              onMouseEnter={() => (constraintIdx !== -1 ? setSelected(constraintIdx) : null)}
              onClick={() => {
                if (!clickable || !row.code) {
                  setInfoPopup("reserves");
                  return;
                }
                setReserveCode(row.code);
              }}
            >
              <span>RESERVES</span>
              <span className="flex-1 overflow-hidden whitespace-nowrap">{".".repeat(40)}</span>
              <span style={{ color: display.color }}>{display.value}</span>
            </div>
          );
        })
      ) : (
        <div className="absolute" style={{ position: "absolute", left: 798, top: 1104, width: 382, height: 470 }}>
          <ReserveBox
            key={reserveConstraint.code}
            constraint={reserveConstraint}
            fundedCents={totals[reserveConstraint.code] ?? 0}
            receipts={history[reserveConstraint.code] ?? []}
            signedIn={!!user}
            scale={1}
            onClose={() => setReserveCode(null)}
            onRequireAuth={() => setAuthOpen(true)}
            onFunded={refreshReserves}
            onPaid={(lines) => setPayResult({ ok: true, lines })}
          />
        </div>
      )}

      <img draggable={false} src="/img/logo.png" alt="" className="absolute" style={{ left: 1249, top: 262, width: 1223, height: 635 }} />

      <div
        className="absolute"
        style={{ position: "absolute", left: 1320, top: 812, width: 1168, height: 786, background: COLORS.bezel, borderRadius: 10 }}
      />
      <div
        className="absolute"
        style={{ position: "absolute", left: 1350, top: 832, width: 1120, height: 734, background: "#000000" }}
      />
      <div
        className="flex relative overflow-hidden cursor-pointer"
        style={{ position: "absolute", left: 1405, top: 867, width: 1006, height: 635 }}
        onClick={() => setInfoPopup("stream")}
      >
        <video
          ref={streamVideo}
          src="/video/stream.mp4"
          poster="/img/stream.png"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: 1006, height: 635, maxWidth: "none", objectFit: "cover" }}
        />
      </div>
      <div
        className="absolute cursor-pointer"
        style={{
          position: "absolute",
          left: 1930,
          top: 1527,
          width: 0,
          height: 0,
          borderTop: "9px solid transparent",
          borderBottom: "9px solid transparent",
          borderLeft: `9px solid ${COLORS.glyph}`,
        }}
        onClick={() => streamVideo.current?.play()}
      />
      <div
        className="absolute cursor-pointer"
        style={{ position: "absolute", left: 1960, top: 1527, width: 6, height: 18, background: COLORS.glyph }}
        onClick={() => streamVideo.current?.pause()}
      />
      <div
        className="absolute cursor-pointer"
        style={{ position: "absolute", left: 1970, top: 1527, width: 6, height: 18, background: COLORS.glyph }}
        onClick={() => streamVideo.current?.pause()}
      />
      <div
        className="flex relative overflow-hidden"
        style={{ position: "absolute", left: 1999, top: 1514, width: 461, whiteSpace: "nowrap", fontFamily: "ChicagoKare, monospace", fontSize: 30, lineHeight: "44px", color: COLORS.text }}
      >
        <span>ANTICS BBS STREAMING 24/7</span>
      </div>

      <div
        className="flex relative flex-col"
        style={{ position: "absolute", left: 79, top: 1805, width: 815, whiteSpace: "nowrap", fontFamily: "HighTower, serif", fontSize: 23.8, lineHeight: "41.5px", color: "#f4f3f5" }}
      >
        <span>Plain language is not specialized language with easier words.</span>
        <span>It makes structure visible without needing to invent missing context.</span>
      </div>

      <div
        className="flex relative overflow-hidden cursor-pointer"
        style={{
          position: "absolute",
          left: 2412,
          top: 1792,
          width: 82,
          height: 82,
          borderRadius: 14,
          border: `2px solid ${COLORS.text}`,
        }}
        onClick={() => (user ? logout() : setAuthOpen(true))}
      >
        <img draggable={false} src="/img/avatar.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div
        className="flex relative cursor-pointer"
        style={{ position: "absolute", left: 2423, top: 1879, whiteSpace: "nowrap", fontFamily: "ChicagoKare, monospace", fontSize: 15.5, color: COLORS.text }}
        onClick={() => (user ? logout() : setAuthOpen(true))}
      >
        <span>{loading ? "" : user ? "[sign out]" : "[sign in]"}</span>
      </div>

      {infoPopup ? (
        <>
          <div
            className="absolute"
            style={{ position: "absolute", left: 0, top: 0, width: 2560, height: 1920, zIndex: 39 }}
            onClick={() => setInfoPopup(null)}
          />
          <div
            className="absolute"
            style={{
              position: "absolute",
              left: TIP_POS[infoPopup]?.x ?? 800,
              top: TIP_POS[infoPopup]?.y ?? 600,
              width: 480,
              zIndex: 40,
            }}
          >
            <InfoTip id={infoPopup} />
          </div>
        </>
      ) : null}
    </Stage>

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
    </>
  );
}
