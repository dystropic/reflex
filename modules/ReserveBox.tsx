"use client";

import { useRef, useState } from "react";
import { ATTACK_LINES, REPRISE_LINES, RESERVE_DOCS, REVERB_LINES, ReserveSeg } from "../hooks/reserveContent";
import { COLORS } from "../hooks/theme";
import { ReserveLast } from "../types/funding";
import { Constraint } from "../types/reflex";
import { ReserveFundingForm } from "./ReserveFundingForm";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const EXPLORERS: Record<number, string> = {
  1: "https://etherscan.io/tx/",
  137: "https://polygonscan.com/tx/",
  8453: "https://basescan.org/tx/",
  42161: "https://arbiscan.io/tx/",
};

const explorerUrl = (last: ReserveLast) => {
  if (last.method !== "coin" || !last.txHash || last.chainId === null) return null;
  const base = EXPLORERS[last.chainId];
  return base ? `${base}${last.txHash}` : null;
};

const segColor = (seg: ReserveSeg) => {
  if (seg.c === "gray") return COLORS.dim;
  if (seg.c === "cyan") return COLORS.cyan;
  if (seg.c === "yellow") return COLORS.yellow;
  return COLORS.text;
};

function LinkArrow({ onClick }: { onClick?: () => void }) {
  return (
    <span className="cursor-pointer whitespace-nowrap" onClick={onClick}>
      <span style={{ color: COLORS.text }}>[</span>
      <span style={{ color: COLORS.err }}>↗</span>
      <span style={{ color: COLORS.text }}>]</span>
    </span>
  );
}

const lastLabel = (last: ReserveLast) => {
  const d = new Date(last.createdAt);
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `$${(last.cents / 100).toFixed(2)} · ${last.method} · ${dd} ${MONTHS[d.getMonth()]} ${hh}:${mm}`;
};

