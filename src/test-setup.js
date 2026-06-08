import { vi } from "vitest";

vi.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }) => children,
    Helmet: ({ children }) => children,
  };
});
