import type { Metadata } from "next";

import { EnsureAuth } from "@/components/firebase";

import "./globals.css";

export const metadata: Metadata = {
  title: "draftcode-photolog",
};

export default function RootLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  return (
    <html lang="ja">
      <body>
        <EnsureAuth>{children}</EnsureAuth>
      </body>
    </html>
  );
}
