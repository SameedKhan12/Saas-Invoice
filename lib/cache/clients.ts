import { unstable_cache } from "next/cache";
import db from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getCachedClients = (userId: string) =>
  unstable_cache(
    async () => {
      return db
        .select()
        .from(clients)
        .where(eq(clients.userId, userId));
    },
    [`clients-${userId}`],
    {
      tags: [`clients-${userId}`],
      revalidate: 60,
    }
  )();