import type { Metadata } from "next";
import { Fredoka, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://smartrivals.app",
  ),
  title: {
    default: "SmartRivals",
    template: "%s — SmartRivals",
  },
  description:
    "Plateforme de quiz compétitif quotidien et multijoueur : QCM, échecs, logique et culture générale.",
  openGraph: {
    siteName: "SmartRivals",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} ${fredoka.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* Prevent white flash: apply dark class before first paint */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
