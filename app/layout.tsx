import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CA Studyspace — Study better together",
  description: "The all-in-one study space for CA Foundation aspirants: progress tracking, Pomodoro sessions, shared notes, live rooms, discussions, and official ICAI papers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('ca-campus-theme')==='dark'?'dark':'light'}catch{document.documentElement.dataset.theme='light'}` }} /></head><body>{children}</body></html>;
}
