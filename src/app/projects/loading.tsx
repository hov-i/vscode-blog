import { Skeleton, ProjectItemSkeleton } from "@/shared/ui/skeleton";

export default function ProjectsLoading() {
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
                <Skeleton className="h-4 w-full max-w-lg mb-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <ProjectItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
