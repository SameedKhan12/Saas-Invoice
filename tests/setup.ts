import { vi } from "vitest";

// Mock Next.js server-only modules that aren't available in test environment
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => new Map()),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/"),
}));

// Silence console.error in tests unless explicitly needed
vi.spyOn(console, "error").mockImplementation(() => {});