import { products as initialProducts, type Product } from "./products";
import { topUpPackages as initialTopUpPackages, type TopUpPackage } from "./topup";
import { discordLink as defaultDiscord, whatsappNumber as defaultWa } from "./catalog";

const PRODUCTS_KEY = "bm_admin_products_v1";
const TOPUPS_KEY = "bm_admin_topups_v1";
const SETTINGS_KEY = "bm_admin_settings_v1";

export type StoreSettings = {
  discordLink: string;
  whatsapp?: string;
};

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") return initialProducts;
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load stored products", err);
  }
  return initialProducts;
}

export function saveProducts(items: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
}

export function getStoredTopUps(): TopUpPackage[] {
  if (typeof window === "undefined") return initialTopUpPackages;
  try {
    const raw = localStorage.getItem(TOPUPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load stored topups", err);
  }
  return initialTopUpPackages;
}

export function saveTopUps(items: TopUpPackage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOPUPS_KEY, JSON.stringify(items));
}

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") return { discordLink: defaultDiscord, whatsapp: defaultWa };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        discordLink: parsed.discordLink || defaultDiscord,
        whatsapp: parsed.whatsapp || defaultWa,
      };
    }
  } catch (err) {
    console.warn("Failed to load store settings", err);
  }
  return { discordLink: defaultDiscord, whatsapp: defaultWa };
}

export function saveStoreSettings(settings: StoreSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
