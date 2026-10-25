import { findGame, type GameSlug } from "@/lib/catalog";
import { formatCurrency } from "@/lib/products";

export type TopUpPackage = {
  code: string;
  game: GameSlug;
  name: string;
  detail: string;
  price: number;
  popular?: boolean | undefined;
  image?: string | undefined;
  category?: string | undefined; // e.g. "Pack ID Top Up", "Frost Star Pack", "Kingdom Star Pack"
  description?: string | undefined; // Detail deskripsi produk
  features?: string[] | undefined; // Fitur / item yang didapat (bullet points)
  instructions?: string | undefined; // Instruksi top-up
  deliveryTime?: string | undefined; // Estimasi waktu pengiriman (e.g. "5 - 15 Minutes")
  sort_order?: number | undefined;
  hasDiscount?: boolean | undefined;
  discountPercent?: number | undefined;
  diamonds?: number | undefined;
};

export const getTopUpCurrencyName = (
  game: string,
  category?: string,
  code?: string,
): string | undefined => {
  const normalizedGame = game.trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (
    normalizedGame === "whiteout-survival" ||
    normalizedGame === "whiteout" ||
    normalizedGame === "wos" ||
    category === "Frost Star Pack" ||
    code?.toUpperCase().startsWith("WOS-")
  ) {
    return "Frost Star";
  }
  if (
    normalizedGame === "kingshot" ||
    normalizedGame === "king-shot" ||
    category === "Kingdom Star Pack" ||
    code?.toUpperCase().startsWith("KS-")
  ) {
    return "Kingdom Star";
  }
  return undefined;
};

export const getTopUpEffectivePrice = (pack: TopUpPackage) => {
  if (pack.hasDiscount && typeof pack.discountPercent === "number" && pack.discountPercent > 0) {
    return pack.price > 0
      ? Math.max(1, Math.round(pack.price * (1 - pack.discountPercent / 100)))
      : pack.price;
  }
  return pack.price;
};

export const GAME_TOPUP_CATEGORIES: Record<string, string[]> = {
  "whiteout-survival": ["Pack ID Top Up", "Frost Star Pack"],
  kingshot: ["Pack ID Top Up", "Kingdom Star Pack"],
};

