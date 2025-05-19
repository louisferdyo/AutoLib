import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../../lib/supabaseServer";
import { processBookReturn } from "../../../../..//lib/services/transactionService";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = createServerSupabaseClient();

    // 1. Ambil dan validasi body
    const body = await request.json();
    const { transactionId } = body as { transactionId: string };

    if (!transactionId) {
      return NextResponse.json(
        { error: "Missing required field: transactionId" },
        { status: 400 }
      );
    }

    // 2. Ambil session user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to return books." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 3. Proses pengembalian buku
    const result = await processBookReturn(transactionId, userId);

    // 4. Response sukses
    return NextResponse.json({
      success: true,
      message: "Book return processed successfully",
      data: {
        transactionId: result.transactionId,
        lockerId: result.lockerId,
      },
    });
  } catch (error: any) {
    console.error("Error in return API:", error);

    const isUserError = error.message?.includes("Cannot return");
    const statusCode = isUserError ? 400 : 500;
    const errorMessage =
      error.message || "An error occurred while processing book return";

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
