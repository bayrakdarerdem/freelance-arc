import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { job_id, job_title, wallet_address, cover_letter } = await req.json();

    if (!wallet_address || !wallet_address.startsWith("0x")) {
      return NextResponse.json({ success: false, error: "Invalid wallet address" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("applications").insert({
      job_id,
      job_title,
      wallet_address,
      cover_letter,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: "Application submitted successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
