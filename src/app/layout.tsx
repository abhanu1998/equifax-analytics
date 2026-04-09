import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const primaryFont = Plus_Jakarta_Sans({
  variable: "--font-primary",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voicing AI Dashboard",
  description: "Premium analytics dashboard for Equifax voice intelligence",
  icons: {
    icon: "/equifax-favicon.ico",
    shortcut: "/equifax-favicon.ico",
    apple: "/equifax-favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${primaryFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#06080f] font-sans text-neutral-100">
        {children}
      </body>
    </html>
  );
}
