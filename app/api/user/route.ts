import db from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


export const GET = auth(async function GET(req){
    try {
        const id = await req.auth?.user?.id
        if(!id){
            return NextResponse.json({error:"Unauthorized"},{status:404})
        }
        const user = await db.select().from(users).where(eq(users.id,id));

        return NextResponse.json({user:user[0]},{status:200})

    } catch (error) {
        console.log(error);
        return NextResponse.json({error:error},{status:404})
    }
})