"use client";

import { Icon } from "@/shared/ui/icon";
import { MarkdownEditor } from "@/shared/ui/markdown-editor";
import Link from "next/link";
import { useState, useTransition } from "react";
import { updateProject } from "@/shared/lib/actions";

interface EditProjectFormProps {
    projectId: number;
    initialTitle: string;
    initialDescription: string;
    initialContent: string;
    initialTags: string;
    initialRepository: string;
    initialDemoUrl: string;
}

export default function EditProjectForm({
    projectId,
    initialTitle,
    initialDescription,
    initialContent,
    initialTags,
    initialRepository,
    initialDemoUrl,
}: EditProjectFormProps) {
    const [name, setName] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [content, setContent] = useState(initialContent);
    const [tags, setTags] = useState(initialTags);
    const [repository, setRepository] = useState(initialRepository);
    const [demoUrl, setDemoUrl] = useState(initialDemoUrl);

    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        const formData = new FormData();
        formData.append('title', name);
        formData.append('description', description);
        formData.append('content', content);
        formData.append('tags', tags);
        formData.append('repository', repository);
        formData.append('demoUrl', demoUrl);

        startTransition(async () => {
            await updateProject(String(projectId), formData);
        });
    };

    return (
        <div className="max-w-4xl h-full flex flex-col">
             <div className="mb-6 flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        MD
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">project.md</span>
                    <span className="ml-2 w-2 h-2 rounded-full bg-orange-400"></span>
                </div>
                 <div className="flex gap-2">
                     <Link href={`/projects/${projectId}`}>
                        <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]" disabled={isPending}>
                            Cancel
                        </button>
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-3 py-1.5 text-xs rounded bg-[var(--accent)] text-white hover:opacity-90 flex items-center disabled:opacity-50"
                    >
                         {isPending ? (
                             <Icon name="loading" className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                             <Icon name="check" className="w-3 h-3 mr-1" />
                        )}
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 font-mono text-sm overflow-auto">
                <div>
                     <label className="block text-xs text-[var(--text-secondary)] mb-1">Project Name</label>
                     <input
                        type="text"
                        placeholder="Enter project name..."
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-xs text-[var(--text-secondary)] mb-1">Tags (comma separated)</label>
                         <input
                            type="text"
                            placeholder="React, Next.js, ..."
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>
                     <div>
                         <label className="block text-xs text-[var(--text-secondary)] mb-1">Description</label>
                         <input
                            type="text"
                            placeholder="Short summary..."
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="block text-xs text-[var(--text-secondary)] mb-1">Repository URL</label>
                         <input
                            type="text"
                            placeholder="https://github.com/..."
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            value={repository}
                            onChange={(e) => setRepository(e.target.value)}
                        />
                    </div>
                     <div>
                         <label className="block text-xs text-[var(--text-secondary)] mb-1">Demo URL</label>
                         <input
                            type="text"
                            placeholder="https://live-demo.com"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[400px]">
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">Content (Markdown)</label>
                    <MarkdownEditor
                        value={content}
                        onChange={setContent}
                        placeholder="# Project Details..."
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
}
