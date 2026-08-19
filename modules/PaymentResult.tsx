"use client";

import { COLORS } from "../hooks/theme";
import { Popup } from "./Popup";

export interface PayResultData {
  ok: boolean;
  lines: string[];
}

export function PaymentResult({
  result,
  onClose,
}: {
  result: PayResultData;
  onClose: () => void;
}) {
  return (
    <Popup title="RCA RESERVE" onClose={onClose} width={460}>
      <div className="flex relative flex-col" style={{ gap: 10, padding: "6px 4px" }}>
        {result.lines.map((line, index) => (
          <span
            key={index}
            style={{
              fontFamily: "IosevkaDiamond, monospace",
              fontSize: index === 0 ? 14 : 13,
              color: index === 0 ? (result.ok ? COLORS.ready : COLORS.err) : COLORS.reserve,
            }}
          >
            {line}
          </span>
        ))}
        <span
          className="cursor-pointer"
          style={{ fontFamily: "ChicagoKare, monospace", fontSize: 13, color: COLORS.green, marginTop: 6 }}
          onClick={onClose}
        >
          [back to reserves]
        </span>
      </div>
    </Popup>
  );
}
