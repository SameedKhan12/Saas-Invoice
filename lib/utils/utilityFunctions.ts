export function getBadgeColor(status: string): string {
    const statusColorMap: Record<string, string> = {
        draft: "bg-gray-100 text-gray-800",
        pending: "bg-yellow-100 text-yellow-800",
        sent: "bg-blue-100 text-blue-800",
        paid: "bg-green-100 text-green-800",
        overdue: "bg-red-100 text-red-800",
        cancelled: "bg-slate-100 text-slate-800",
    };

    return statusColorMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";
}