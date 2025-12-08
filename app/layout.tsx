import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xandeum Node",
  description: "Real-time analytics for Xandeum pNode network",
  openGraph: {
    title: "Xandeum Node",
    description: "Real-time analytics for Xandeum pNode network",
    images: [
      {
        url: "/metadata.png",
        width: 1200,
        height: 630,
        alt: "Xandeum Node Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xandeum Node",
    description: "Real-time analytics for Xandeum pNode network",
    images: ["/metadata.png"],
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
