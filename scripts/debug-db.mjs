import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const envMap = Object.fromEntries(
    env.split("\n")
        .filter(line => line.includes("="))
        .map(line => line.split("="))
);

const supabaseUrl = envMap.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceKey = envMap.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Env Vars in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
    const configs = [
        { table: 'profiles', select: 'id, email' },
        { table: 'book_reviews', select: 'id, user_id, title' },
        { table: 'read_history', select: 'id, user_id, last_read_at' },
        { table: 'personal_canvas', select: 'id, user_id, title' }
    ];

    for (const config of configs) {
        console.log(`\n--- Data Sample for: ${config.table} ---`);
        const { data, error } = await supabase
            .from(config.table)
            .select(config.select)
            .limit(1);

        if (error) {
            console.error(`Error fetching ${config.table}:`, error.message);
            continue;
        }
        console.log(JSON.stringify(data[0], null, 2));
        if (data[0] && data[0].user_id) {
            console.log(`Type of user_id: ${typeof data[0].user_id}`);
        } else if (data[0] && data[0].id) {
            console.log(`Type of id: ${typeof data[0].id}`);
        }
    }
}

checkData();

async function checkTypes() {
    const tables = ['profiles', 'book_reviews', 'personal_canvas', 'read_history'];

    for (const table of tables) {
        console.log(`\n--- Checking Table: ${table} ---`);
        const { data: cols, error: colError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', table)
            .eq('table_schema', 'public');

        if (colError) {
            console.error(`Error checking ${table}:`, colError.message);
            continue;
        }
        console.table(cols);
    }
}

checkTypes();
