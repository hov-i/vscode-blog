"use client";

import { Icon, IconKey } from "@/shared/ui/icon";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";

const SEGMENT_ICON: Record<string, IconKey> = {
  posts: "posts",
  projects: "folder",
  tags: "tags",
  about: "user",
  guestbook: "messageSquare",
  admin: "settings",
  auth: "logIn",
};

const formatSegment = (segment: string, isLast: boolean, parent?: string): string => {
  const decoded = decodeURIComponent(segment);
  if (!isLast) return decoded;

  switch (parent) {
    case "posts":
      return `${decoded}.md`;
    case "projects":
      return `${decoded}.json`;
    case "tags":
      return `${decoded}.json`;
    default:
      return decoded;
  }
};

export const BreadcrumbBar = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 2) return null;

  return (
    <div
      id="breadcrumb-bar"
      className="flex items-center h-7 px-4 text-xs bg-[var(--bg-primary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] overflow-x-auto"
    >
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const parent = index > 0 ? segments[index - 1] : undefined;
        const href = "/" + segments.slice(0, index + 1).join("/");
        const rootIcon = index === 0 ? SEGMENT_ICON[segment] : undefined;

        return (
          <Fragment key={href}>
            {index > 0 && (
              <Icon name="chevronRight" className="w-3 h-3 mx-1 shrink-0 opacity-60" />
            )}
            {rootIcon && (
              <Icon name={rootIcon} className="w-3 h-3 mr-1 shrink-0" />
            )}
            {isLast ? (
              <span className="text-[var(--text-primary)] whitespace-nowrap">
                {formatSegment(segment, isLast, parent)}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
              >
                {formatSegment(segment, isLast, parent)}
              </Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
