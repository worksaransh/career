import { AppSidebar } from "@/components/layouts/sidebar";
import { MobileBottomNav } from "@/components/layouts/bottom-nav";
import { PwaInstallPrompt } from "@/components/shared/pwa-install";
import { ContextualPrompt } from "@/components/intelligence/contextual-prompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 lg:pl-72">
        <main className="min-h-screen pb-24 lg:pb-16 pt-4 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <PwaInstallPrompt />
      <ContextualPrompt />
    </div>
  );
}
