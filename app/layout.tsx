import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ginger = localFont({ src: './fonts/RestartGinger-Medium.otf', variable: '--font-ginger', weight: '500', display: 'swap' });
const soft = localFont({ src: [{ path: './fonts/RestartSoft-Regular.otf', weight: '400' }, { path: './fonts/RestartSoft-Medium.otf', weight: '500' }], variable: '--font-soft', display: 'swap' });
const mono = localFont({ src: [{ path: './fonts/RaptorMono-Light.otf', weight: '300' }, { path: './fonts/RaptorMono-Regular.otf', weight: '400' }, { path: './fonts/RaptorMono-Bold.otf', weight: '700' }], variable: '--font-mono', display: 'swap' });

const title = "Tesseral — A shared brain for your clients and brand";
const description = "Bring files, links, and brand knowledge into one shared brain. Ask questions, develop ideas, and give your team and AI tools up-to-date context.";
const socialImage = { url: "/social-preview.jpg", width: 1600, height: 934, alt: "Tesseral connects your brand knowledge, files, and tools in one shared brain." };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tesseral-website-staging.vercel.app"),
  title,
  description,
  openGraph: { type: "website", siteName: "Tesseral", title, description, images: [socialImage] },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ginger.variable} ${soft.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
