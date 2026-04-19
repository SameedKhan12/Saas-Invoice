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
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    if (existingUser[0]?.stripeAccountId) {
      return NextResponse.json({
        message: "Already connected",
      });
    }

    // Create Stripe account
    const account = await stripe.account.create({
      type: "standard",
    });

    // Save account
    await db
      .update(users)
      .set({
        stripeAccountId: account.id,
      })
      .where(eq(users.id, userId));

    // create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url:accountLink.url,
    })
  } catch (error) {
    console.log(error)
  }
});
