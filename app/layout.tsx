import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ginger = localFont({ src: './fonts/RestartGinger-Medium.otf', variable: '--font-ginger', weight: '500', display: 'swap' });
const soft = localFont({ src: [{ path: './fonts/RestartSoft-Regular.otf', weight: '400' }, { path: './fonts/RestartSoft-Medium.otf', weight: '500' }], variable: '--font-soft', display: 'swap' });

export const metadata: Metadata = {
  title: "Tesseral — The creative studio of the future",
  description: "A living knowledge system for creative teams & brands. All in one place, always on, always learning, never leaving.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ginger.variable} ${soft.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
