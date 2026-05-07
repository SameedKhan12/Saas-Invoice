"use client";

import {  useState } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Zap,
  Shield,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/store/user-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// type ConnectionStatus = "loading" | "connected" | "disconnected";

export default function SettingsPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "user"
  const [connecting,setConnecting] = useState<boolean>(false)
 const { stripeConnected, stripeAccountId, fetching, fetched } = useUserStore();

  const status = !fetched || fetching
    ? "loading"
    : stripeConnected
    ? "connected"
    : "disconnected";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setConnecting(false);
    }
  }

  const maskedAccountId = stripeAccountId
    ? `acct_${stripeAccountId.replace("acct_", "").slice(0, 4)}${"•".repeat(12)}`
    : null;

  return (
    <div className="max-w-lg md:max-w-xl lg:max-w-full  px-4  space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Account
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences and integrations.
        </p>
      </div>

      <Separator />

      {/* Profile section */}
      <section className="space-y-4 max-w-2xl mx-auto">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
            Profile
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your account information.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <Avatar className="h-12 w-12">

              <AvatarImage
                src={session?.user?.image}
                alt={session.user.name ?? "user"}
                />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {session?.user?.name ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {session?.user?.email ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-2xl mx-auto"/>

      {/* Integrations section */}
      <section className="space-y-4 max-w-2xl mx-auto">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">
            Integrations
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect third-party services to unlock payment features.
          </p>
        </div>

        {/* Stripe card */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              {/* Stripe logo mark */}
              <div className="h-9 w-9 rounded-lg bg-[#635BFF] flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Stripe</p>
                <p className="text-xs text-muted-foreground">
                  Payment processing & payouts
                </p>
              </div>
            </div>

            {/* Status badge */}
            {status === "loading" ? (
              <Badge variant="secondary" className="gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking
              </Badge>
            ) : status === "connected" ? (
              <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="gap-1.5 bg-amber-500/10 text-amber-600 border-amber-200"
              >
                <AlertCircle className="h-3 w-3" />
                Not connected
              </Badge>
            )}
          </div>

          {/* Card body */}
          <div className="px-5 py-5 space-y-5">
            {status === "connected" ? (
              // Connected state
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      Your Stripe account is connected
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Clients can now pay invoices directly into your Stripe
                      account.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Account Details
                  </p>
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono text-foreground">
                        {maskedAccountId}
                      </span>
                    </div>
                    <a
                      href="https://dashboard.stripe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Stripe Dashboard
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ) : status === "disconnected" ? (
              // Disconnected state
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect your Stripe account to start accepting payments from
                  clients. Funds go directly into your Stripe balance.
                </p>

                {/* Feature list */}
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      icon: Zap,
                      text: "Instant payment links on every invoice",
                    },
                    {
                      icon: Shield,
                      text: "Secure checkout hosted by Stripe",
                    },
                    {
                      icon: CreditCard,
                      text: "Automatic receipts sent to clients",
                    },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-foreground" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to Stripe…
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 fill-current"
                      >
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                      </svg>
                      Connect Stripe Account
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Loading state
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}