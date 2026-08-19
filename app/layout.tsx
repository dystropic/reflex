import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import "./globals.css";
import { getConfig } from "../hooks/wagmi";
import { Providers } from "../modules/Providers";

export const metadata: Metadata = {
  title: "REFLEX",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get("cookie"),
  );
  return (
    <html lang="en">
      <body>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
