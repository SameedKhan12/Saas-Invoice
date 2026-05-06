import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const POST = auth(async function POST(req) {
  try {
    const userId = req.auth?.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (existingUser?.stripeAccountId) {
      // Verify the account is actually fully onboarded
      const account = await stripe.accounts.retrieve(existingUser.stripeAccountId);
      
      if (account.details_submitted) {
        return NextResponse.json({ message: "Already connected" });
      }

      // Account exists but onboarding was never finished — create a new onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: existingUser.stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/connect/refresh`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/connect/return?userId=${userId}&accountId=${existingUser.stripeAccountId}`,
        type: "account_onboarding",
      });

      return NextResponse.json({ url: accountLink.url });
    }

    // Create Stripe account — do NOT save to DB yet
    const account = await stripe.accounts.create({ type: "standard" });

    // Store account ID temporarily in the onboarding link return URL
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/connect/refresh`,
      // ✅ Pass both userId and accountId in return URL
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/connect/return?userId=${userId}&accountId=${account.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
});