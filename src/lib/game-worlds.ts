import { getGameWorldsFn, saveGameWorldsFn } from "./pg-server-fn";

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
  cards: [],
};

let cachedWorldsConfig: GameWorldSectionConfig = DEFAULT_GAME_WORLDS_CONFIG;

export async function getGameWorldsConfig(): Promise<GameWorldSectionConfig> {
  const stored = await getGameWorldsFn();
  cachedWorldsConfig = {
    ...DEFAULT_GAME_WORLDS_CONFIG,
    ...stored,
    cards: stored.cards,
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
