import { describe, expect, it } from "vitest";
import {
  getProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  getTopUpsFromDB,
  saveTopUpToDB,
  getPageFromDB,
  savePageToDB,
  type PageContent,
} from "@/lib/db";
import type { Product } from "@/lib/products";

describe("Admin Database & CMS Repository", () => {
  it("loads default products from database", async () => {
    const products = await getProductsFromDB();
    expect(products.length).toBeGreaterThan(0);
    expect(products.some((p) => p.code === "BM-WOS-01")).toBe(true);
  });

  it("creates, updates and deletes products in database", async () => {
    const testProduct: Product = {
      code: "TEST-BM-99",
      game: "whiteout-survival",
      title: "Test Account 99",
      badge: "FC 1",
      price: 1_000_000,
      status: "tersedia",
      stats: [{ label: "Level", value: "1" }],
      highlights: ["Test highlight"],
    };

    await saveProductToDB(testProduct);
    let all = await getProductsFromDB();
    expect(all.some((p) => p.code === "TEST-BM-99")).toBe(true);

    const updated = { ...testProduct, title: "Updated Test Account" };
    await saveProductToDB(updated);
    all = await getProductsFromDB();
    const found = all.find((p) => p.code === "TEST-BM-99");
    expect(found?.title).toBe("Updated Test Account");

    await deleteProductFromDB("TEST-BM-99");
    all = await getProductsFromDB();
    expect(all.some((p) => p.code === "TEST-BM-99")).toBe(false);
  });

  it("loads topup packages from database", async () => {
    const topups = await getTopUpsFromDB();
    expect(topups.length).toBeGreaterThan(0);
  });

  it("saves and retrieves CMS pages with custom hero images", async () => {
    const home = await getPageFromDB("home");
    if (!home) throw new Error("Home page not found");
    expect(home.slug).toBe("home");
    expect(home.heroTitle).toBeDefined();

    const modified: PageContent = {
      ...home,
      heroTitle: "Updated Hero Title Test",
      heroImage: "/custom/uploaded/image.jpg",
    };
    await savePageToDB(modified);

    const reloaded = await getPageFromDB("home");
    if (!reloaded) throw new Error("Reloaded home page not found");
    expect(reloaded.heroTitle).toBe("Updated Hero Title Test");
    expect(reloaded.heroImage).toBe("/custom/uploaded/image.jpg");
  });
});
