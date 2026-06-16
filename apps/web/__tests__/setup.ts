import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: vi.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: vi.fn(() => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
  })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));
