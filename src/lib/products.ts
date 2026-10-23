import type { Game } from "@/lib/catalog";

export type Product = {
  code: string;
  game: Game["slug"];
  title: string;
  badge: string;
  price: number;
  status: "tersedia" | "terjual";
  image?: string;
  screenshots?: string[];
  description?: string;
  server?: string;
  stats: { label: string; value: string }[];
  highlights: string[];
  discountPercent?: number; // e.g. 20
  hasDiscount?: boolean; // whether discount is enabled
};

export const getEffectivePrice = (p: Product) => {
  if (p.hasDiscount && p.discountPercent && p.discountPercent > 0) {
    return Math.round(p.price * (1 - p.discountPercent / 100));
  }
  return p.price;
};

// Sample account list. Replace with real stock.
export const products: Product[] = [
  {
    code: "BM-WOS-01",
    game: "whiteout-survival",
    title: "FC 5 · 92M Power · 6 Mythic Heroes",
    badge: "FC 5",
    price: 300,
    hasDiscount: true,
    discountPercent: 20,
    status: "tersedia",
    stats: [
      { label: "Furnace", value: "FC 5" },
      { label: "Power", value: "92M" },
      { label: "VIP", value: "10" },
      { label: "State", value: "#812" },
    ],
    highlights: [
      "6 five-star mythic heroes",
      "Full pets at level 60",
      "Email binding can be transferred",
    ],
  },
  {
    code: "BM-WOS-02",
    game: "whiteout-survival",
    title: "FC 3 · 58M Power · Clean Farm Account",
    badge: "FC 3",
    price: 140,
    hasDiscount: true,
    discountPercent: 20,
    status: "tersedia",
    stats: [
      { label: "Furnace", value: "FC 3" },
      { label: "Power", value: "58M" },
      { label: "VIP", value: "8" },
      { label: "State", value: "#1044" },
    ],
    highlights: [
      "40+ days of speedups",
      "Red chief gear in 4 slots",
      "Never topped up via third parties",
    ],
  },
  {
    code: "BM-KS-01",
    game: "kingshot",
    title: "TC 30 · 74M Power · 4 Gen 3 Heroes",
    badge: "TC 30",
    price: 200,
    hasDiscount: true,
    discountPercent: 20,
    status: "tersedia",
    stats: [
      { label: "Town Center", value: "30" },
      { label: "Power", value: "74M" },
      { label: "VIP", value: "9" },
      { label: "Kingdom", value: "#215" },
    ],
    highlights: ["4 fully starred gen 3 heroes", "Gold governor gear", "Clean binding history"],
  },
  {
    code: "BM-KS-02",
    game: "kingshot",
    title: "TC 25 · 41M Power · Strong Starter",
    badge: "TC 25",
    price: 80,
    hasDiscount: true,
    discountPercent: 20,
    status: "terjual",
    stats: [
      { label: "Town Center", value: "25" },
      { label: "Power", value: "41M" },
      { label: "VIP", value: "7" },
      { label: "Kingdom", value: "#388" },
    ],
    highlights: ["Great for new players", "Large resource stockpile", "Ready to migrate kingdoms"],
  },
  {
    code: "BM-ROK-01",
    game: "rise-of-kingdoms",
    title: "103M · VIP 18 · 48 Legendary Gear",
    badge: "VIP 17–18",
    price: 1900,
    hasDiscount: true,
    discountPercent: 20,
    status: "tersedia",
    stats: [
      { label: "Power", value: "103M" },
      { label: "VIP", value: "18" },
      { label: "Legendary Gear", value: "48" },
      { label: "Passport", value: "16" },
    ],
    highlights: ["238 gold heads stored", "Main archer commanders maxed", "City hall 25"],
  },
  {
    code: "BM-ROK-02",
    game: "rise-of-kingdoms",
    title: "105M · VIP 19 · 45 Maxed Legendaries",
    badge: "VIP 19 / SVIP",
    price: 1600,
    hasDiscount: true,
    discountPercent: 20,
    status: "tersedia",
    stats: [
      { label: "Power", value: "105M" },
      { label: "VIP", value: "19" },
      { label: "Maxed Legendaries", value: "45" },
      { label: "Passport", value: "27" },
    ],
    highlights: ["810 gold heads stored", "Full cavalry commanders", "40 legendary gear"],
  },
  {
    code: "BM-COD-01",
    game: "call-of-dragons",
    title: "SH 25 · 88M Power · 3 Behemoth",
    badge: "SH 25",
    price: 380,
    hasDiscount: true,
    discountPercent: 20,
    status: "tersedia",
    stats: [
      { label: "Stronghold", value: "25" },
      { label: "Power", value: "88M" },
      { label: "VIP", value: "13" },
      { label: "Server", value: "#1520" },
    ],
    highlights: [
      "3 high-level behemoths",
      "6 legendary artifacts",
      "Main heroes with maxed skills",
    ],
  },
  {
    code: "BM-COD-02",
    game: "call-of-dragons",
    title: "SH 22 · 47M Power · Full Hero Roster",
    badge: "SH 22",
    price: 160,
    hasDiscount: true,
    discountPercent: 20,
    status: "tersedia",
    stats: [
      { label: "Stronghold", value: "22" },
      { label: "Power", value: "47M" },
      { label: "VIP", value: "10" },
      { label: "Server", value: "#1733" },
    ],
    highlights: ["9 legendary heroes", "Clean talent trees", "25+ days of speedups"],
  },
];

export const findProduct = (code: string) => {
  return products.find((p) => p.code.toLowerCase() === code.toLowerCase());
};

export const productsForGame = (game: string) => {
  return products.filter((p) => p.game === game);
};

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

/** Message copied to the clipboard before opening Discord. */
export const orderMessage = (p: Product) =>
  `Hi reedmoon, I'd like to order account ${p.code} — ${p.title} (${formatCurrency(p.price)}).`;

export const stats = [
  { value: "4.9", label: "Buyer rating" },
  { value: "340+", label: "Completed orders" },
  { value: "100%", label: "Via middleman" },
];

export const perks = [
  { title: "Account guarantee", text: "Full support if anything goes wrong after handover." },
  {
    title: "Honest pricing",
    text: "Every listing is checked so the price matches what's in the account.",
  },
  { title: "Team guidance", text: "The team helps you pick an account that suits your playstyle." },
  { title: "Fast handover", text: "Accounts are transferred as soon as payment is confirmed." },
  { title: "Verified listings", text: "Clear account details, with screenshots on Discord." },
];
