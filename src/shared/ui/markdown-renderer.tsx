"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 커스텀 컴포넌트 스타일링
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mb-4 mt-6 text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mb-3 mt-5 text-[var(--text-primary)]" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold mb-2 mt-4 text-[var(--text-primary)]" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-bold mb-2 mt-3 text-[var(--text-primary)]" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-[var(--text-primary)] leading-relaxed" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-[var(--accent)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 text-[var(--text-primary)] space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 text-[var(--text-primary)] space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-[var(--accent)] pl-4 py-2 mb-4 text-[var(--text-secondary)] italic bg-[var(--bg-tertiary)]" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="bg-[var(--bg-tertiary)] text-[var(--accent)] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} block`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="bg-[#1e1e1e] rounded p-4 mb-4 overflow-x-auto" {...props} />
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
            <th className="border border-[var(--border-color)] px-4 py-2 text-left text-[var(--text-primary)] font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-[var(--border-color)] px-4 py-2 text-[var(--text-primary)]" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-[var(--border-color)] my-6" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
