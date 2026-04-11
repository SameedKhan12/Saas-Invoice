import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user.length) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: user[0].id,
                email: user[0].email,
                createdAt: user[0].createdAt,
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}