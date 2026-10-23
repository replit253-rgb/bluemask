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

const STORAGE_KEY = "rm_v3_featured_accounts";

function loadSavedFeaturedConfig(): FeaturedAccountsConfig {
  if (typeof window === "undefined") return DEFAULT_FEATURED_ACCOUNTS_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn("Storage load error for featured accounts config:", err);
  }
  return DEFAULT_FEATURED_ACCOUNTS_CONFIG;
}

let cachedFeaturedAccountsConfig: FeaturedAccountsConfig = loadSavedFeaturedConfig();

export function getFeaturedAccountsConfig(): FeaturedAccountsConfig {
  if (typeof window === "undefined") {
    return DEFAULT_FEATURED_ACCOUNTS_CONFIG;
  }

  getFeaturedAccountsConfigFn()
    .then((data) => {
      if (data) {
        cachedFeaturedAccountsConfig = {
          eyebrow: (data.eyebrow as string) || DEFAULT_FEATURED_ACCOUNTS_CONFIG.eyebrow,
          title: (data.title as string) || DEFAULT_FEATURED_ACCOUNTS_CONFIG.title,
          linkText: (data.linkText as string) || DEFAULT_FEATURED_ACCOUNTS_CONFIG.linkText,
          linkUrl: (data.linkUrl as string) || DEFAULT_FEATURED_ACCOUNTS_CONFIG.linkUrl,
          selectionMode: (data.selectionMode as "auto" | "manual") || "auto",
          selectedCodes:
            (data.selectedCodes as string[]) || DEFAULT_FEATURED_ACCOUNTS_CONFIG.selectedCodes,
          maxDisplayCount: Number(data.maxDisplayCount) || 6,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedFeaturedAccountsConfig));
        window.dispatchEvent(new Event("featured-accounts-changed"));
      }
    })
    .catch((err) => {
      console.warn("getFeaturedAccountsConfig error:", err);
    });

  return cachedFeaturedAccountsConfig;
}

export function saveFeaturedAccountsConfig(config: FeaturedAccountsConfig): void {
  cachedFeaturedAccountsConfig = config;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (err) {
      console.warn("Storage save error for featured accounts config:", err);
    }

    saveFeaturedAccountsConfigFn({ data: config as unknown as Record<string, unknown> })
      .then(() => {
        window.dispatchEvent(new Event("featured-accounts-changed"));
      })
      .catch((err) => {
        console.warn("saveFeaturedAccountsConfig error:", err);
      });
  }
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
