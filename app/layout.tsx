import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { isIndexable, siteUrl, siteTitle, siteDescription, siteSchema } from "@/lib/site";

const ginger = localFont({ src: './fonts/RestartGinger-Medium.otf', variable: '--font-ginger', weight: '500', display: 'swap' });
const soft = localFont({ src: [{ path: './fonts/RestartSoft-Regular.otf', weight: '400' }, { path: './fonts/RestartSoft-Medium.otf', weight: '500' }], variable: '--font-soft', display: 'swap' });
const mono = localFont({ src: [{ path: './fonts/RaptorMono-Light.otf', weight: '300' }, { path: './fonts/RaptorMono-Regular.otf', weight: '400' }, { path: './fonts/RaptorMono-Bold.otf', weight: '700' }], variable: '--font-mono', display: 'swap' });

const socialImage = { url: "/social-preview.jpg", width: 1600, height: 934, alt: "Tesseral connects your brand knowledge, files, and tools in one shared brain." };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Tesseral",
  alternates: { canonical: "/" },
  robots: { index: isIndexable, follow: true, googleBot: { index: isIndexable, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", siteName: "Tesseral", url: "/", locale: "en_US", title: siteTitle, description: siteDescription, images: [socialImage] },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: [socialImage] },
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
      <body className="min-h-full flex flex-col"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, "\\u003c") }} />{children}</body>
    </html>
  );
}
