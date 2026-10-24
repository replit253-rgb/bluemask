import { describe, expect, it } from "vitest";
import { getTopUpEffectivePrice, topUpMessage, type TopUpPackage } from "@/lib/topup";

const packageInfo: TopUpPackage = {
  code: "TEST-DISCOUNT",
  game: "whiteout-survival",
  name: "Discount test pack",
  detail: "Test package",
  price: 20,
};

describe("top-up package discounts", () => {
  it("calculates the discounted price without changing the listed price", () => {
    const discounted = { ...packageInfo, hasDiscount: true, discountPercent: 25 };

    expect(getTopUpEffectivePrice(discounted)).toBe(15);
    expect(discounted.price).toBe(20);
  });

  it("keeps the listed price when no discount is enabled", () => {
    expect(getTopUpEffectivePrice(packageInfo)).toBe(20);
  });

  it("uses the discounted price in the Discord order message", () => {
    const discounted = { ...packageInfo, hasDiscount: true, discountPercent: 25 };

    expect(topUpMessage(discounted)).toContain("$15");
  });
});
