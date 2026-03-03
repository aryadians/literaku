import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const envMap = Object.fromEntries(
    env.split(/\r?\n/)
        .filter(line => line.includes("="))
        .map(line => {
            const index = line.indexOf("=");
            return [line.substring(0, index).trim(), line.substring(index + 1).trim().replace(/^"(.*)"$/, '$1')];
        })
);

const supabaseUrl = envMap.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envMap.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Env Vars in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAll() {
    console.log("--- Auth Users ---");
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error("Error fetching auth users:", authError.message);
    } else {
        console.table(users.map(u => ({ id: u.id, email: u.email, last_sign_in: u.last_sign_in_at })));
    }

    console.log("\n--- Profiles ---");
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, role');

    if (profileError) {
        console.error("Error fetching profiles:", profileError.message);
    } else {
        console.table(profiles);
    }
}

listAll();
