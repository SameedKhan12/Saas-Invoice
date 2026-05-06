import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export const GET = auth(async function GET(req) {
  const userId = req.auth?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      stripeAccountId: users.stripeAccountId,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // No Stripe account saved at all
  if (!user.stripeAccountId) {
    return NextResponse.json({
      ...user,
      stripeConnected: false,
      stripeOnboardingComplete: false,
    });
  }

  // Account ID exists — verify with Stripe that onboarding was actually finished
  try {
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    const onboardingComplete = account.details_submitted === true;

    if (!onboardingComplete) {
      // Onboarding was started but never finished — clear the stale ID
      // so the user can restart the connect flow cleanly next time
      await db
        .update(users)
        .set({ stripeAccountId: null })
        .where(eq(users.id, userId));

      return NextResponse.json({
        ...user,
        stripeAccountId: null,
        stripeConnected: false,
        stripeOnboardingComplete: false,
      });
    }

    // Fully connected and onboarded
    return NextResponse.json({
      ...user,
      stripeConnected: true,
      stripeOnboardingComplete: true,
    });
  } catch (err) {
    // Stripe threw an error — account may have been deleted on Stripe's side
    console.error("Stripe account retrieval failed:", err);

    // Clear the now-invalid account ID
    await db
      .update(users)
      .set({ stripeAccountId: null })
      .where(eq(users.id, userId));

    return NextResponse.json({
      ...user,
      stripeAccountId: null,
      stripeConnected: false,
      stripeOnboardingComplete: false,
    });
  }
});