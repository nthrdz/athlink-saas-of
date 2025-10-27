import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConditionalNavbar } from "@/components/ConditionalNavbar";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Athlink - Le Profil Digital des Athlètes",
  description: "Partage tes performances, trouve des sponsors, développe ta communauté. Le link-in-bio conçu pour les sportifs.",
  keywords: ["athlète", "running", "cyclisme", "triathlon", "link-in-bio", "sponsor", "performance"],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ConditionalNavbar />
        {children}
        <Toaster position="top-center" richColors />
        
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17677472722"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17677472722');
          `}
        </Script>
        
        <Script
          src="https://cdn.iubenda.com/iubenda.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
