import { Suspense } from "react";
import { VerifyEmail } from "../../modules/VerifyEmail";

export default function VerifyPage() {
  return (
    <div className="flex relative flex-col items-center justify-center" style={{ minHeight: "100vh", background: "#000000" }}>
      <Suspense>
        <VerifyEmail />
      </Suspense>
    </div>
  );
}
