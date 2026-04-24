import { createClient } from "@/shared/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getProjectById } from "@/shared/lib/services/project.service";
import EditProjectForm from "./edit-project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'dbsghdql55555@gmail.com') {
        redirect('/projects');
    }

    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id)) {
        notFound();
    }

    const project = await getProjectById(id);

    if (!project) {
        notFound();
    }

    return (
        <EditProjectForm
            projectId={project.id}
            initialTitle={project.title}
            initialDescription={project.description || ''}
            initialContent={project.content || ''}
            initialTags={project.tags.map((t) => t.name).join(', ')}
            initialRepository={project.repository || ''}
            initialDemoUrl={project.demoUrl || ''}
        />
    );
}
