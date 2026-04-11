"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Users, FileText, DollarSign } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="">
      {!stats ? "Loading..." : `Total Clients: ${stats.totalClients}`}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Total Clients */}
        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">
            <Users className="w-4 h-4 inline mr-2" />
            Clients
          </p>
          <p className="text-2xl font-semibold">
            {stats?.totalClients}
          </p>
        </div>

        {/* Total Invoices */}
        <div className="bg-white p-4 rounded-2xl shadow">
          <p className="text-sm text-gray-500">
            <FileText className="w-4 h-4 inline mr-2" />
            Invoices
          </p>
          <p className="text-2xl font-semibold">
            {stats?.totalInvoices}
          </p>
        </div>
        {/* Total Revenue */}
        <Card className="bg-muted p-4 rounded-md">
          <CardHeader>
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
        </Card>
        {/* Pending Revenue */}
        <Card className="bg-muted p-4 rounded-md">
          <CardHeader>
            <CardDescription>Pending Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">${stats?.pendingRevenue?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
