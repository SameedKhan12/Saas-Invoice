"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/store/user-store";

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const fetch = useUserStore((s) => s.fetch);

  useEffect(() => {
    fetch();
  }, []);

  return <>{children}</>;
}