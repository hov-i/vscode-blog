import { Skeleton, PostItemSkeleton } from "@/shared/ui/skeleton";

export default function PostsLoading() {
    return (
        <div className="max-w-4xl">
             <div className="mb-8">
                <div className="flex items-center mb-4">
                    <Skeleton className="h-6 w-12 mr-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>

            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <PostItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
