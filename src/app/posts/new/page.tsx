"use client";

import { Icon } from "@/shared/ui/icon";
import Link from "next/link";
import { useState, useTransition } from "react";
import { createPost } from "@/shared/lib/actions";

export default function NewPostPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [content, setContent] = useState("");
    
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('tags', tags);
        formData.append('content', content);

        startTransition(async () => {
            await createPost(formData);
        });
    };

    return (
        <div className="max-w-4xl h-full flex flex-col">
             <div className="mb-4 flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        MD
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">Untitled-1.md</span>
                    <span className="ml-2 w-2 h-2 rounded-full bg-[var(--text-secondary)] opacity-50"></span>
                </div>
                 <div className="flex gap-2">
                     <Link href="/posts">
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
                        {isPending ? 'Saving...' : 'Save File'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 font-mono text-sm">
                <div>
                     <label className="block text-xs text-[var(--text-secondary)] mb-1">Title</label>
                     <input 
                        type="text" 
                        placeholder="Enter post title..." 
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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

                <div className="flex-1 flex flex-col">
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">Content (Markdown)</label>
                    <textarea 
                        className="flex-1 w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-4 text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent)] font-mono leading-relaxed"
                        placeholder="# Start writing..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
