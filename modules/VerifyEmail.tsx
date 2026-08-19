"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { COLORS } from "../hooks/theme";

export function VerifyEmail() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (!token || fired.current) return;
    fired.current = true;
    (async () => {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/"), 1400);
      } else {
        setError(data?.error ?? "that did not go through");
      }
    })();
  }, [token, router]);

  const message = !token
    ? "no token here · use the link from your email"
    : error
      ? error
      : done
        ? "verified · stepping in"
        : "checking the link…";
  const color = error ? COLORS.err : done ? COLORS.green : COLORS.dim;

  return (
    <span className="flex relative" style={{ fontFamily: "ChicagoKare, monospace", fontSize: 14, color }}>
      {message}
    </span>
  );
}
