import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center mb-4">
                <Skeleton className="h-6 w-16 mr-4" />
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-4 pt-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
}
