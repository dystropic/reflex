"use client";

import { useCallback, useEffect, useState } from "react";
import { ReserveHistoryMap, ReserveTotals } from "../types/funding";

export const useReserves = (userId: string | null) => {
  const [totals, setTotals] = useState<ReserveTotals>({});
  const [history, setHistory] = useState<ReserveHistoryMap>({});

  const refresh = useCallback(async () => {
    const res = await fetch("/api/reserves");
    const data = await res.json().catch(() => null);
    setTotals(data?.totals ?? {});
    setHistory(data?.history ?? {});
  }, []);

  useEffect(() => {
    if (!userId) {
      setTotals({});
      setHistory({});
      return;
    }
    refresh();
  }, [userId, refresh]);

  return { totals, history, refresh };
};
