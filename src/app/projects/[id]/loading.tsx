import { Skeleton } from "@/shared/ui/skeleton";

export default function ProjectDetailLoading() {
    return (
        <div className="max-w-4xl">
             <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-4 w-32" />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                     <Skeleton className="h-8 w-48" />
                    <div className="flex gap-3">
                         <Skeleton className="h-8 w-20" />
                         <Skeleton className="h-8 w-20" />
                    </div>
                </div>

                <div className="border border-[var(--border-color)] rounded bg-[var(--bg-secondary)] overflow-hidden">
                    <div className="px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between">
                         <Skeleton className="h-4 w-48" />
                         <Skeleton className="h-4 w-24" />
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                             <Skeleton className="h-20 w-full" />
                             <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
