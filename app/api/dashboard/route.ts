import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getCachedDashboardData } from "@/lib/cache/dashboard";

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.auth?.user?.id;
  const email = req.auth?.user?.email;

  if (!userId || !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getCachedDashboardData(userId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
});