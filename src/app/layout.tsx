import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { WhiteLabelProvider } from "@/hooks/useWhiteLabel";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-script" });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "GRAMMAR — Circuit Box",
  description: "ACHIEVEMOR's API-first, vision-first action runtime. Governed multi-role agent orchestration.",
  keywords: ["GRAMMAR", "ACHIEVEMOR", "ACHEEVY", "AI Orchestration", "Agent Runtime"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${caveat.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), var(--font-geist-sans), system-ui, sans-serif" }}
      >
        <WhiteLabelProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </WhiteLabelProvider>
      </body>
    </html>
  );
}
