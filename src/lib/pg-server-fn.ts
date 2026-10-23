import { createServerFn } from "@tanstack/react-start";
import { products as initialProducts, type Product } from "./products";
import { topUpPackages as initialTopUpPackages, type TopUpPackage } from "./topup";
import {
  services as initialServices,
  testimonials as initialTestimonials,
  type Service,
  type Testimonial,
} from "./catalog";
import { DEFAULT_GAME_WORLDS_CONFIG, type GameWorldSectionConfig } from "./game-worlds";
import { DEFAULT_HOME_GAMES_CONFIG, type HomeGamesSectionConfig } from "./home-games";
import { DEFAULT_FEATURED_ACCOUNTS_CONFIG, type FeaturedAccountsConfig } from "./featured-accounts";

let serverProducts: Product[] = [...initialProducts];
let serverTopups: TopUpPackage[] = [...initialTopUpPackages];
const serverPages: Record<string, unknown> = {};
let serverGameWorlds: GameWorldSectionConfig = DEFAULT_GAME_WORLDS_CONFIG;
let serverHomeGames: HomeGamesSectionConfig = DEFAULT_HOME_GAMES_CONFIG;
let serverFeaturedAccounts: FeaturedAccountsConfig = DEFAULT_FEATURED_ACCOUNTS_CONFIG;
const serverServices: Service[] = [...initialServices];
const serverTestimonials: Testimonial[] = [...initialTestimonials];
const serverFaqs: { id: string; question: string; answer: string }[] = [];

export const getProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  return serverProducts;
});

export const saveProductFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const product = data as unknown as Product;
    serverProducts = [product, ...serverProducts.filter((p) => p.code !== product.code)];
    return { success: true };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    serverProducts = serverProducts.filter((p) => p.code !== data.code);
    return { success: true };
  });

export const getTopupsFn = createServerFn({ method: "GET" }).handler(async () => {
  return serverTopups;
});

export const saveTopupFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const topup = data as unknown as TopUpPackage;
    serverTopups = [topup, ...serverTopups.filter((t) => t.code !== topup.code)];
    return { success: true };
  });

export const deleteTopupFn = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    serverTopups = serverTopups.filter((t) => t.code !== data.code);
    return { success: true };
  });

export const getPageFn = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    return (serverPages[data.slug] as Record<string, unknown>) || null;
  });

export const savePageFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const slug = data.slug as string;
    serverPages[slug] = data;
    return { success: true };
  });

export const getGameWorldsFn = createServerFn({ method: "GET" }).handler(async () => {
  return serverGameWorlds;
});

export const saveGameWorldsFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    serverGameWorlds = data as unknown as GameWorldSectionConfig;
    return { success: true };
  });

export const getHomeGamesFn = createServerFn({ method: "GET" }).handler(async () => {
  return serverHomeGames;
});

export const saveHomeGamesFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    serverHomeGames = data as unknown as HomeGamesSectionConfig;
    return { success: true };
  });

export const getFaqsFn = createServerFn({ method: "GET" }).handler(async () => {
  return serverFaqs;
});

export const getFeaturedAccountsConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  return serverFeaturedAccounts;
});

export const saveFeaturedAccountsConfigFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    serverFeaturedAccounts = data as unknown as FeaturedAccountsConfig;
    return { success: true };
  });
