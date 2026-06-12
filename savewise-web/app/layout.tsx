import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import StoreProvider from "./auth/StoreProvider";
import SessionWrapper from "./auth/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaveWise",
  description: "Smart budgeting and savings tracker",
};

const theme = createTheme({});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <SessionWrapper>
            <MantineProvider theme={theme}>
              {children}
            </MantineProvider>
          </SessionWrapper>
        </StoreProvider>
      </body>
    </html>
  );
}
