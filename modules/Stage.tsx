"use client";

import { STAGE_H, STAGE_W, useStageScale } from "../hooks/useStageScale";
import { COLORS } from "../hooks/theme";

export function Stage({ children }: { children: React.ReactNode }) {
  const scale = useStageScale();
  if (scale === 0) {
    return <div className="flex relative w-full" style={{ background: COLORS.bg, height: "100vh" }} />;
  }
  return (
    <div
      className="flex relative w-full overflow-hidden"
      style={{ height: (STAGE_H + 120) * scale, background: COLORS.bg }}
    >
      <div
        className="flex relative"
        style={{
          width: STAGE_W,
          minWidth: STAGE_W,
          flexShrink: 0,
          height: STAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          background: COLORS.bg,
        }}
      >
        {children}
      </div>
    </div>
  );
}
