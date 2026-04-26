import db from "@/db";
import { invoices } from "@/db/schema";
import { eq } from "drizzle-orm";

type RouteParam = {
  id: string;
};

export default async function PayPageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<RouteParam>;
}) {
  const { id } = await params;
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invoices/${id}`,{cache:"no-store"})
  // const data = await res.json();
  if (!id) {
    return (<>Invalid request</>);
  }
  const invoice = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(eq(invoices.id, id));
  if (invoice[0].status !== "paid") {
    return (<>{children}</>);
  }else{
    return(

      <div className="w-full h-screen flex items-center justify-center">
      <p>Invoice is already been paid thanks</p>
    </div>
    )
  }
}
