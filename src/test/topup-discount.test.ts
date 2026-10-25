import { describe, expect, it } from "vitest";
import {
  formatTopUpCurrency,
  getTopUpEffectivePrice,
  topUpMessage,
  type TopUpPackage,
} from "@/lib/topup";

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

  it("preserves cents in top-up prices and discounts", () => {
    expect(formatTopUpCurrency(9.99)).toBe("$9.99");
    expect(formatTopUpCurrency(9)).toBe("$9.00");
    expect(
      getTopUpEffectivePrice({ ...packageInfo, price: 9.99, hasDiscount: true, discountPercent: 10 }),
    ).toBe(8.99);
  });

  it("uses the discounted price in the Discord order message", () => {
    const discounted = { ...packageInfo, hasDiscount: true, discountPercent: 25 };

    expect(topUpMessage(discounted)).toContain("$15");
  });

  it("includes cents in the Discord order message", () => {
    expect(topUpMessage({ ...packageInfo, price: 9.99 })).toContain("$9.99");
  });
});
