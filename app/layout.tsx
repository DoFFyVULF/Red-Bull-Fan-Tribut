import type { Metadata, Viewport } from "next";
import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "../components/ui/toaster";

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-rb",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "RED BULL — Gives You Wiiings | Unofficial Fan Tribute",
  description:
    "An unofficial cinematic fan tribute to Red Bull — the 250 ml can under the microscope and the Oracle Red Bull Racing RB22 in the wind tunnel. Gives you wiiings.",
  keywords: [
    "Red Bull",
    "energy drink",
    "Formula 1",
    "Oracle Red Bull Racing",
    "RB22",
    "Verstappen",
    "Hadjar",
    "Red Bull Ring",
    "fan site",
  ],
  authors: [{ name: "Fan Tribute Project" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "RED BULL — Gives You Wiiings",
    description:
      "Cinematic fan tribute: the can, the ingredients, the RB22 and the bulls behind the visor.",
    siteName: "Red Bull Fan Tribute",
    type: "website",
    images: [{ url: "/images/f1-car-track.jpg", width: 1920, height: 960 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RED BULL — Gives You Wiiings",
    description:
      "Cinematic fan tribute: the can, the ingredients, the RB22 and the bulls behind the visor.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0E27",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-rb-carbon text-rb-ice selection:bg-rb-red selection:text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
