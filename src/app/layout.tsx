import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ToastProvider } from "@/components/ui/toast";
import { MSWInit } from "./msw-init";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Hub",
  description: "A comprehensive productivity platform for personal organization",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable || ''} ${geistMono.variable || ''} antialiased`}
        suppressHydrationWarning
      >
        <MSWInit />
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider initialLocale={locale as 'ja' | 'en'}>
            <ThemeProvider>
              <QueryProvider>
                <AuthProvider>
                  {children}
                  <ToastProvider />
                </AuthProvider>
              </QueryProvider>
            </ThemeProvider>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
