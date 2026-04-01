import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "../components/LayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PromptForge | AI Prompt Studio",
  description: "High-fidelity minimalist orchestration for professional prompt engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden relative" suppressHydrationWarning>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
