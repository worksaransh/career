import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import { PwaInstallPrompt } from "@/components/shared/pwa-install";
import { ConsentBanner } from "@/components/consent/consent-banner";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PwaInstallPrompt />
      <ConsentBanner />
    </div>
  );
}
