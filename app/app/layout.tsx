import type { Metadata, Viewport } from "next";
import "./globals.css";
import BankProvider from "@/components/providers/BankProvider";

import BottomNav from "@/components/ui/BottomNav";
import VoiceButton from "@/components/ui/VoiceButton";
import ServiceWorkerRegistrar from "@/components/providers/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "My Bank",
  description: "Simple and easy banking for everyone",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Bank",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1B2A4A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <BankProvider>
          <ServiceWorkerRegistrar />
          <main className="flex-1">{children}</main>

          <VoiceButton />
          <BottomNav />
        </BankProvider>
      </body>
    </html>
  );
}
