export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mesh-gradient pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
