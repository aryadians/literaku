import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const supabase = await createClient();
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null;
        }

        // Fetch username and role from profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, role")
          .eq("id", data.user.id)
          .single();

        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email!.split("@")[0],
          image: data.user.user_metadata?.avatar_url || null,
          username: profile?.username || null,
          role: profile?.role || "user",
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      
      // PERIODIC CHECK: Fetch role from DB if missing (crucial for OAuth/GitHub)
      if (token.id && !token.role) {
        try {
          const supabase = createAdminClient();
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, username")
            .eq("id", token.id)
            .single();
          
          if (profile) {
            token.role = profile.role;
            token.username = profile.username;
          }
        } catch (error) {
          console.error("Error fetching role in JWT callback:", error);
        }
      }

      // Handle update trigger from useSession().update()
      if (trigger === "update" && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.image) token.picture = session.user.image;
        if (session.user?.username) token.username = session.user.username;
        if (session.user?.role) token.role = session.user.role;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.id || !user.email) return true;

      const supabase = createAdminClient();
      
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingProfile) {
        const username = user.name?.toLowerCase().replace(/\s+/g, "_") || user.email.split("@")[0];
        
        await supabase.from("profiles").insert([
          {
            id: user.id,
            username: username,
            full_name: user.name,
            avatar_url: user.image,
            updated_at: new Date().toISOString(),
            role: "user"
          },
        ]);
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
