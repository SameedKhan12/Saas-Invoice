import { NextResponse } from "next/server";

export async function GET() {
  // Redirect back to dashboard — user can try connecting again
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/?error=link_expired`
  );
}