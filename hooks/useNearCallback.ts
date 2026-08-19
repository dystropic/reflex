"use client";

import { useEffect } from "react";

export const useNearCallback = (onDone: () => void) => {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const accountId = params.get("accountId");
    const publicKey = params.get("publicKey");
    const signature = params.get("signature");
    const stored = localStorage.getItem("rca_near_auth");
    if (!accountId || !publicKey || !signature || !stored) return;
    let key = "";
    let callbackUrl = "";
    try {
      const parsed = JSON.parse(stored);
      key = parsed.key ?? "";
      callbackUrl = parsed.callbackUrl ?? "";
    } catch {
      return;
    }
    localStorage.removeItem("rca_near_auth");
    window.history.replaceState(null, "", window.location.pathname);
    (async () => {
      const res = await fetch("/api/auth/near", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, accountId, publicKey, signature, callbackUrl }),
      });
      if (res.ok) onDone();
    })();
  }, [onDone]);
};
