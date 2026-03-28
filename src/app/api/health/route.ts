import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { status: "error", message: "Missing Supabase env vars" },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("pets").select("id").limit(1);

    if (error) throw error;

    return NextResponse.json({ status: "ok", supabase: "connected" });
  } catch (err) {
    return NextResponse.json(
      { status: "error", message: (err as Error).message },
      { status: 500 }
    );
  }
}
