import type { Game } from "@/lib/catalog";

export type Product = {
  code: string;
  game: Game["slug"];
  title: string;
  badge: string;
  price: number;
  status: "tersedia" | "terjual";
  image?: string | undefined;
  screenshots?: string[] | undefined;
  description?: string | undefined;
  server?: string | undefined;
  stats: { label: string; value: string }[];
  highlights: string[];
  discountPercent?: number | undefined; // e.g. 20
  hasDiscount?: boolean | undefined; // whether discount is enabled
};

export const getEffectivePrice = (p: Product) => {
  if (p.hasDiscount && p.discountPercent && p.discountPercent > 0) {
    return Math.round(p.price * (1 - p.discountPercent / 100));
  }
  return p.price;
};

export const products: Product[] = [];

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
