"use client";

// 클라이언트 전용 렌더러 — 에디터 실시간 프리뷰, 챗 스트리밍처럼
// 브라우저에서 매 입력마다 다시 렌더해야 하는 곳에서만 사용할 것.
// 정적인 본문(게시물/프로젝트 상세)은 서버 렌더러(markdown-renderer.tsx)를 쓴다.
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import {
  markdownComponents,
  preprocessWikiLinks,
  type MarkdownRendererProps,
} from "./markdown-shared";

export function MarkdownRendererClient({ content, className = "", postLinks }: MarkdownRendererProps) {
  const processed = postLinks ? preprocessWikiLinks(content, postLinks) : content;

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={markdownComponents}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
