import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const { getTrustSafetyConfig, saveTrustSafetyConfig } = vi.hoisted(() => ({
  getTrustSafetyConfig: vi.fn(),
  saveTrustSafetyConfig: vi.fn(),
}));

vi.mock("@/lib/trust-safety", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/trust-safety")>();
  return {
    ...actual,
    getTrustSafetyConfig,
    saveTrustSafetyConfig,
  };
});

import { AdminTrustSafetyManager } from "@/components/AdminTrustSafetyManager";
import { DEFAULT_TRUST_SAFETY_CONFIG } from "@/lib/trust-safety";

describe("Trust & Safety CMS", () => {
  beforeEach(() => {
    getTrustSafetyConfig.mockResolvedValue(structuredClone(DEFAULT_TRUST_SAFETY_CONFIG));
    saveTrustSafetyConfig.mockReset().mockResolvedValue(undefined);
  });

  it("supports CRUD with a live preview and persists edits", async () => {
    render(<AdminTrustSafetyManager />);

    await screen.findByDisplayValue("Why Players Trade with RedMoon");
    fireEvent.change(screen.getByLabelText("Section title"), {
      target: { value: "Trade with Confidence" },
    });
    expect(
      await screen.findByRole("heading", { name: "Trade with Confidence" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add card" }));
    const newCard = screen.getByRole("group", { name: "Card 4" });
    fireEvent.change(within(newCard).getByLabelText("Title"), {
      target: { value: "Customer Support" },
    });
    fireEvent.change(within(newCard).getByLabelText("Description"), {
      target: { value: "Talk to our team on Discord." },
    });
    expect(await screen.findByRole("heading", { name: "Customer Support" })).toBeInTheDocument();

    fireEvent.click(within(newCard).getByRole("button", { name: "Delete card 4" }));
    expect(screen.queryByRole("heading", { name: "Customer Support" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save Component" }));
    await waitFor(() => expect(saveTrustSafetyConfig).toHaveBeenCalledOnce());
    expect(saveTrustSafetyConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Trade with Confidence",
        cards: expect.arrayContaining([expect.objectContaining({ title: "Middleman Service" })]),
      }),
    );
    expect(saveTrustSafetyConfig.mock.calls[0][0].cards).toHaveLength(3);
  });
});
