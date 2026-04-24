import { createClient } from "@/shared/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getPostById } from "@/shared/lib/services/post.service";
import EditPostForm from "./edit-post-form";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'dbsghdql55555@gmail.com') {
        redirect('/posts');
    }

    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id)) {
        notFound();
    }

    const post = await getPostById(id);

    if (!post) {
        notFound();
    }

    return (
        <EditPostForm
            postId={post.id}
            initialTitle={post.title}
            initialDescription={post.description || ''}
            initialTags={post.tags.map((t) => t.name).join(', ')}
            initialContent={post.content}
        />
    );
}
