import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://michael-project.vercel.app"),
  applicationName: "AI Automation Diagnostic",
  title: {
    default: "AI Automation Diagnostic",
    template: "%s · AI Automation Diagnostic",
  },
  description:
    "Дізнайся за 5 хвилин, що у твоєму бізнесі можна автоматизувати за допомогою AI.",
  openGraph: {
    title: "AI Automation Diagnostic",
    description:
      "Дізнайся за 5 хвилин, що у твоєму бізнесі можна автоматизувати за допомогою AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
