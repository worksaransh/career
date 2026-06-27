"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ParentDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/parents");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading Parent Dashboard...</p>
      </div>
    </div>
  );
}
