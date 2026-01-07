

import { Icon } from "@/shared/ui/icon";
import Link from "next/link";

import { getTags } from "@/shared/lib/services/tag.service";

export default async function TagsPage() {
    const tags = await getTags();

    return (
        <div className="max-w-4xl">
             <div className="mb-8">
                <div className="flex items-center mb-4">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        JSON
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">tags.json</span>
                </div>
                <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
                    Tags
                </h1>
            </div>

            <div className="flex flex-wrap gap-3">
                {tags.map((tag: any) => (
                    <TagItem key={tag.id} name={tag.name} count={tag.count} />
                ))}
            </div>
        </div>
    );
}

const TagItem = ({ name, count }: any) => (
    <Link href={`/tags/${name}`}>
        <div className="flex items-center px-3 py-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] cursor-pointer text-sm">
            <Icon name="tags" className="w-3 h-3 mr-2 text-[var(--accent)]" />
            <span className="text-[var(--text-primary)] mr-2">{name}</span>
            <span className="text-xs px-1.5 rounded-full bg-[var(--bg-primary)] text-[var(--text-secondary)]">
                {count}
            </span>
        </div>
    </Link>
);
