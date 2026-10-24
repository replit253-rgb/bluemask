import { describe, expect, it } from "vitest";
import { orderMessage, type Product } from "@/lib/products";

describe("Discord order message", () => {
  it("includes the account code and price", () => {
    const product: Product = {
      code: "BM-WOS-01",
      game: "whiteout-survival",
      title: "Test Account",
      badge: "",
      price: 300,
      status: "tersedia",
      stats: [],
      highlights: [],
    };
    const message = orderMessage(product);
    expect(message).toContain("BM-WOS-01");
    expect(message).toContain("$300");
  });
});
