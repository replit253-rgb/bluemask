import whiteoutArtworkUrl from "@/assets/game-whiteout.jpg";
import kingshotArtworkUrl from "@/assets/game-kingshot.jpg";
import rokArtworkUrl from "@/assets/game-rok.jpg";
import dragonsArtworkUrl from "@/assets/game-dragons.jpg";
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
  cards: [
    {
      id: "home-game-1",
      slug: "whiteout-survival",
      name: "Whiteout Survival",
      genre: "STRATEGY · SURVIVAL",
      image: whiteoutArtworkUrl,
      imageAlt: "A survivor facing a fortress in a snowy valley",
      actionText: "Explore accounts",
      linkUrl: "/accounts?game=whiteout-survival",
    },
    {
      id: "home-game-2",
      slug: "kingshot",
      name: "Kingshot",
      genre: "STRATEGY · FANTASY",
      image: kingshotArtworkUrl,
      imageAlt: "An archer overlooking a castle in a green kingdom",
      actionText: "Explore accounts",
      linkUrl: "/accounts?game=kingshot",
    },
    {
      id: "home-game-3",
      slug: "rise-of-kingdoms",
      name: "Rise of Kingdoms",
      genre: "STRATEGY · CIVILIZATION",
      image: rokArtworkUrl,
      imageAlt: "Cavalry riding toward an ancient city at the foot of the mountains",
      actionText: "Explore accounts",
      linkUrl: "/accounts?game=rise-of-kingdoms",
    },
    {
      id: "home-game-4",
      slug: "call-of-dragons",
      name: "Call of Dragons",
      genre: "STRATEGY · FANTASY",
      image: dragonsArtworkUrl,
      imageAlt: "A dragon flying over a fantasy royal city",
      actionText: "Explore accounts",
      linkUrl: "/accounts?game=call-of-dragons",
    },
  ],
};

let cachedHomeGamesConfig: HomeGamesSectionConfig = DEFAULT_HOME_GAMES_CONFIG;

export function getHomeGamesConfig(): HomeGamesSectionConfig {
  if (typeof window === "undefined") {
    return DEFAULT_HOME_GAMES_CONFIG;
  }

  getHomeGamesFn()
    .then((data) => {
      if (data && Array.isArray(data.cards) && data.cards.length > 0) {
        cachedHomeGamesConfig = {
          eyebrow: (data.eyebrow as string) || DEFAULT_HOME_GAMES_CONFIG.eyebrow,
          title: (data.title as string) || DEFAULT_HOME_GAMES_CONFIG.title,
          linkText: (data.linkText as string) || DEFAULT_HOME_GAMES_CONFIG.linkText,
          linkUrl: (data.linkUrl as string) || DEFAULT_HOME_GAMES_CONFIG.linkUrl,
          cards: data.cards as HomeGameCard[],
        };
        window.dispatchEvent(new Event("home-games-changed"));
      }
    })
    .catch((err) => {
      console.warn("PostgreSQL getHomeGames error:", err);
    });

  return cachedHomeGamesConfig;
}

export function saveHomeGamesConfig(config: HomeGamesSectionConfig): void {
  cachedHomeGamesConfig = config;

  if (typeof window !== "undefined") {
    saveHomeGamesFn({ data: config as unknown as Record<string, unknown> })
      .then(() => {
        window.dispatchEvent(new Event("home-games-changed"));
      })
      .catch((err) => {
        console.warn("PostgreSQL saveHomeGames error:", err);
      });
  }
}

export function resetHomeGamesToDefault(): HomeGamesSectionConfig {
  cachedHomeGamesConfig = DEFAULT_HOME_GAMES_CONFIG;
  saveHomeGamesConfig(DEFAULT_HOME_GAMES_CONFIG);
  return DEFAULT_HOME_GAMES_CONFIG;
}
