import { getGameWorldsFn, saveGameWorldsFn } from "./pg-server-fn";
import { games } from "./catalog";

export interface GameWorldCard {
  id: string;
  slug: string;
  name: string;
  genre: string;
  image: string;
  imageAlt: string;
  number: string;
  services: string[];
  accountPoints?: string[];
}

export interface GameWorldSectionConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: GameWorldCard[];
}

export const DEFAULT_GAME_WORLDS_CONFIG: GameWorldSectionConfig = {
  eyebrow: "THE COLLECTION",
  title: "Accounts for Sale",
  subtitle: "",
  cards: games.map((game) => ({
    id: game.slug,
    slug: game.slug,
    name: game.name,
    genre: game.genre,
    image: game.image,
    imageAlt: game.imageAlt,
    number: game.number,
    services: ["Middleman", "Buy & Sell Accounts"],
    accountPoints: [...game.accountPoints],
  })),
};

let cachedWorldsConfig: GameWorldSectionConfig = DEFAULT_GAME_WORLDS_CONFIG;

export async function getGameWorldsConfig(): Promise<GameWorldSectionConfig> {
  const stored = await getGameWorldsFn();
  const { configured, ...storedConfig } = stored;
  cachedWorldsConfig = {
    ...DEFAULT_GAME_WORLDS_CONFIG,
    ...storedConfig,
    cards:
      storedConfig.cards.length === 0 && !configured
        ? DEFAULT_GAME_WORLDS_CONFIG.cards
        : storedConfig.cards,
  };
  return cachedWorldsConfig;
}

export async function saveGameWorldsConfig(config: GameWorldSectionConfig): Promise<void> {
  await saveGameWorldsFn({ data: config as unknown as Record<string, unknown> });
  cachedWorldsConfig = config;
  if (typeof window !== "undefined") window.dispatchEvent(new Event("game-worlds-changed"));
}

export async function resetGameWorldsToDefault(): Promise<GameWorldSectionConfig> {
  await saveGameWorldsConfig(DEFAULT_GAME_WORLDS_CONFIG);
  return cachedWorldsConfig;
}
