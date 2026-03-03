import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const envMap = {};
env.split(/\n/).forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
        envMap[key] = value;
    }
});

const supabaseUrl = envMap.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envMap.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Env Vars in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdmin() {
    const adminEmail = "admin@literaku.com";
    console.log(`Searching for user with email: ${adminEmail}`);
    
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error("Error fetching auth users:", authError.message);
        return;
    }

    const adminUser = users.find(u => u.email === adminEmail);

    if (!adminUser) {
        console.error(`User ${adminEmail} not found in Auth.`);
        return;
    }

    console.log(`Found user ID: ${adminUser.id}. Checking profile...`);

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile:", profileError.message);
        return;
    }

    if (!profile) {
        console.log("Profile missing. Creating...");
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
                id: adminUser.id,
                email: adminEmail,
                username: 'admin',
                full_name: 'Administrator',
                role: 'admin',
                updated_at: new Date().toISOString()
            }]);
        
        if (insertError) {
            console.error("Error inserting profile:", insertError.message);
        } else {
            console.log("Profile created successfully as admin.");
        }
    } else {
        console.log("Profile exists. Updating role to admin...");
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin', email: adminEmail })
            .eq('id', adminUser.id);
        
        if (updateError) {
            console.error("Error updating profile:", updateError.message);
        } else {
            console.log("Profile updated successfully to admin.");
        }
    }
}

fixAdmin();
