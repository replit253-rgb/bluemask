import { type Product } from "./products";
import { getFeaturedAccountsConfigFn, saveFeaturedAccountsConfigFn } from "./pg-server-fn";

export interface FeaturedAccountsConfig {
  eyebrow: string;
  title: string;
  linkText: string;
  linkUrl: string;
  selectionMode: "auto" | "manual";
  selectedCodes: string[];
  maxDisplayCount: number;
}

export const DEFAULT_FEATURED_ACCOUNTS_CONFIG: FeaturedAccountsConfig = {
  eyebrow: "Catalog",
  title: "Account for Sale",
  linkText: "View all accounts",
  linkUrl: "/accounts",
  selectionMode: "auto",
  selectedCodes: ["WOS-101", "WOS-102", "KS-201", "ROK-301", "ROK-302", "COD-401"],
  maxDisplayCount: 6,
};

let cachedFeaturedAccountsConfig: FeaturedAccountsConfig = DEFAULT_FEATURED_ACCOUNTS_CONFIG;

export function getFeaturedAccountsConfig(): FeaturedAccountsConfig {
  return cachedFeaturedAccountsConfig;
}

export function saveFeaturedAccountsConfig(config: FeaturedAccountsConfig): void {
  cachedFeaturedAccountsConfig = config;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("featured-accounts-changed"));
  }

  saveFeaturedAccountsConfigFn({ data: config as unknown as Record<string, unknown> }).catch(
    (err) => {
      console.warn("saveFeaturedAccountsConfig error:", err);
    },
  );
}

export function resetFeaturedAccountsToDefault(): FeaturedAccountsConfig {
  cachedFeaturedAccountsConfig = DEFAULT_FEATURED_ACCOUNTS_CONFIG;
  saveFeaturedAccountsConfig(DEFAULT_FEATURED_ACCOUNTS_CONFIG);
  return DEFAULT_FEATURED_ACCOUNTS_CONFIG;
}

export async function getDisplayFeaturedProducts(
  allProducts: Product[],
  config: FeaturedAccountsConfig,
): Promise<Product[]> {
  if (config.selectionMode === "manual" && config.selectedCodes.length > 0) {
    const map = new Map<string, Product>();
    allProducts.forEach((p) => map.set(p.code, p));

    const selectedList: Product[] = [];
    config.selectedCodes.forEach((code) => {
      const p = map.get(code);
      if (p) {
        selectedList.push(p);
      }
    });

    if (selectedList.length > 0) {
      return selectedList.slice(0, config.maxDisplayCount);
    }
  }

  const available = allProducts.filter((p) => p.status === "tersedia");
  return available.slice(0, config.maxDisplayCount);
}
