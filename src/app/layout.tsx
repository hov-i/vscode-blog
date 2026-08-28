import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { VSCodeLayout } from "@/widgets/layout/vscode-layout";
import { Analytics } from "@vercel/analytics/next";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blog · Hovi",
  description: "VSCode 기반 디자인 개발 블로그 입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Sidebar file tree data is fetched client-side (see VSCodeLayout),
            but that fetch only fires after hydration finishes — preloading it
            here lets the browser start the request as soon as the HTML is
            parsed, overlapping its network latency with hydration instead of
            adding it on top (was showing as a visible sidebar pop-in delay). */}
        <link rel="preload" href="/api/sidebar-data" as="fetch" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <VSCodeLayout>{children}</VSCodeLayout>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
