import "../../styles/global.css";
import { Metadata, } from "next";
import { ClerkProvider } from '@clerk/nextjs';


export const metadata: Metadata = {
  title: "Tanglish Captions",
  description: "Get your captions in Tanglish",
};

// export const viewport: Viewport = {
//   width: "device-width",
//   initialScale: 1,
//   maximumScale: 1,
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
