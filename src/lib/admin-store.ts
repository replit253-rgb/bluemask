import { products as initialProducts, type Product } from "./products";
import { topUpPackages as initialTopUpPackages, type TopUpPackage } from "./topup";
import { discordLink as defaultDiscord } from "./catalog";
import { getProductsFromDB, saveProductToDB, getTopUpsFromDB, saveTopUpToDB } from "./db";

export type DiscordUser = { name: string; link: string };

export type StoreSettings = {
  discordLink: string;
  discordUsers: DiscordUser[];
};

let cachedSettings: StoreSettings = {
  discordLink: defaultDiscord,
  discordUsers: [{ name: "bluemask22", link: "https://discord.com/users/123456789" }],
};

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
