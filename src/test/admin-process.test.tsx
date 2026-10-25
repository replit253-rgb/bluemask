import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const { getProcessConfig, saveProcessConfig } = vi.hoisted(() => ({
  getProcessConfig: vi.fn(),
  saveProcessConfig: vi.fn(),
}));

vi.mock("@/lib/process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/process")>();
  return {
    ...actual,
    getProcessConfig,
    saveProcessConfig,
  };
});

import { AdminProcessManager } from "@/components/AdminProcessManager";
import { DEFAULT_BUY_SELL_PROCESS_CONFIG } from "@/lib/process";

describe("Buy & Sell Process CMS", () => {
  beforeEach(() => {
    getProcessConfig.mockResolvedValue(structuredClone(DEFAULT_BUY_SELL_PROCESS_CONFIG));
    saveProcessConfig.mockReset().mockResolvedValue(undefined);
  });

  it("supports editing, adding, deleting, previewing, and saving process steps", async () => {
    render(<AdminProcessManager />);

    await screen.findByDisplayValue("How it works.");
    fireEvent.change(screen.getByLabelText("Section title"), {
      target: { value: "Our process" },
    });
    expect(screen.getByRole("heading", { name: "Our process" })).toBeInTheDocument();

    const firstStep = screen.getByRole("group", { name: "Step 1" });
    fireEvent.change(within(firstStep).getByLabelText("Title"), {
      target: { value: "Share your request" },
    });
    expect(screen.getByRole("heading", { name: "Share your request" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add step" }));
    const addedStep = screen.getByRole("group", { name: "Step 5" });
    fireEvent.change(within(addedStep).getByLabelText("Title"), {
      target: { value: "Confirm delivery" },
    });
    fireEvent.change(within(addedStep).getByLabelText("Description"), {
      target: { value: "Confirm that the handover is complete." },
    });
    expect(screen.getByRole("heading", { name: "Confirm delivery" })).toBeInTheDocument();

    fireEvent.click(within(addedStep).getByRole("button", { name: "Delete step 5" }));
    expect(screen.queryByRole("heading", { name: "Confirm delivery" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save Component" }));
    await waitFor(() => expect(saveProcessConfig).toHaveBeenCalledOnce());
    expect(saveProcessConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        eyebrow: "(01) Process",
        title: "Our process",
        steps: expect.arrayContaining([expect.objectContaining({ title: "Share your request" })]),
      }),
    );
    expect(saveProcessConfig.mock.calls[0][0].steps).toHaveLength(4);
  });
});
