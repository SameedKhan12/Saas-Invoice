"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store/user-store";

export default function StripeBanner() {
      const { stripeConnected, fetched } = useUserStore();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem("stripe-banner-dismissed");
    if (wasDismissed) return;

    // Check Stripe connection status
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.stripeConnected) setShow(true);
      })
      .catch(() => {});
  }, []);

  function handleDismiss() {
    sessionStorage.setItem("stripe-banner-dismissed", "true");
    setDismissed(true);
    setTimeout(() => setShow(false), 300);
  }

if (!fetched || stripeConnected) return null;

  return (
    <div
      className={`
         rounded-xl border border-amber-200 bg-amber-50 px-4 py-3
         items-center justify-between gap-4 my-1 w-[95%] mx-auto
        transition-all duration-300 
        ${dismissed ? "hidden translate-y-1" : "flex translate-y-0"}
      `}
    >
      <div className="flex items-center gap-3 min-w-0 ">
        <div className="h-8 w-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 animate-ping">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            Connect Stripe to accept payments
          </p>
          <p className="text-xs text-amber-700 truncate">
            Clients can&apos;t pay invoices until you connect your Stripe account.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 border-amber-300 bg-white text-amber-800 hover:bg-amber-50 text-xs"
          onClick={() => router.push("/settings")}
        >
          Connect Stripe
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <button
          onClick={handleDismiss}
          className="h-7 w-7 rounded-md flex items-center justify-center text-amber-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}