import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, species, breed, traits, habits, bio, session_id } = body;

  if (!name || !species) {
    return NextResponse.json(
      { error: "name and species are required" },
      { status: 400 }
    );
  }

  // If authenticated, extract user_id from token
  let userId: string | null = null;
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) userId = user.id;
  }

  const { data, error } = await supabaseAdmin
    .from("pets")
    .insert({
      name,
      species,
      breed: breed ?? null,
      traits: traits ?? null,
      habits: habits ?? null,
      bio: bio ?? null,
      session_id: session_id ?? null,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
