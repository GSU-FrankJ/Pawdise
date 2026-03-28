import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Require auth
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, species, breed, traits, habits, bio } = body;

  if (!name || !species) {
    return NextResponse.json(
      { error: "name and species are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("pets")
    .insert({
      user_id: user.id,
      name,
      species,
      breed: breed ?? null,
      traits: traits ?? null,
      habits: habits ?? null,
      bio: bio ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
