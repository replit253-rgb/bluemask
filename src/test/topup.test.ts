import { describe, expect, it } from "vitest";
import { findService, gamesForService, isServiceAvailable } from "@/lib/catalog";
import { topUpForGame, topUpMessage, topUpPackages } from "@/lib/topup";

describe("top up service", () => {
  it("is only available for Whiteout Survival and Kingshot", () => {
    const service = findService("top-up");
    expect(service).toBeDefined();
    if (!service) return;
    expect(gamesForService(service).map((g) => g.slug)).toEqual(["whiteout-survival", "kingshot"]);
  });

  it("is not available for Rise of Kingdoms and Call of Dragons", () => {
    expect(isServiceAvailable("top-up", "rise-of-kingdoms")).toBe(false);
    expect(isServiceAvailable("top-up", "call-of-dragons")).toBe(false);
  });

  it("every top up pack belongs to Whiteout Survival or Kingshot", () => {
    const allowed = new Set(["whiteout-survival", "kingshot"]);
    expect(topUpPackages.every((p) => allowed.has(p.game))).toBe(true);
    expect(topUpForGame("rise-of-kingdoms")).toHaveLength(0);
  });

  it("top up message includes game, pack, and USD price", () => {
    const pkg = topUpPackages.find((p) => p.code === "KS-PID-10");
    expect(pkg).toBeDefined();
    if (!pkg) return;
    const message = topUpMessage(pkg);
    expect(message).toContain("Kingshot");
    expect(message).toContain("9.99 Pack ID Top Up");
    expect(message).toContain("$10");
  });
});
