import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const { getTopUpsFromDB, getTestimonialsFromDB } = vi.hoisted(() => ({
  getTopUpsFromDB: vi.fn(),
  getTestimonialsFromDB: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getTopUpsFromDB,
  getTestimonialsFromDB,
}));

import { TopUpGrid } from "@/components/TopUp";
import { HomeTestimonials } from "@/components/Testimonials";

describe("empty database inventories", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not repopulate deleted top-up packages from static data", async () => {
    getTopUpsFromDB.mockResolvedValue([]);

    render(<TopUpGrid gameSlug="whiteout-survival" />);

    await waitFor(() => expect(getTopUpsFromDB).toHaveBeenCalled());
    expect(screen.queryByText("0.99 Pack ID Top Up")).not.toBeInTheDocument();
  });

  it("does not repopulate reviews when the database is empty", async () => {
    getTestimonialsFromDB.mockResolvedValue([]);

    const { container } = render(<HomeTestimonials />);

    await waitFor(() => expect(getTestimonialsFromDB).toHaveBeenCalled());
    expect(container.querySelector(".bm-testi-card")).toBeNull();
  });
});