export const topUpPackages: TopUpPackage[] = [
  // ==========================================
  // Whiteout Survival: 1. Pack ID Top Up
  // ==========================================
  {
    code: "WOS-PID-1",
    game: "whiteout-survival",
    name: "0.99 Pack ID Top Up",
    detail: "Daily / mini pack ID top up",
    price: 1,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_wooden_loot_1792579173425.jpg",
    description:
      "Direct daily / starter pack top-up for Whiteout Survival. Processed via official player ID without requiring account password.",
    features: [
      "Starter pack in-game items & resources",
      "No account login credentials required",
      "Instant transfer via reedmoon Discord ticket",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-PID-5",
    game: "whiteout-survival",
    name: "4.99 Pack ID Top Up",
    detail: "Standard pack ID top up",
    price: 5,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_magic_crystal_1792579173404.jpg",
    description:
      "Standard $4.99 Pack ID top-up for Whiteout Survival events, hero boosts, and resource upgrades.",
    features: [
      "Event bonus items and speedup caches",
      "Player ID delivery — 100% legal & safe",
      "Official receipt verification",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-PID-10",
    game: "whiteout-survival",
    name: "9.99 Pack ID Top Up",
    detail: "Event pack ID top up + gems",
    price: 10,
    popular: true,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "Popular $9.99 event pack ID top-up featuring bonus gems, stamina, and hero shards.",
    features: [
      "Popular event tier rewards & hero shards",
      "Bonus gems included in package",
      "Safe transfer via reedmoon middleman warranty",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-PID-20",
    game: "whiteout-survival",
    name: "19.99 Pack ID Top Up",
    detail: "Advance pack ID bundle",
    price: 20,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "Advance $19.99 pack bundle designed for fast alliance war preparation and hero level boosts.",
    features: [
      "High-value speedups and resource crates",
      "Direct account top up via Player ID",
      "Dedicated Discord agent support",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-PID-50",
    game: "whiteout-survival",
    name: "49.99 Pack ID Top Up",
    detail: "Deluxe pack ID crate & speedups",
    price: 50,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_magic_crystal_1792579173404.jpg",
    description:
      "Deluxe $49.99 pack ID crate packed with massive speedups, chief gear enhancements, and mythic materials.",
    features: [
      "Heavy speedup stockpile & chief gear materials",
      "VIP points & bonus diamond allocations",
      "Instant middleman assistance",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-PID-100",
    game: "whiteout-survival",
    name: "99.99 Pack ID All-In-One",
    detail: "Ultimate pack ID all-in-one bundle",
    price: 100,
    popular: true,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "The top-tier $99.99 all-in-one package with maximum power gain, VIP acceleration, and rare hero components.",
    features: [
      "Maximum tier items, speedups & chief gear upgrade",
      "Highest VIP bonus multiplier",
      "Priority fast-lane processing via Discord",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 10 Minutes",
  },

  // ==========================================
  // Whiteout Survival: 2. Frost Star Pack
  // ==========================================
  {
    code: "WOS-FSP-1",
    game: "whiteout-survival",
    name: "Frost Star Pack S1",
    detail: "Mini frost star bundle (100 Frost Stars)",
    price: 1,
    category: "Frost Star Pack",
    image: "/src/assets/images/chest_wooden_loot_1792579173425.jpg",
    description:
      "Official 100 Frost Star currency pack for Whiteout Survival. Delivered straight to your in-game balance.",
    features: [
      "100 Frost Stars credited directly",
      "Only Player ID required",
      "Instant Discord ticket confirmation",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-FSP-2",
    game: "whiteout-survival",
    name: "Frost Star Pack S2",
    detail: "Standard frost star bundle (500 Frost Stars)",
    price: 5,
    category: "Frost Star Pack",
    image: "/src/assets/images/chest_magic_crystal_1792579173404.jpg",
    description:
      "500 Frost Stars currency pack for custom in-game store purchases, skins, and stamina replenishments.",
    features: [
      "500 Frost Stars directly in account",
      "No account login password needed",
      "Safe transaction guarantee",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-FSP-3",
    game: "whiteout-survival",
    name: "Frost Star Pack S3",
    detail: "Medium frost star pack (1,000 Frost Stars)",
    price: 10,
    category: "Frost Star Pack",
    image: "/src/assets/images/chest_magic_crystal_1792579173404.jpg",
    description:
      "1,000 Frost Stars pack suitable for weekly event packs and exclusive furnace cosmetics.",
    features: [
      "1,000 Frost Stars added to in-game balance",
      "Fast Discord middleman execution",
      "Full warranty support",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-FSP-4",
    game: "whiteout-survival",
    name: "Frost Star Pack S4",
    detail: "Advance frost star pack (2,000 Frost Stars)",
    price: 20,
    category: "Frost Star Pack",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "2,000 Frost Stars bundle providing flexible currency for any limited-time shop offerings.",
    features: [
      "2,000 Frost Stars instant deposit",
      "Legitimate receipts and verified transaction",
      "Support on Discord throughout handover",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-FSP-5",
    game: "whiteout-survival",
    name: "Frost Star Pack Deluxe",
    detail: "Deluxe frost star crate (5,000 Frost Stars)",
    price: 50,
    popular: true,
    category: "Frost Star Pack",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "5,000 Frost Stars deluxe allocation with high-value savings compared to individual daily packs.",
    features: [
      "5,000 Frost Stars bulk currency",
      "Bonus loyalty Discord badge",
      "Speedy ticket response within minutes",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "WOS-FSP-6",
    game: "whiteout-survival",
    name: "Frost Star Pack Ultimate",
    detail: "Biggest frost star tier (10,000 Frost Stars)",
    price: 100,
    category: "Frost Star Pack",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "The premier 10,000 Frost Stars tier for powerhouse players dominating SvS and fortress wars.",
    features: [
      "10,000 Frost Stars maximum capacity",
      "VIP priority processing",
      "Direct agent assistance on Discord",
    ],
    instructions: "Provide your Whiteout Survival Player ID & State Number in your Discord ticket.",
    deliveryTime: "5 - 10 Minutes",
  },

  // ==========================================
  // Kingshot: 1. Pack ID Top Up
  // ==========================================
  {
    code: "KS-PID-1",
    game: "kingshot",
    name: "0.99 Pack ID Top Up",
    detail: "Mini starter pack ID top up",
    price: 1,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_wooden_loot_1792579173425.jpg",
    description:
      "Starter pack ID top up for Kingshot. Instant boost to kickstart your kingdom fortress.",
    features: ["Starter packs & resources", "Player ID delivery only", "Safe handover via Discord"],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-PID-5",
    game: "kingshot",
    name: "4.99 Pack ID Top Up",
    detail: "Standard pack ID top up",
    price: 5,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_magic_crystal_1792579173404.jpg",
    description:
      "Standard $4.99 Pack ID top-up for Kingshot commanders, troop training, and wall fortification.",
    features: [
      "Standard speedup and hero token crates",
      "Fast Player ID top-up delivery",
      "reedmoon transaction warranty",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-PID-10",
    game: "kingshot",
    name: "9.99 Pack ID Top Up",
    detail: "Popular event pack ID top up",
    price: 10,
    popular: true,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "Most popular $9.99 event tier pack in Kingshot for kingdom clash, alliance wars, and hero skills.",
    features: [
      "Key event boost items and gems",
      "100% credential safe",
      "Rapid delivery via Discord ticket",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-PID-20",
    game: "kingshot",
    name: "19.99 Pack ID Top Up",
    detail: "Hero rally pack ID bundle",
    price: 20,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "High-impact $19.99 hero rally pack with massive speedups and military troop growth.",
    features: [
      "Hero upgrade bundles and equipment boosts",
      "Player ID instant processing",
      "Dedicated middleman protection",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-PID-50",
    game: "kingshot",
    name: "49.99 Pack ID Top Up",
    detail: "Grand pack ID top up + speedups",
    price: 50,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_magic_crystal_1792579173404.jpg",
    description:
      "Grand $49.99 pack bundle packed with heavy gold crates, research speedups, and governor gear perks.",
    features: [
      "Extensive research and training speedups",
      "Kingdom star bonuses & VIP points",
      "Fast delivery via Discord ticket",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-PID-100",
    game: "kingshot",
    name: "99.99 Pack ID All-In-One",
    detail: "Supreme pack ID top up all-in-one",
    price: 100,
    popular: true,
    category: "Pack ID Top Up",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "Supreme $99.99 Kingshot top-up for maximum kingdom dominance, royal gear upgrades, and legion mastery.",
    features: [
      "Supreme tier speedups, resources, and hero gear",
      "Top VIP level leap",
      "Priority Discord queue handling",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 10 Minutes",
  },

  // ==========================================
  // Kingshot: 2. Kingdom Star Pack
  // ==========================================
  {
    code: "KS-KSP-1",
    game: "kingshot",
    name: "Kingdom Star Pack S1",
    detail: "Exclusive kingdom star boost (1,000 Stars)",
    price: 10,
    category: "Kingdom Star Pack",
    popular: true,
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "1,000 Kingdom Stars official top-up for Kingshot royal store items, hero cards, and kingdom crests.",
    features: [
      "1,000 Kingdom Stars credited to account",
      "Player ID delivery only",
      "Official receipt verification",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-KSP-2",
    game: "kingshot",
    name: "Kingdom Star Pack S2",
    detail: "Advanced kingdom star bundle (2,200 Stars)",
    price: 20,
    category: "Kingdom Star Pack",
    image: "/src/assets/images/chest_magic_crystal_1792579173404.jpg",
    description:
      "2,200 Kingdom Stars bundle with 10% star bonus included for commander enhancements.",
    features: [
      "2,200 Kingdom Stars direct deposit",
      "Safe & legal transactions",
      "Discord customer support support",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-KSP-3",
    game: "kingshot",
    name: "Kingdom Star Pack S3",
    detail: "Special kingdom star crate (3,500 Stars)",
    price: 30,
    category: "Kingdom Star Pack",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description: "3,500 Kingdom Stars crate for seasonal festival items and exclusive city skins.",
    features: [
      "3,500 Kingdom Stars loaded directly",
      "No password needed",
      "Verified reedmoon middleman transfer",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-KSP-4",
    game: "kingshot",
    name: "Kingdom Star Pack Deluxe",
    detail: "Deluxe kingdom star perks (6,000 Stars)",
    price: 50,
    category: "Kingdom Star Pack",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "6,000 Kingdom Stars deluxe package offering major savings for active kingdom leaders.",
    features: [
      "6,000 Kingdom Stars bulk deposit",
      "VIP customer ticket handling",
      "Fast 5–15 minute completion",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  },
  {
    code: "KS-KSP-5",
    game: "kingshot",
    name: "Kingdom Star Pack Supreme",
    detail: "Max tier kingdom star perks (13,000 Stars)",
    price: 100,
    popular: true,
    category: "Kingdom Star Pack",
    image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
    description:
      "13,000 Kingdom Stars supreme package with the highest bonus value in Kingshot history.",
    features: [
      "13,000 Kingdom Stars ultimate allocation",
      "Priority Discord queue with personal ticket handler",
      "Full warranty and transaction verification",
    ],
    instructions: "Provide your Kingshot Player ID & Kingdom Number in your Discord ticket.",
    deliveryTime: "5 - 10 Minutes",
  },
];

export const normalizeCategory = (item: TopUpPackage): TopUpPackage => {
  if (item.game === "whiteout-survival") {
    if (item.category === "Standard Packs" || !item.category) {
      return { ...item, category: "Pack ID Top Up" };
    }
  }
  if (item.game === "kingshot") {
    if (item.category === "Standard Packs" || !item.category) {
      return { ...item, category: "Pack ID Top Up" };
    }
  }
  return item;
};

export const enrichTopUpDetails = (p: TopUpPackage): TopUpPackage => {
  return normalizeCategory(p);
};

export const topUpForGame = (game: string) => {
  return topUpPackages.map(enrichTopUpDetails).filter((p) => p.game === game);
};

/** Message copied to the clipboard before opening Discord. */
export const topUpMessage = (p: TopUpPackage) => {
  const gameName = findGame(p.game)?.name ?? p.game;
  return `Hi reedmoon, I'd like to top up ${gameName} [${p.category || "Top-Up"}] ${p.name} (${formatCurrency(getTopUpEffectivePrice(p))}). Player ID: `;
};

/** Find a package in the bundled reference catalog. Runtime pages must query PostgreSQL. */
export const findTopUpPackage = (code: string): TopUpPackage | undefined => {
  const item = topUpPackages.find((p) => p.code.toLowerCase() === code.toLowerCase());
  return item ? enrichTopUpDetails(item) : undefined;
};
