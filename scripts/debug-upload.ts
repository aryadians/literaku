import { createClient } from "@/lib/supabase/client";

export default async function debugUpload() {
    const supabase = createClient();
    
    // 1. Check Session
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Session User ID:", session?.user?.id);
    
    if (!session) {
        console.error("No session found");
        return;
    }

    // 2. Check Profile Role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
    
    console.log("Profile Role from DB:", profile?.role);
    if (profileError) console.error("Profile Fetch Error:", profileError);

    // 3. Test dummy insert (dry run if possible, or just log)
    console.log("Testing insert policy...");
}
