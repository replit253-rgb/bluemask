import whiteoutArtworkUrl from "@/assets/game-whiteout.jpg";
import kingshotArtworkUrl from "@/assets/game-kingshot.jpg";
import rokArtworkUrl from "@/assets/game-rok.jpg";
import dragonsArtworkUrl from "@/assets/game-dragons.jpg";
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
  subtitle: "Four worlds. Your next adventure.",
  cards: [
    {
      id: "world-1",
      slug: "whiteout-survival",
      name: "Whiteout Survival",
      genre: "STRATEGY · SURVIVAL",
      image: whiteoutArtworkUrl,
      imageAlt: "A survivor facing a fortress in a snowy valley",
      number: "01",
      services: ["Middleman", "Buy & Sell Accounts", "Top Up"],
      accountPoints: [
        "Furnace level & state",
        "Heroes and gear",
        "Power & troops",
        "Account binding history",
      ],
    },
    {
      id: "world-2",
      slug: "kingshot",
      name: "Kingshot",
      genre: "STRATEGY · FANTASY",
      image: kingshotArtworkUrl,
      imageAlt: "An archer overlooking a castle in a green kingdom",
      number: "02",
      services: ["Middleman", "Buy & Sell Accounts", "Top Up"],
      accountPoints: [
        "Town center level",
        "Heroes and gear",
        "Power & kingdom",
        "Account binding history",
      ],
    },
    {
      id: "world-3",
      slug: "rise-of-kingdoms",
      name: "Rise of Kingdoms",
      genre: "STRATEGY · CIVILIZATION",
      image: rokArtworkUrl,
      imageAlt: "Cavalry riding toward an ancient city at the foot of the mountains",
      number: "03",
      services: ["Middleman", "Buy & Sell Accounts"],
      accountPoints: [
        "City hall & VIP level",
        "Commanders and equipment",
        "Power & kingdom",
        "Account binding history",
      ],
    },
    {
      id: "world-4",
      slug: "call-of-dragons",
      name: "Call of Dragons",
      genre: "STRATEGY · FANTASY",
      image: dragonsArtworkUrl,
      imageAlt: "A dragon flying over a fantasy royal city",
      number: "04",
      services: ["Middleman", "Buy & Sell Accounts"],
      accountPoints: [
        "Stronghold level",
        "Heroes, artifacts & behemoths",
        "Power & server",
        "Account binding history",
      ],
    },
  ],
};

let cachedWorldsConfig: GameWorldSectionConfig = DEFAULT_GAME_WORLDS_CONFIG;

export function getGameWorldsConfig(): GameWorldSectionConfig {
  if (typeof window === "undefined") {
    return DEFAULT_GAME_WORLDS_CONFIG;
  }

  getGameWorldsFn()
    .then((data) => {
      if (data && Array.isArray(data.cards) && data.cards.length > 0) {
        cachedWorldsConfig = {
          eyebrow: (data.eyebrow as string) || DEFAULT_GAME_WORLDS_CONFIG.eyebrow,
          title: (data.title as string) || DEFAULT_GAME_WORLDS_CONFIG.title,
          subtitle: (data.subtitle as string) || DEFAULT_GAME_WORLDS_CONFIG.subtitle,
          cards: data.cards as GameWorldCard[],
        };
        window.dispatchEvent(new Event("game-worlds-changed"));
      }
    })
    .catch((err) => {
      console.warn("PostgreSQL getGameWorlds error:", err);
    });

  return cachedWorldsConfig;
}

export function saveGameWorldsConfig(config: GameWorldSectionConfig): void {
  cachedWorldsConfig = config;

  if (typeof window !== "undefined") {
    saveGameWorldsFn({ data: config as unknown as Record<string, unknown> })
      .then(() => {
        window.dispatchEvent(new Event("game-worlds-changed"));
      })
      .catch((err) => {
        console.warn("PostgreSQL saveGameWorlds error:", err);
      });
  }
}

export function resetGameWorldsToDefault(): GameWorldSectionConfig {
  cachedWorldsConfig = DEFAULT_GAME_WORLDS_CONFIG;
  saveGameWorldsConfig(DEFAULT_GAME_WORLDS_CONFIG);
  return DEFAULT_GAME_WORLDS_CONFIG;
}
