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
    const { container } = render(
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

  it("shows Kingshot's Kingdom Star quantity with its game icon", () => {
    const { container } = render(
      <TopUpCard
        p={{
          code: "TEST-DIAMONDS",
          game: "kingshot",
          name: "Star pack",
          detail: "Test detail",
          price: 5,
          diamonds: 12500,
        }}
      />,
    );

    expect(screen.getByText("12,500 Kingdom Star")).toBeInTheDocument();
    expect(container.querySelector('img[src="/diamond-2.png"]')).toHaveClass("h-6", "w-6");
  });

  it("uses the Whiteout Survival diamond icon", () => {
    const { container } = render(
      <TopUpCard
        p={{
          code: "TEST-WOS-DIAMONDS",
          game: "whiteout-survival",
          name: "Whiteout star pack",
          detail: "Test detail",
          price: 5,
          diamonds: 8000,
        }}
      />,
    );

    expect(screen.getByText("8,000 Frost Star")).toBeInTheDocument();
    expect(container.querySelector('img[src="/diamond-1.png"]')).toHaveClass("h-6", "w-6");
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

  it("refreshes the storefront package after diamond changes are saved", async () => {
    const pack = {
      code: "TEST-REFRESH",
      game: "whiteout-survival",
      name: "Refresh test pack",
      detail: "Test detail",
      price: 5,
      category: "Pack ID Top Up",
    } as const;
    getTopUpsFromDB
      .mockResolvedValueOnce([pack])
      .mockResolvedValueOnce([{ ...pack, diamonds: 2500 }]);
    const callsBeforeRender = getTopUpsFromDB.mock.calls.length;

    render(<TopUpGrid gameSlug="whiteout-survival" />);

    await screen.findByText("Refresh test pack");
    expect(screen.queryByText("2,500 Frost Star")).not.toBeInTheDocument();

    fireEvent(window, new Event("topups-changed"));

    expect(await screen.findByText("2,500 Frost Star")).toBeInTheDocument();
    expect(getTopUpsFromDB).toHaveBeenCalledTimes(callsBeforeRender + 2);
  });
});
