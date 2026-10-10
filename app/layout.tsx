import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CA Studyspace — Study better together",
    template: "%s | CA Studyspace",
  },
  description: "The all-in-one study space for CA Foundation aspirants: progress tracking, Pomodoro sessions, shared notes, live rooms, discussions, and official ICAI papers.",
  applicationName: "CA Studyspace",
  keywords: ["CA Foundation", "CA study app", "ICAI papers", "CA notes", "Pomodoro", "CA aspirants"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "CA Studyspace",
    title: "CA Studyspace — Study better together",
    description: "Plan your CA Foundation preparation, track progress, focus with Pomodoro sessions, share notes, and study with other aspirants.",
  },
  twitter: {
    card: "summary",
    title: "CA Studyspace — Study better together",
    description: "One focused space for CA Foundation preparation, notes, progress, discussions, and official ICAI papers.",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CA Studyspace",
    alternateName: "CA Study Space",
    url: siteUrl,
    description: metadata.description,
  };

  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('ca-campus-theme')==='dark'?'dark':'light'}catch{document.documentElement.dataset.theme='light'}` }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData).replace(/</g, "\\u003c") }} /></head><body>{children}</body></html>;
}
