import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { VSCodeLayout } from "@/widgets/layout/vscode-layout";

import { getPostCount } from "@/shared/lib/services/post.service";
import { getProjectCount } from "@/shared/lib/services/project.service";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "hov_i.log",
  description: "VSCode 기반 디자인 개발 블로그 입니다.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const postCount = await getPostCount();
  const projectCount = await getProjectCount();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jetbrainsMono.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <VSCodeLayout postCount={postCount} projectCount={projectCount}>
            {children}
          </VSCodeLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
