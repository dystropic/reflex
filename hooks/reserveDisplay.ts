import { COLORS } from "./theme";
import { ReserveTotals } from "../types/funding";

export interface ReserveRow {
  x: number;
  y: number;
  kind: "fund" | "stby";
  code: string | null;
}

export const RESERVE_ROWS: ReserveRow[] = [
  { x: 795, y: 1104, kind: "fund", code: "rc-00" },
  { x: 795, y: 1153, kind: "fund", code: "rc-01" },
  { x: 795, y: 1247, kind: "fund", code: "rc-02" },
  { x: 795, y: 1298, kind: "fund", code: "rc-03" },
  { x: 793, y: 1393, kind: "stby", code: "rc-04" },
  { x: 793, y: 1442, kind: "stby", code: "rc-05" },
  { x: 793, y: 1490, kind: "stby", code: "rc-06" },
  { x: 793, y: 1538, kind: "stby", code: "rc-07" },
];

export function rowDisplay(row: ReserveRow, totals: ReserveTotals) {
  if (row.kind === "fund") {
    const cents = row.code ? (totals[row.code] ?? 0) : 0;
    if (cents === 0) {
      return {
        value: row.code === "rc-00" ? "[ready]" : "[prefix]",
        color: COLORS.ready,
        thin: false,
      };
    }
    return { value: `[ ${(cents / 100).toFixed(2)} ]`, color: COLORS.yellow, thin: false };
  }
  return { value: "[STBY]", color: COLORS.stby, thin: true };
}
