import Link from "next/link";
import type { Components } from "react-markdown";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  postLinks?: Record<string, number>;
}

const WIKILINK_TITLE = "__wikilink__";
const WIKILINK_DEAD_TITLE = "__wikilink_dead__";

export function preprocessWikiLinks(content: string, postLinks: Record<string, number>) {
  // [[target]] or [[target|alias]] — target은 포스트 제목, alias는 표시할 텍스트
  return content.replace(/\[\[([^\]\n|]+?)(?:\|([^\]\n]+?))?\]\]/g, (_, rawTarget, rawAlias) => {
    const target = rawTarget.trim();
    const display = (rawAlias ?? rawTarget).trim();
    const id = postLinks[target];
    const escapedDisplay = display.replace(/([\\\[\]])/g, "\\$1");
    if (id !== undefined) {
      return `[${escapedDisplay}](/posts/${id} "${WIKILINK_TITLE}")`;
    }
    return `[${escapedDisplay}](/posts?new=${encodeURIComponent(target)} "${WIKILINK_DEAD_TITLE}")`;
  });
}

// 서버/클라이언트 렌더러가 공유하는 커스텀 컴포넌트 스타일링
export const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="text-2xl sm:text-3xl font-bold mb-4 mt-6 text-[var(--text-editor)] border-b border-[var(--border-color)] pb-2 break-keep" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-xl sm:text-2xl font-bold mb-3 mt-5 text-[var(--text-editor)] break-keep" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-lg sm:text-xl font-bold mb-2 mt-4 text-[var(--text-editor)] break-keep" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="text-base sm:text-lg font-bold mb-2 mt-3 text-[var(--text-editor)] break-keep" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-4 text-[var(--text-editor)] leading-relaxed break-words" {...props} />
  ),
  a: ({ node, title, href, children, ...props }) => {
    if (title === WIKILINK_TITLE && href) {
      return (
        <Link
          href={href}
          className="text-[var(--accent)] font-medium border-b border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 px-0.5 rounded-sm transition-colors"
        >
          {children}
        </Link>
      );
    }
    if (title === WIKILINK_DEAD_TITLE && href) {
      return (
        <Link
          href={href}
          className="text-red-500 border-b border-dashed border-red-500/60 hover:bg-red-500/10 px-0.5 rounded-sm transition-colors"
          title="이 노트는 아직 작성되지 않았습니다"
        >
          {children}
        </Link>
      );
    }
    return (
      <a className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer" href={href} {...props}>
        {children}
      </a>
    );
  },
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside mb-4 text-[var(--text-editor)] space-y-1" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside mb-4 text-[var(--text-editor)] space-y-1" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="ml-4" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-[var(--accent)] pl-4 py-2 mb-4 text-[var(--text-secondary)] italic bg-[var(--bg-tertiary)]" {...props} />
  ),
  code: ({ node, className, children, ...props }: any) => {
    const isBlock = typeof className === "string" && className.startsWith("language-");
    if (!isBlock) {
      return (
        <code className="bg-[var(--bg-tertiary)] text-[var(--accent)] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => (
    <pre className="bg-[var(--vscode-code-bg)] border border-[var(--border-color)] rounded p-3 sm:p-4 mb-4 overflow-x-auto text-xs sm:text-sm" {...props} />
  ),
  img: ({ node, ...props }) => (
    <img className="max-w-full h-auto rounded my-4" {...props} alt={props.alt || ""} />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border border-[var(--border-color)]" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-[var(--bg-tertiary)]" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="border border-[var(--border-color)] px-4 py-2 text-left text-[var(--text-editor)] font-semibold" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="border border-[var(--border-color)] px-4 py-2 text-[var(--text-editor)]" {...props} />
  ),
  hr: ({ node, ...props }) => (
    <hr className="border-[var(--border-color)] my-6" {...props} />
  ),
};
