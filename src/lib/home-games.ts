import { getHomeGamesFn, saveHomeGamesFn } from "./pg-server-fn";

export interface HomeGameCard {
  id: string;
  slug: string;
  name: string;
  genre: string;
  image: string;
  imageAlt: string;
  actionText?: string;
  linkUrl?: string;
}

export interface HomeGamesSectionConfig {
  eyebrow: string;
  title: string;
  linkText: string;
  linkUrl: string;
  cards: HomeGameCard[];
}

export const DEFAULT_HOME_GAMES_CONFIG: HomeGamesSectionConfig = {
  eyebrow: "Games",
  title: "Choose your Game",
  linkText: "All games",
  linkUrl: "/games",
  cards: [],
};

let cachedHomeGamesConfig: HomeGamesSectionConfig = DEFAULT_HOME_GAMES_CONFIG;

export async function getHomeGamesConfig(): Promise<HomeGamesSectionConfig> {
  const stored = await getHomeGamesFn();
  cachedHomeGamesConfig = {
    ...DEFAULT_HOME_GAMES_CONFIG,
    ...stored,
    cards: stored.cards,
  };
  return cachedHomeGamesConfig;
}

export async function saveHomeGamesConfig(config: HomeGamesSectionConfig): Promise<void> {
  await saveHomeGamesFn({ data: config as unknown as Record<string, unknown> });
  cachedHomeGamesConfig = config;
  if (typeof window !== "undefined") window.dispatchEvent(new Event("home-games-changed"));
}

export async function resetHomeGamesToDefault(): Promise<HomeGamesSectionConfig> {
  await saveHomeGamesConfig(DEFAULT_HOME_GAMES_CONFIG);
  return cachedHomeGamesConfig;
}
