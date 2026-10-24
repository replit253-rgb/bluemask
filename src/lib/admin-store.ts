import { type Product } from "./products";
import { type TopUpPackage } from "./topup";
import {
  getProductsFromDB,
  saveProductToDB,
  getTopUpsFromDB,
  saveTopUpToDB,
  getStoreSettingsFromDB,
  saveStoreSettingsToDB,
} from "./db";

export type DiscordUser = { name: string; link: string };

export type StoreSettings = {
  discordLink: string;
  whatsapp: string;
  discordUsers: DiscordUser[];
};

export async function getStoredProducts(): Promise<Product[]> {
  return await getProductsFromDB();
}

export async function saveProducts(items: Product[]) {
  for (const item of items) {
    await saveProductToDB(item);
  }
}

export async function getStoredTopUps(): Promise<TopUpPackage[]> {
  return await getTopUpsFromDB();
}

export async function saveTopUps(items: TopUpPackage[]) {
  for (const item of items) {
    await saveTopUpToDB(item);
  }
}

export async function getStoreSettings(): Promise<StoreSettings> {
  return await getStoreSettingsFromDB();
}

export async function saveStoreSettings(settings: StoreSettings) {
  await saveStoreSettingsToDB(settings);
}
