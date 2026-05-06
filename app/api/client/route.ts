import db from "@/db";
import { clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCachedClients } from "@/lib/cache/clients";
// Get all clients
export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  try {
    const id = req.auth.user?.id;
    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allClients = await getCachedClients(id)
    return NextResponse.json(allClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
});

// Create a new client
export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const userId = await req.auth.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newClient = await db
      .insert(clients)
      .values({
        userId,
        name: body.name,
        email: body.email,
      })
      .returning();
    return NextResponse.json(newClient[0], { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 },
    );
  }
});
