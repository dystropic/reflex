import "server-only";

let cached: { usd: number; at: number } | null = null;

export const nearPriceUsd = async () => {
  if (cached && Date.now() - cached.at < 60_000) return cached.usd;
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd",
    { cache: "no-store" },
  );
  const data = await res.json().catch(() => null);
  const usd = data?.near?.usd;
  if (typeof usd !== "number" || usd <= 0) {
    if (cached) return cached.usd;
    throw new Error("near price unavailable");
  }
  cached = { usd, at: Date.now() };
  return usd;
};
