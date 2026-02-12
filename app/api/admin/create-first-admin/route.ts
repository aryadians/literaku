import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const adminEmail = "admin@literaku.com";
  const adminPassword = "admin123";

  try {
    // 1. Create User in Auth (Bypass confirmation)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: "Admin Literaku",
        full_name: "Administrator",
      }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        // Fallback: If user exists, just try to update role
        const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', 'admin').single();
        // Since we don't have email in profiles, we rely on username or just manual update below
      } else {
        throw authError;
      }
    }

    const userId = authUser.user?.id;

    if (userId) {
      // 2. Update Profile to Admin
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
            role: "admin",
            username: "admin",
            full_name: "Administrator" 
        })
        .eq("id", userId);
      
      if (profileError) throw profileError;
    } else {
        // If user already existed, try to find by email or just force update profiles with username 'admin'
        await supabase.from("profiles").update({ role: "admin" }).eq("username", "admin");
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created/updated successfully",
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
