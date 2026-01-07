import { Skeleton } from "@/shared/ui/skeleton";

export default function PostDetailLoading() {
    return (
        <div className="max-w-4xl">
             <div className="mb-6 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Skeleton className="h-6 w-10 mr-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-10 w-3/4 mb-4" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2 mt-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>

            <div className="space-y-4 mb-12">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="space-y-6 pt-8 border-t border-[var(--border-color)]">
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
}
