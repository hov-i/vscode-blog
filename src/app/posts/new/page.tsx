import { createClient } from "@/shared/lib/supabase/server";
import { redirect } from "next/navigation";
import NewPostForm from "./new-post-form";

export default async function NewPostPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'dbsghdql55555@gmail.com') {
        redirect('/posts');
    }

    return <NewPostForm />;
}
