"use client";

import { Icon } from "@/shared/ui/icon";
import Link from "next/link";
import { useState, useTransition } from "react";
import { createProject } from "@/shared/lib/actions";

export default function NewProjectPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [repository, setRepository] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        const formData = new FormData();
        formData.append('title', name);
        formData.append('description', description);
        formData.append('tags', tags);
        formData.append('repository', repository);
        formData.append('demoUrl', demoUrl);

        startTransition(async () => {
            await createProject(formData);
        });
    };

    return (
        <div className="max-w-4xl h-full flex flex-col">
             <div className="mb-6 flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div className="flex items-center">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-[var(--accent)] text-white font-medium">
                        JSON
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">project.json</span>
                    <span className="ml-2 w-2 h-2 rounded-full bg-orange-400"></span>
                </div>
                 <div className="flex gap-2">
                     <Link href="/projects">
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
                        {isPending ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </div>

            <div className="space-y-6 font-mono text-sm max-w-2xl">
                <div className="flex items-start">
                    <span className="text-[var(--text-secondary)] mr-4 w-8 text-right">01</span>
                    <div className="flex-1">
                         <span className="text-[var(--accent)]">"name"</span>: 
                         <input 
                            type="text" 
                            placeholder="project-name" 
                            className="bg-transparent border-b border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ml-2 w-64"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />,
                    </div>
                </div>

                 <div className="flex items-start">
                    <span className="text-[var(--text-secondary)] mr-4 w-8 text-right">02</span>
                    <div className="flex-1">
                         <span className="text-[var(--accent)]">"description"</span>: 
                         <input 
                            type="text" 
                            placeholder="Project description goes here..." 
                            className="bg-transparent border-b border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ml-2 w-full max-w-md"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />,
                    </div>
                </div>

                <div className="flex items-start">
                    <span className="text-[var(--text-secondary)] mr-4 w-8 text-right">03</span>
                     <div className="flex-1">
                         <span className="text-[var(--accent)]">"tags"</span>: [
                         <input 
                            type="text" 
                            placeholder='"React", "Next.js"' 
                            className="bg-transparent border-b border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ml-2 w-64"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                         ],
                    </div>
                </div>

                <div className="flex items-start">
                    <span className="text-[var(--text-secondary)] mr-4 w-8 text-right">04</span>
                     <div className="flex-1">
                         <span className="text-[var(--accent)]">"repository"</span>: 
                         <input 
                            type="text" 
                            placeholder="https://github.com/..." 
                            className="bg-transparent border-b border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ml-2 w-full max-w-md"
                            value={repository}
                            onChange={(e) => setRepository(e.target.value)}
                        />,
                    </div>
                </div>

                <div className="flex items-start">
                    <span className="text-[var(--text-secondary)] mr-4 w-8 text-right">05</span>
                     <div className="flex-1">
                         <span className="text-[var(--accent)]">"demoUrl"</span>: 
                         <input 
                            type="text" 
                            placeholder="https://live-demo.com" 
                            className="bg-transparent border-b border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] ml-2 w-full max-w-md"
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                        />,
                    </div>
                </div>

                 <div className="flex items-start">
                    <span className="text-[var(--text-secondary)] mr-4 w-8 text-right">06</span>
                     <div className="flex-1">
                         <span className="text-[var(--accent)]">"private"</span>: 
                         <select className="bg-transparent border-b border-[var(--border-color)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] ml-2 cursor-pointer">
                             <option>false</option>
                             <option>true</option>
                         </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
