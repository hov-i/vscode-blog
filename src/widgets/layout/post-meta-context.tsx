"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type PostMeta = { path: string; wordCount: number };

const PostMetaContext = createContext<{
  meta: PostMeta | null;
  setMeta: (meta: PostMeta | null) => void;
} | null>(null);

export function PostMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<PostMeta | null>(null);
  return <PostMetaContext.Provider value={{ meta, setMeta }}>{children}</PostMetaContext.Provider>;
}

export function usePostMeta(): PostMeta | null {
  const ctx = useContext(PostMetaContext);
  if (!ctx) throw new Error("usePostMeta must be used within PostMetaProvider");
  return ctx.meta;
}

export function useSetPostMeta(): (meta: PostMeta | null) => void {
  const ctx = useContext(PostMetaContext);
  if (!ctx) throw new Error("useSetPostMeta must be used within PostMetaProvider");
  return ctx.setMeta;
}
