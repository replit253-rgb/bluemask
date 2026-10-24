import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const { getGameWorldsFn, getHomeGamesConfig } = vi.hoisted(() => ({
  getGameWorldsFn: vi.fn(),
  getHomeGamesConfig: vi.fn(),
}));

vi.mock("@/lib/pg-server-fn", () => ({ getGameWorldsFn }));

vi.mock("@/lib/home-games", () => ({ getHomeGamesConfig }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

import { AccountsForSaleWorlds } from "@/components/AccountsForSaleWorlds";

const homeCard = {
  id: "kingshot",
  slug: "kingshot",
  name: "Kingshot from admin",
  genre: "STRATEGY · FANTASY",
  image: "/kingshot.png",
  imageAlt: "Kingshot artwork",
};

describe("games page data", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses admin home-game data if no game-world records are configured", async () => {
    getGameWorldsFn.mockResolvedValue({
      configured: true,
      cards: [],
    });
    getHomeGamesConfig.mockResolvedValue({
      eyebrow: "Games",
      title: "Choose your Game",
      linkText: "All games",
      linkUrl: "/games",
      cards: [homeCard],
    });

    render(<AccountsForSaleWorlds />);

    expect(screen.getByText("Loading games...")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Kingshot from admin")).toBeInTheDocument());
    expect(screen.getByAltText("Kingshot artwork")).toHaveAttribute("src", "/kingshot.png");
  });

  it("keeps saved game-world records as the primary source", async () => {
    getGameWorldsFn.mockResolvedValue({
      configured: true,
      cards: [
        {
          id: "saved-kingshot",
          slug: "kingshot",
          name: "Saved game-world",
          genre: "STRATEGY",
          image: "/saved-kingshot.png",
          imageAlt: "Saved artwork",
          number: "01",
          services: [],
        },
      ],
    });
    getHomeGamesConfig.mockResolvedValue({
      cards: [homeCard],
    });

    render(<AccountsForSaleWorlds />);

    await waitFor(() => expect(screen.getByText("Saved game-world")).toBeInTheDocument());
    expect(screen.queryByText("Kingshot from admin")).not.toBeInTheDocument();
  });
});
