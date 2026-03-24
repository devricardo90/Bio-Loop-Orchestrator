import "./globals.css";
import type { ReactNode } from "react";
import { AuctionStoreProvider } from "../components/auction-store";
import { AppHeader } from "../components/app-header";
import { AuthSessionProvider } from "../components/auth-session";

export const metadata = {
  title: {
    default: "Bio Loop",
    template: "%s | Bio Loop"
  },
  description: "Buyer feed and auction workspace for surplus trading"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <AuctionStoreProvider>
            <AppHeader />
            {children}
          </AuctionStoreProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
