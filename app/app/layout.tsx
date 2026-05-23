import type { Metadata, Viewport } from "next";
import "./globals.css";
import BankProvider from "@/components/providers/BankProvider";
import ServiceWorkerRegistrar from "@/components/providers/ServiceWorkerRegistrar";
import SpeechChatShell from "@/components/speech/SpeechChatShell";
import { Suspense } from "react";

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
        <Suspense>
          <BankProvider>
            <ServiceWorkerRegistrar />
            <SpeechChatShell>
              <main className="flex-1 pb-20">{children}</main>
            </SpeechChatShell>
          </BankProvider>
        </Suspense>
      </body>
    </html>
  );
}
