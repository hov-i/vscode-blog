import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { VSCodeLayout } from "@/widgets/layout/vscode-layout";
import { Analytics } from "@vercel/analytics/next";
import { getRecentPosts } from "@/shared/lib/services/post.service";
import { getProjects } from "@/shared/lib/services/project.service";
import { getTags } from "@/shared/lib/services/tag.service";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blog · Hovi",
  description: "VSCode 기반 디자인 개발 블로그 입니다.",
};

// The root layout fetches posts/projects/tags for the sidebar file tree on
// every render, so every route is already DB-dependent — force dynamic
// rendering so Next never tries to prerender pages at build time (Vercel's
// build machine can't reach the DB, only the deployed runtime can).
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const recentPosts = await getRecentPosts(50);
  const posts = recentPosts.filter((p) => p.published).map((p) => ({ id: p.id, title: p.title }));
  const allProjects = await getProjects();
  const projects = allProjects.map((p) => ({ id: p.id, title: p.title }));
  const allTags = await getTags();
  const tags = allTags.map((t) => ({ id: t.id, name: t.name }));

  return (
    <html lang="ko" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <VSCodeLayout posts={posts} projects={projects} tags={tags}>{children}</VSCodeLayout>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
