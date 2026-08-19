"use client";

import { formatUsd } from "../hooks/coins";
import { StripeReturnResult } from "../hooks/useStripeReturn";
import { PaymentResult } from "./PaymentResult";

export function StripeResult({
  result,
  onClose,
}: {
  result: StripeReturnResult;
  onClose: () => void;
}) {
  const lines = result.ok
    ? [
        "payment confirmed ✓",
        `paid ${formatUsd(result.cents)} via card (Stripe)`,
        `${result.code} funded ${formatUsd(result.totalCents)} total`,
      ]
    : ["stripe never confirmed that · nothing was recorded"];
  return <PaymentResult result={{ ok: result.ok, lines }} onClose={onClose} />;
}
