import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Bio Loop",
  description: "Bio-Loop-Orchestrator web scaffold"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
