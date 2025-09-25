import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const font = Archivo({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ticksy",
  description:
    "Discover and book the best Movies, Events, and Sports in seconds. Seamless seat selection, instant confirmations, and unforgettable experiences - all in one place.",
  icons: ["/logo.png"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <NuqsAdapter>
        <TRPCReactProvider>
          <html lang="en">
            <body className={font.className}>
              <Toaster />
              {children}
            </body>
          </html>
        </TRPCReactProvider>
      </NuqsAdapter>
    </ClerkProvider>
  );
}
