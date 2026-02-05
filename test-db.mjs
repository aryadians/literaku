import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Manual wrapper to parse .env.local without dotenv package
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) return {};
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2 && !line.startsWith('#')) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                env[key] = val;
            }
        });
        return env;
    } catch (e) {
        console.error("Failed to read .env.local", e);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("----------------------------------------");
console.log("🛠️ TESTING SUPABASE (NO DEPS)...");
console.log("URL:", supabaseUrl);
console.log("Key Length:", supabaseKey ? supabaseKey.length : "MISSING");
console.log("----------------------------------------");

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: Missing Supabase Credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        console.log("Auth Check:", authError ? "Error / No Session" : "OK");

        const { data, error, count } = await supabase
            .from("book_reviews")
            .select("*", { count: "exact" })
            .limit(1);

        if (error) {
            console.error("❌ CONNECTION FAILED:");
            console.error(error);
        } else {
            console.log("✅ CONNECTION SUCCESS!");
            console.log(`Table 'book_reviews' has ${count} rows.`);
            console.log("Sample Data:", data);
        }
    } catch (err) {
        console.error("❌ UNEXPECTED ERROR:");
        console.error(err);
    }
}

testConnection();
