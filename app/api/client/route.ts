import db from "@/db";
import { clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
// Get all clients
export async function GET() {
  try {
    const allClients = await db.select().from(clients).where(eq(clients.userId, 'c839abdb-f472-4416-a7b9-d82565b9d9d4'));
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

        const newClient = await db.insert(clients).values({
            userId: body.userId,
            name: body.name,
            email: body.email,
        }).returning();
        return NextResponse.json(newClient[0], { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
}