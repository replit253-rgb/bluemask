import { describe, expect, it } from "vitest";
import { findProduct, orderMessage } from "@/lib/products";

describe("Discord order message", () => {
  it("includes the account code and price", () => {
    const product = findProduct("BM-WOS-01");
    expect(product).toBeDefined();
    if (!product) return;

    const message = orderMessage(product);
    expect(message).toContain("BM-WOS-01");
    expect(message).toMatch(/Rp\s?4\.500\.000/);
  });
});
