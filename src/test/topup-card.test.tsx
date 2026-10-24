import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("@/hooks/use-store-settings", () => ({
  useStoreSettings: () => ({ discordLink: "" }),
}));

import { TopUpCard } from "@/components/TopUp";

describe("top-up package images", () => {
  it("shows the image saved for the package", () => {
    render(
      <TopUpCard
        p={{
          code: "TEST-1",
          game: "whiteout-survival",
          name: "Test pack",
          detail: "Test detail",
          price: 5,
          image: "https://example.com/admin-pack.png",
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "Test pack" })).toHaveAttribute(
      "src",
      "https://example.com/admin-pack.png",
    );
  });

  it("does not show an unrelated static image when the package has no image", () => {
    render(
      <TopUpCard
        p={{
          code: "TEST-2",
          game: "whiteout-survival",
          name: "Pack without artwork",
          detail: "Test detail",
          price: 5,
        }}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByLabelText("No package image")).toBeInTheDocument();
  });
});
