import { createClient } from "@/shared/lib/supabase/server";
import { redirect } from "next/navigation";
import NewProjectForm from "./new-project-form";

export default async function NewProjectPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'dbsghdql55555@gmail.com') {
        redirect('/projects');
    }

    return <NewProjectForm />;
}
