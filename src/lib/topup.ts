import { findGame, type GameSlug } from "@/lib/catalog";
import { formatRupiah } from "@/lib/products";

export type TopUpPackage = {
  code: string;
  game: GameSlug;
  name: string;
  detail: string;
  price: number;
  popular?: boolean;
};

// Sample top up price list. Replace with real prices.
export const topUpPackages: TopUpPackage[] = [
  { code: "WOS-TU-1", game: "whiteout-survival", name: "Pack $0.99", detail: "Daily / mini pack", price: 16_000 },
  { code: "WOS-TU-5", game: "whiteout-survival", name: "Pack $4.99", detail: "Event pack & gems", price: 79_000 },
  { code: "WOS-TU-10", game: "whiteout-survival", name: "Pack $9.99", detail: "Event pack & gems", price: 155_000, popular: true },
  { code: "WOS-TU-20", game: "whiteout-survival", name: "Pack $19.99", detail: "Event pack & gems", price: 309_000 },
  { code: "WOS-TU-50", game: "whiteout-survival", name: "Pack $49.99", detail: "Large pack", price: 765_000 },
  { code: "WOS-TU-100", game: "whiteout-survival", name: "Pack $99.99", detail: "Biggest pack", price: 1_520_000 },
  { code: "KS-TU-1", game: "kingshot", name: "Pack $0.99", detail: "Daily / mini pack", price: 16_000 },
  { code: "KS-TU-5", game: "kingshot", name: "Pack $4.99", detail: "Event pack & gems", price: 79_000 },
  { code: "KS-TU-10", game: "kingshot", name: "Pack $9.99", detail: "Event pack & gems", price: 155_000, popular: true },
  { code: "KS-TU-20", game: "kingshot", name: "Pack $19.99", detail: "Event pack & gems", price: 309_000 },
  { code: "KS-TU-50", game: "kingshot", name: "Pack $49.99", detail: "Large pack", price: 765_000 },
  { code: "KS-TU-100", game: "kingshot", name: "Pack $99.99", detail: "Biggest pack", price: 1_520_000 },
];

export const topUpForGame = (game: string) => topUpPackages.filter((p) => p.game === game);

/** Message copied to the clipboard before opening Discord. */
export const topUpMessage = (p: TopUpPackage) => {
  const gameName = findGame(p.game)?.name ?? p.game;
  return `Hi BlueMask, I'd like to top up ${gameName} ${p.name} (${formatRupiah(p.price)}). Player ID: `;
};
