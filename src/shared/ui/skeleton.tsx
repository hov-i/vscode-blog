import { cn } from "@/shared/lib/utils";

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded bg-[var(--bg-tertiary)]", className)}
      {...props}
    />
  );
};

export const PostItemSkeleton = () => (
    <div className="p-4 rounded bg-[var(--bg-secondary)] border border-transparent">
        <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-3 w-full mb-2" />
        <div className="flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
        </div>
    </div>
);

export const ProjectItemSkeleton = () => (
    <div className="p-4 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] h-full">
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-3 w-full mb-4" />
        <div className="flex gap-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-10" />
        </div>
    </div>
);
