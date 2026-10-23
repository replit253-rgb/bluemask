import { products as initialProducts, type Product } from "./products";
import { topUpPackages as initialTopUpPackages, type TopUpPackage } from "./topup";
import { discordLink as defaultDiscord, whatsappNumber as defaultWa } from "./catalog";
import { getProductsFromDB, saveProductToDB, getTopUpsFromDB, saveTopUpToDB } from "./db";

export type StoreSettings = {
  discordLink: string;
  whatsapp?: string;
};

let cachedSettings: StoreSettings = { discordLink: defaultDiscord, whatsapp: defaultWa };

export function getStoredProducts(): Product[] {
  return initialProducts;
}

export function saveProducts(items: Product[]) {
  items.forEach((item) => {
    saveProductToDB(item);
  });
}

export function getStoredTopUps(): TopUpPackage[] {
  return initialTopUpPackages;
}

export function saveTopUps(items: TopUpPackage[]) {
  items.forEach((item) => {
    saveTopUpToDB(item);
  });
}

export function getStoreSettings(): StoreSettings {
  return cachedSettings;
}

export function saveStoreSettings(settings: StoreSettings) {
  cachedSettings = settings;
}
