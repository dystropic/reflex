import { Suspense } from "react";
import { ResetPassword } from "../../modules/ResetPassword";

export default function ResetPage() {
  return (
    <div className="flex relative flex-col items-center justify-center" style={{ minHeight: "100vh", background: "#000000" }}>
      <Suspense>
        <ResetPassword />
      </Suspense>
    </div>
  );
}
