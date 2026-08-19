"use client";

import { useCallback, useEffect, useState } from "react";
import { MeUser } from "../types/account";

export const useMe = () => {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me");
    const data = await res.json().catch(() => null);
    setUser(data?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh };
};
