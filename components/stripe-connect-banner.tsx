"use client"; 

import { AlertCircle } from "lucide-react";
import { useState } from "react";

export function StripeConnectBanner() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-xl bg-yellow-50 flex justify-between items-center mx-6 mt-4">
      <div className="text-yellow-700 flex items-center gap-1.5">
        <AlertCircle className="h-5 w-5" />
        <p className="text-sm font-medium">Connect Stripe to receive payments</p>
      </div>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="px-4 py-2 text-sm font-semibold border rounded-lg border-yellow-700 text-yellow-700 transition-colors hover:bg-yellow-700 hover:text-white disabled:opacity-50"
      >
        {loading ? "Connecting..." : "Connect Stripe"}
      </button>
    </div>
  );
}