export function ReserveBox({
  constraint,
  fundedCents,
  receipts,
  signedIn,
  scale,
  onClose,
  onRequireAuth,
  onFunded,
  onPaid,
}: {
  constraint: Constraint;
  fundedCents: number;
  receipts: ReserveLast[];
  signedIn: boolean;
  scale: number;
  onClose: () => void;
  onRequireAuth: () => void;
  onFunded: () => void;
  onPaid: (lines: string[]) => void;
}) {
  const s = (v: number) => v * scale;
  const doc = RESERVE_DOCS[constraint.code] ?? { subtitle: "", sections: [] };
  const [docOpen, setDocOpen] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({ attractors: true, props: true });
  const [view, setView] = useState<"doc" | "reprise" | "reverb" | "attack">("doc");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bufferRef = useRef<HTMLDivElement | null>(null);
  const receiptsRef = useRef<HTMLDivElement | null>(null);
  const hasReceipts = signedIn && receipts.length > 0;

  const animateScroll = (target: number) => {
    const sc = scrollRef.current;
    if (!sc) return;
    const start = sc.scrollTop;
    const delta = target - start;
    const t0 = performance.now();
    const dur = 350;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      sc.scrollTop = start + delta * e;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const targetTop = (el: HTMLElement) => {
    const sc = scrollRef.current;
    if (!sc) return 0;
    const ratio = sc.getBoundingClientRect().height / sc.clientHeight || 1;
    return sc.scrollTop + (el.getBoundingClientRect().top - sc.getBoundingClientRect().top) / ratio;
  };

  const scrollToBuffer = () => {
    if (bufferRef.current) animateScroll(targetTop(bufferRef.current));
  };

  const scrollToReceipts = () => {
    if (receiptsRef.current) {
      animateScroll(targetTop(receiptsRef.current));
    } else if (scrollRef.current) {
      animateScroll(scrollRef.current.scrollHeight);
    }
  };
  const stateLabel =
    fundedCents > 0
      ? `= ${(fundedCents / 100).toFixed(2)} =`
      : constraint.code === "rc-00"
        ? "=ready="
        : "=prefix=";
  const ht = (size: number, color: string): React.CSSProperties => ({
    fontFamily: "HighTower, serif",
    fontSize: s(size),
    color,
  });
  const arrow = (isOpen: boolean) => (
    <span style={{ fontSize: s(13), color: COLORS.dim, marginRight: s(8) }}>
      {isOpen ? "▽" : "▷"}
    </span>
  );

  const segSpan = (seg: ReserveSeg, segIndex: number) => (
    <span
      key={segIndex}
      className={seg.href || seg.action ? "cursor-pointer" : undefined}
      style={{ color: segColor(seg) }}
      onClick={
        seg.href || seg.action
          ? (event) => {
              event.stopPropagation();
              if (seg.action) {
                setView(seg.action);
              } else if (seg.href) {
                window.open(seg.href, "_blank", "noopener");
              }
            }
          : undefined
      }
    >
      {seg.t}
    </span>
  );

  if (view !== "doc") {
    const overlayLines =
      view === "reprise" ? REPRISE_LINES : view === "reverb" ? REVERB_LINES : ATTACK_LINES;
    const overlayTitle =
      view === "reprise" ? "% reprise %" : view === "reverb" ? "% reverb %" : "% attack %";
    const overlayBack =
      view === "reprise" ? () => setView("doc") : () => setView("reprise");
    return (
      <div
        className="flex relative flex-col"
        style={{
          width: s(382),
          height: s(470),
          background: "#000000",
          border: "1px solid #ffffff",
        }}
      >
        <div className="flex relative flex-row items-baseline justify-between" style={{ padding: `${s(13)}px ${s(10)}px 0 ${s(10)}px` }}>
          <span className="whitespace-nowrap" style={ht(24, COLORS.text)}>
            {overlayTitle}
          </span>
          <span
            className="whitespace-nowrap cursor-pointer"
            style={ht(21.3, COLORS.cyan)}
            onClick={overlayBack}
          >
            [b]  back
          </span>
        </div>
        <div
          className="popup-scroll"
          style={{
            margin: `${s(16)}px ${s(12)}px ${s(12)}px ${s(12)}px`,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            fontFamily: "HighTower, serif",
            fontSize: s(21.3),
            lineHeight: `${s(30)}px`,
            color: COLORS.text,
            paddingBottom: s(30),
          }}
        >
          {overlayLines.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap" style={{ marginBottom: s(14) }}>
              {line.map(segSpan)}
            </div>
          ))}
        </div>
        <div
          className="flex relative flex-row items-center justify-between"
          style={{ height: s(36), background: "#0dcaf2", padding: `0 ${s(11)}px` }}
        >
          <span style={{ ...ht(21.3, "#000000"), textShadow: "1px 1px 0 #00e1df" }}>
            {"reservations > "}
          </span>
          <span style={{ ...ht(21.3, "#000000"), textShadow: "1px 1px 0 #00e1df" }}>
            {"receipts >"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex relative flex-col"
      style={{
        width: s(382),
        height: s(470),
        background: "#000000",
        border: "1px solid #ffffff",
      }}
    >
      <div className="flex relative flex-row items-baseline justify-between" style={{ padding: `${s(13)}px ${s(10)}px 0 ${s(10)}px` }}>
        <span className="whitespace-nowrap" style={ht(24, COLORS.text)}>
          {`% reserves ${constraint.code} %`}
        </span>
        <span className="whitespace-nowrap cursor-pointer" style={ht(21.3, COLORS.cyan)} onClick={onClose}>
          [b]  back
        </span>
      </div>
      <div className="flex relative flex-row items-baseline justify-between" style={{ padding: `${s(28)}px ${s(10)}px 0 ${s(10)}px` }}>
        <span
          className="whitespace-nowrap cursor-pointer"
          style={ht(21.3, COLORS.yellow)}
          onClick={() => setDocOpen((v) => !v)}
        >
          {arrow(docOpen)}
          {`[${constraint.name}]`}
        </span>
        <span className="whitespace-nowrap" style={ht(21.3, COLORS.text)}>
          {stateLabel}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="popup-scroll"
        style={{
          margin: `${s(16)}px ${s(12)}px ${s(12)}px ${s(12)}px`,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          fontFamily: "HighTower, serif",
          fontSize: s(21.3),
          lineHeight: `${s(30)}px`,
          color: COLORS.text,
          paddingBottom: s(60),
        }}
      >
        {docOpen ? (
          <>
            {doc.subtitle ? (
              <div style={{ textAlign: "center", marginBottom: s(16) }}>
                {doc.subtitle}{" "}
                {doc.link ? (
                  <LinkArrow onClick={() => window.open(doc.link, "_blank", "noopener")} />
                ) : null}
              </div>
            ) : null}
            {doc.sections.length === 0 ? (
              <div style={{ color: COLORS.dim, opacity: 0.6 }}>…</div>
            ) : (
              doc.sections.map((section) => {
                const isOpen = !!open[section.id];
                return (
                  <div key={section.id} style={{ marginBottom: s(10) }}>
                    <div
                      className="cursor-pointer"
                      style={{ marginBottom: isOpen ? s(14) : 0 }}
                      onClick={() => setOpen((v) => ({ ...v, [section.id]: !v[section.id] }))}
                    >
                      {arrow(isOpen)}
                      {section.header.map((seg, segIndex) => (
                        <span key={segIndex} style={{ color: segColor(seg) }}>
                          {seg.t}
                        </span>
                      ))}
                    </div>
                    {isOpen
                      ? section.lines.map((line, index) =>
                          line.length === 0 ? (
                            <div key={index} style={{ height: s(30) }} />
                          ) : (
                            <div
                              key={index}
                              className="whitespace-pre-wrap"
                              style={{ paddingLeft: s(21), marginBottom: s(14) }}
                            >
                              {line.map(segSpan)}
                            </div>
                          ),
                        )
                      : null}
                  </div>
                );
              })
            )}
          </>
        ) : null}
        <div
          ref={bufferRef}
          className="cursor-pointer"
          style={{ color: COLORS.green, marginTop: docOpen ? s(50) : 0 }}
          onClick={scrollToBuffer}
        >
          [ reserve a buffer ]
        </div>
        <ReserveFundingForm
          constraint={constraint}
          signedIn={signedIn}
          scale={scale}
          onRequireAuth={onRequireAuth}
          onFunded={onFunded}
          onSuccess={onPaid}
        />
        {hasReceipts ? (
          <>
            <div ref={receiptsRef} style={{ marginTop: s(30) }}>receipts:</div>
            {receipts.map((receipt, index) => (
              <div key={index} className="flex relative flex-row justify-between">
                <span>{lastLabel(receipt)}</span>
                {receipt.method === "coin" ? (
                  <LinkArrow
                    onClick={() => {
                      const url = explorerUrl(receipt);
                      if (url) window.open(url, "_blank", "noopener");
                    }}
                  />
                ) : null}
              </div>
            ))}
          </>
        ) : null}
      </div>
      <div
        className="flex relative flex-row items-center justify-between"
        style={{ height: s(36), background: "#0dcaf2", padding: `0 ${s(11)}px` }}
      >
        <span
          className="cursor-pointer"
          style={{ ...ht(21.3, "#000000"), textShadow: "1px 1px 0 #00e1df" }}
          onClick={scrollToBuffer}
        >
          {"reservations > "}
        </span>
        <span
          className={hasReceipts ? "cursor-pointer" : ""}
          style={{
            ...ht(21.3, "#000000"),
            textShadow: "1px 1px 0 #00e1df",
            opacity: hasReceipts ? 1 : 0.35,
          }}
          onClick={hasReceipts ? scrollToReceipts : undefined}
        >
          {"receipts >"}
        </span>
      </div>
    </div>
  );
}
