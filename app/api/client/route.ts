import db from "@/db";
import { clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
// Get all clients
export async function GET() {
  try {
    const session = await auth();
    const id= session?.user?.id;
    if(!id){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allClients = await db.select().from(clients).where(eq(clients.userId, id));
    return NextResponse.json(allClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// Create a new client
export async function POST(req: Request){
    try {
        const body = await req.json();
        const session = await auth();
        const userId = session?.user?.id;
        if (!userId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const newClient = await db.insert(clients).values({
            userId,
            name: body.name,
            email: body.email,
        }).returning();
        return NextResponse.json(newClient[0], { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}