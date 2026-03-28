import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { session_id } = await req.json();

  if (!session_id) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  // Verify session_id matches and pet is unclaimed
  const { data: pet, error: petError } = await supabaseAdmin
    .from("pets")
    .select("id, session_id, user_id")
    .eq("id", id)
    .single();

  if (petError || !pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  if (pet.session_id !== session_id) {
    return NextResponse.json({ error: "Invalid session_id" }, { status: 403 });
  }

  if (pet.user_id) {
    return NextResponse.json({ success: true }); // already claimed
  }

  // Get the authenticated user from the request
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Associate pet with user
  const { error: updateError } = await supabaseAdmin
    .from("pets")
    .update({ user_id: user.id, session_id: null })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
