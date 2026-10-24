import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { getTopUpsFromDB } = vi.hoisted(() => ({
  getTopUpsFromDB: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("@/lib/db", () => ({ getTopUpsFromDB }));

vi.mock("@/hooks/use-store-settings", () => ({
  useStoreSettings: () => ({ discordLink: "" }),
}));

import { TopUpCard, TopUpGrid } from "@/components/TopUp";

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

  it("opens package details in place without navigating away from the top-up list", async () => {
    getTopUpsFromDB.mockResolvedValue([
      {
        code: "TEST-DETAIL",
        game: "whiteout-survival",
        name: "Detail test pack",
        detail: "Test detail",
        price: 5,
        category: "Pack ID Top Up",
      },
    ]);
    const currentUrl = window.location.href;

    render(<TopUpGrid gameSlug="whiteout-survival" />);

    await waitFor(() => expect(screen.getByText("Detail test pack")).toBeInTheDocument());
    fireEvent.click(screen.getByText("View Detail"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Detail test pack" })).toBeInTheDocument();
    expect(window.location.href).toBe(currentUrl);
  });
});
