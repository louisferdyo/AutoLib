import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../../lib/supabaseServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createServerSupabaseClient();
  const body = await req.json();

  const {
    user_id,
    book_id,
    locker_id,
    scheduled_pickup_time,
    scheduled_return_time,
  } = body as {
    user_id: string;
    book_id: string;
    locker_id: string;
    scheduled_pickup_time: string;
    scheduled_return_time: string;
  };

  if (
    !user_id ||
    !book_id ||
    !locker_id ||
    !scheduled_pickup_time ||
    !scheduled_return_time
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id,
        book_id,
        locker_id,
        transaction_type: "borrow",
        scheduled_pickup_time: new Date(scheduled_pickup_time).toISOString(),
        scheduled_return_time: new Date(scheduled_return_time).toISOString(),
        actual_pickup_time: null,
        actual_return_time: null,
        status: "active", // Tambahan di sini
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Borrow transaction created", data },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
