import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Check if current user is following the profile
export async function GET(
  request: Request,
  props: { params: Promise<{ username: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ isFollowing: false });
  }

  const supabase = createAdminClient();
  const targetUsername = params.username;

  // 1. Get target user ID from username
  const { data: targetUser, error: targetError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", targetUsername)
    .single();

  if (targetError || !targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 2. Check Follow Status
  const { data: followData } = await supabase
    .from("user_follows")
    .select("*")
    .eq("follower_id", session.user.id)
    .eq("following_id", targetUser.id)
    .single();

  return NextResponse.json({ isFollowing: !!followData });
}

// Toggle Follow/Unfollow
export async function POST(
  request: Request,
  props: { params: Promise<{ username: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const targetUsername = params.username;

  // 1. Get target user ID from username
  const { data: targetUser, error: targetError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", targetUsername)
    .single();

  if (targetError || !targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.id === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // 2. Check if already following
  const { data: existingFollow } = await supabase
    .from("user_follows")
    .select("*")
    .eq("follower_id", session.user.id)
    .eq("following_id", targetUser.id)
    .single();

  if (existingFollow) {
    // Unfollow
    const { error: deleteError } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", session.user.id)
      .eq("following_id", targetUser.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    return NextResponse.json({ isFollowing: false });
  } else {
    // Follow
    const { error: insertError } = await supabase
      .from("user_follows")
      .insert({
        follower_id: session.user.id,
        following_id: targetUser.id,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json({ isFollowing: true });
  }
}
