import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const accountId = searchParams.get("accountId");

  if (!userId || !accountId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?error=missing_params`
    );
  }

  const account = await stripe.accounts.retrieve(accountId);

  if (!account.details_submitted) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?error=onboarding_incomplete`
    );
  }

  await db
    .update(users)
    .set({ stripeAccountId: accountId })
    .where(eq(users.id, userId));

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/?connected=true`
  );
}