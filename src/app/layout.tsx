import "../../styles/global.css";
import { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";

export const metadata: Metadata = {
  title: "Tanglish Captions",
  description: "Get your captions in Tanglish",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="dc1b2df7-4965-44e5-845b-5f57306273b7" />

          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-R4Z5X7P392"
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-R4Z5X7P392');
            `}
          </Script>
        </head>
        <body>{children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
