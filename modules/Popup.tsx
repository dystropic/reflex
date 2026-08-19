"use client";

import { useEffect } from "react";
import { COLORS } from "../hooks/theme";

const STARS = [0, 1, 2, 3, 4, 5, 6];

export function Popup({
  title,
  onClose,
  width = 520,
  children,
}: {
  title: string;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="flex relative flex-row items-center justify-center"
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.82)" }}
      onClick={onClose}
    >
      <div
        className="flex relative flex-col"
        style={{
          width: `min(92vw, ${width}px)`,
          background: "#000000",
          border: `1px solid ${COLORS.yellow}`,
          padding: "14px 14px 10px 14px",
          gap: 12,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <span
          className="overflow-hidden whitespace-nowrap"
          style={{ fontFamily: "HighTower, serif", fontSize: 17, color: "#ebebeb", textAlign: "center", width: "100%" }}
        >
          {`* ~ * ~ ${title} ~ * ~ *`}
        </span>
        <div className="flex relative flex-row" style={{ gap: 14, minHeight: 200 }}>
          <div
            className="flex relative flex-col justify-between items-center"
            style={{ fontFamily: "HighTower, serif", fontSize: 17, color: "#ebebeb", width: 10 }}
          >
            {STARS.map((star) => (
              <span key={star}>*</span>
            ))}
          </div>
          <div
            className="popup-scroll flex relative flex-col flex-1"
            style={{ maxHeight: "64vh", overflowY: "auto", paddingRight: 6 }}
          >
            {children}
          </div>
          <div
            className="flex relative flex-col justify-between items-center"
            style={{ fontFamily: "HighTower, serif", fontSize: 17, color: "#ebebeb", width: 10 }}
          >
            {STARS.map((star) => (
              <span key={star}>*</span>
            ))}
          </div>
        </div>
        <span
          className="overflow-hidden whitespace-nowrap"
          style={{ fontFamily: "HighTower, serif", fontSize: 17, color: "#ebebeb" }}
        >
          {"* ~ ".repeat(60)}
        </span>
      </div>
    </div>
  );
}
