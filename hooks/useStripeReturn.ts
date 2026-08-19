"use client";

import { useEffect, useState } from "react";

export interface StripeReturnResult {
  ok: boolean;
  code: string;
  totalCents: number;
  cents: number;
}

export const useStripeReturn = (onFunded: () => void) => {
  const [result, setResult] = useState<StripeReturnResult | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rs = params.get("rs");
    const sessionId = params.get("session_id");
    if (rs === null) return;
    window.history.replaceState(null, "", window.location.pathname);
    if (rs !== "1" || !sessionId) return;
    (async () => {
      const res = await fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setResult({ ok: true, code: data.code, totalCents: data.totalCents, cents: data.cents });
        onFunded();
      } else {
        setResult({ ok: false, code: "", totalCents: 0, cents: 0 });
      }
    })();
  }, [onFunded]);

  return { result, clear: () => setResult(null) };
};
