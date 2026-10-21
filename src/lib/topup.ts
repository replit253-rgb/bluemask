import { findGame, type GameSlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/products";

export type TopUpPackage = {
  code: string;
  game: GameSlug;
  name: string;
  detail: string;
  price: number;
  popular?: boolean;
  image?: string;
  category?: string; // e.g. "Pack ID Top Up", "Kingdom Star Pack", "Standard Packs", "Weekly & Monthly Cards"
};

export const topUpPackages: TopUpPackage[] = [
  // Whiteout Survival - Frost Star Packs
  {
    code: "WOS-FSP-1",
    game: "whiteout-survival",
    name: "Frost Star Pack S1",
    detail: "Daily / mini pack",
    price: 1,
    category: "Frost Star Pack",
  },
  {
    code: "WOS-FSP-2",
    game: "whiteout-survival",
    name: "Frost Star Pack S2",
    detail: "Event pack & gems",
    price: 5,
    category: "Frost Star Pack",
  },
  {
    code: "WOS-FSP-3",
    game: "whiteout-survival",
    name: "Frost Star Pack Deluxe",
    detail: "Biggest pack",
    price: 100,
    popular: true,
    category: "Frost Star Pack",
  },

  // Whiteout Survival - Standard Packs
  {
    code: "WOS-STD-1",
    game: "whiteout-survival",
    name: "Pack $0.99",
    detail: "Daily / mini pack",
    price: 1,
    category: "Standard Packs",
  },
  {
    code: "WOS-STD-5",
    game: "whiteout-survival",
    name: "Pack $4.99",
    detail: "Event pack & gems",
    price: 5,
    category: "Standard Packs",
  },
  {
    code: "WOS-STD-10",
    game: "whiteout-survival",
    name: "Pack $9.99",
    detail: "Event pack & gems",
    price: 10,
    popular: true,
    category: "Standard Packs",
  },

  // Kingshot - Pack ID Top Up
  {
    code: "KS-PID-1",
    game: "kingshot",
    name: "Pack ID $0.99",
    detail: "Mini starter pack",
    price: 1,
    category: "Pack ID Top Up",
  },
  {
    code: "KS-PID-5",
    game: "kingshot",
    name: "Pack ID $4.99",
    detail: "Standard pack ID",
    price: 5,
    category: "Pack ID Top Up",
  },
  {
    code: "KS-PID-10",
    game: "kingshot",
    name: "Pack ID $9.99",
    detail: "Popular event pack ID",
    price: 10,
    popular: true,
    category: "Pack ID Top Up",
  },

  // Kingshot - Kingdom Star Pack
  {
    code: "KS-KSP-1",
    game: "kingshot",
    name: "Kingdom Star Pack S1",
    detail: "Exclusive kingdom star boost",
    price: 10,
    category: "Kingdom Star Pack",
    popular: true,
  },
  {
    code: "KS-KSP-2",
    game: "kingshot",
    name: "Kingdom Star Pack S2",
    detail: "Advanced kingdom star bundle",
    price: 20,
    category: "Kingdom Star Pack",
  },
  {
    code: "KS-KSP-3",
    game: "kingshot",
    name: "Kingdom Star Pack Deluxe",
    detail: "Max tier kingdom star perks",
    price: 50,
    category: "Kingdom Star Pack",
  },
];

export const topUpForGame = (game: string) => {
  let list = topUpPackages;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("bm_admin_topups_v1");
      if (raw) {
        list = JSON.parse(raw) as TopUpPackage[];
      }
    } catch (err) {
      console.warn("Storage check failed", err);
    }
  }
  return list.filter((p) => p.game === game);
};

/** Message copied to the clipboard before opening Discord. */
export const topUpMessage = (p: TopUpPackage) => {
  const gameName = findGame(p.game)?.name ?? p.game;
  return `Hi BlueMask, I'd like to top up ${gameName} [${p.category || "Top-Up"}] ${p.name} (${formatCurrency(p.price)}). Player ID: `;
};
