"use client";

import { POPUPS } from "../hooks/popups";
import { COLORS } from "../hooks/theme";

const STARS = [0, 1, 2, 3, 4, 5, 6];

export function InfoTip({ id, scale = 1 }: { id: string; scale?: number }) {
  const def = POPUPS[id];
  if (!def) return null;
  const s = (v: number) => v * scale;
  return (
    <div
      className="flex relative flex-col"
      style={{
        width: "100%",
        height: s(360),
        background: "#000000",
        border: `1px solid ${COLORS.yellow}`,
        padding: `${s(14)}px ${s(12)}px ${s(10)}px ${s(12)}px`,
        gap: s(10),
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <span
        className="overflow-hidden whitespace-nowrap"
        style={{ fontFamily: "HighTower, serif", fontSize: s(24), color: "#ebebeb", textAlign: "center", width: "100%" }}
      >
        {`* ~ * ~ ${def.title} ~ * ~ *`}
      </span>
      <div className="flex relative flex-row flex-1" style={{ gap: s(14), minHeight: 0 }}>
        <div
          className="flex relative flex-col justify-between items-center"
          style={{ fontFamily: "HighTower, serif", fontSize: s(24), color: "#ebebeb", width: s(12) }}
        >
          {STARS.map((star) => (
            <span key={star}>*</span>
          ))}
        </div>
        <div className="flex relative flex-1" style={{ position: "relative", minWidth: 0 }}>
          <div
            className="popup-scroll flex relative flex-col flex-1"
            style={{ overflowY: "auto", gap: s(10), paddingRight: s(36) }}
          >
            {def.body.length === 0 ? (
              <span style={{ fontFamily: "HighTower, serif", fontSize: s(20), color: "#ebebeb", opacity: 0.45 }}>
                …
              </span>
            ) : (
              def.body.map((paragraph, index) => (
                <span
                  key={index}
                  style={{
                    fontFamily: "HighTower, serif",
                    fontSize: s(20),
                    lineHeight: `${s(28)}px`,
                    color: "#ebebeb",
                    textAlign: paragraph.startsWith("\"Guhmorfloping") ? "left" : "right",
                  }}
                >
                  {paragraph}
                </span>
              ))
            )}
          </div>
          <div
            className="flex relative flex-col justify-between items-center"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: s(14),
              width: s(12),
              pointerEvents: "none",
              fontFamily: "HighTower, serif",
              fontSize: s(24),
              color: "#ebebeb",
            }}
          >
            {STARS.map((star) => (
              <span key={star}>*</span>
            ))}
          </div>
        </div>
      </div>
      <span
        className="overflow-hidden whitespace-nowrap"
        style={{ fontFamily: "HighTower, serif", fontSize: s(24), color: "#ebebeb" }}
      >
        {"* ~ ".repeat(40)}
      </span>
    </div>
  );
}
