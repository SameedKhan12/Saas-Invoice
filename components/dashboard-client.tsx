// app/(dashboard)/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Users, FileText, DollarSign, AlertCircle, Clock } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Label,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/lib/store/user-store";

interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  draftRevenue: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
    amount: number;
    fill: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  paid: {
    label: "Paid",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
  overdue: {
    label: "Overdue",
    color: "hsl(var(--chart-3))",
  },
  draft: {
    label: "Draft",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function Dashboard({ data }: { data: DashboardStats }) {
   const searchParams = useSearchParams();
   const router = useRouter();
   const { fetch: fetchUser } = useUserStore();
  const [stats, setStats] = useState<DashboardStats | null>(data);
//   const [loading, setLoading] = useState(true);

//   const fetchStats = async () => {
//     try {
//       const res = await fetch("/api/dashboard");
//       const data = await res.json();
//       setStats(data);
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
    useEffect(() => {
    if (searchParams.get("connected") === "true") {
      // Invalidate store and refetch so banner disappears and settings shows connected
      useUserStore.setState({ fetched: false });
      fetchUser();
      // Clean the URL
      router.replace("/");
    }
  }, [searchParams]);

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <Skeleton className="h-8 w-62.5" />
//           <Skeleton className="h-4 w-87.5 mt-2" />
//         </div>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {[...Array(4)].map((_, i) => (
//             <Skeleton key={i} className="h-32" />
//           ))}
//         </div>
//         <div className="grid gap-4 md:grid-cols-2">
//           <Skeleton className="h-100" />
//           <Skeleton className="h-100" />
//         </div>
//       </div>
//     );
//   }

  const totalInvoiceAmount =
    (stats?.totalRevenue || 0) +
    (stats?.pendingRevenue || 0) +
    (stats?.overdueRevenue || 0) +
    (stats?.draftRevenue || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your invoices and financial metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Revenue
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.pendingRevenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Last 6 months revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart accessibilityLayer data={stats?.revenueByMonth || []}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Invoice Status Breakdown */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-75"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name, item) => (
                        <>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: item.payload.fill,
                              }}
                            />
                            <span className="capitalize">{name}</span>
                          </div>
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {item.payload.count} invoice
                            {item.payload.count !== 1 ? "s" : ""}
                          </div>
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono text-sm text-muted-foreground">
                            ${Number(item.payload.amount).toFixed(2)}
                          </div>
                        </>
                      )}
                    />
                  }
                />
                <Pie
                  data={stats?.statusBreakdown || []}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {stats?.totalInvoices || 0}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Invoices
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Cards */}
      {stats && (stats.overdueRevenue > 0 || stats.draftRevenue > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.overdueRevenue > 0 && (
            <Card className="border-destructive/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Overdue Revenue
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  ${stats.overdueRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>
          )}

          {stats.draftRevenue > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Draft Invoices
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.draftRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Ready to send</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
