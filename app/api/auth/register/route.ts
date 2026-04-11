import  db  from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const body = await req.json();

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const user = await db.insert(users).values({
    email: body.email,
    password: hashedPassword,
  }).returning();

  return NextResponse.json(user);
}