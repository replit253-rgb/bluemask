import { getTrustSafetyFn, saveTrustSafetyFn } from "./pg-server-fn";

export type TrustSafetyIcon = "shield" | "lock" | "zap";

export interface TrustSafetyCard {
  id: string;
  title: string;
  description: string;
  icon: TrustSafetyIcon;
}

export interface TrustSafetyConfig {
  eyebrow: string;
  title: string;
  cards: TrustSafetyCard[];
}

export const DEFAULT_TRUST_SAFETY_CONFIG: TrustSafetyConfig = {
  eyebrow: "Trust & Safety",
  title: "Why Players Trade with RedMoon",
  cards: [
    {
      id: "middleman-service",
      title: "Middleman Service",
      description:
        "We hold the account credentials and payment until both buyer and seller verify full delivery. No unauthorized releases.",
      icon: "shield",
    },
    {
      id: "verified-ownership",
      title: "Verified Ownership",
      description:
        "Every listed account undergoes credential inspection, binding email checks, and VIP status verification before listing.",
      icon: "lock",
    },
    {
      id: "direct-discord-concierge",
      title: "Direct Discord Concierge",
      description:
        "Live human coordination on Discord. Fast turnarounds on Whiteout Survival, Kingshot, and strategy game transfers.",
      icon: "zap",
    },
  ],
};

export async function getTrustSafetyConfig(): Promise<TrustSafetyConfig> {
  const stored = await getTrustSafetyFn();
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
    return DEFAULT_TRUST_SAFETY_CONFIG;
  }

  const cards = Array.isArray(stored.cards)
    ? stored.cards.filter(
        (card: unknown): card is TrustSafetyCard =>
          !!card &&
          typeof card === "object" &&
          "id" in card &&
          typeof card.id === "string" &&
          "title" in card &&
          typeof card.title === "string" &&
          "description" in card &&
          typeof card.description === "string" &&
          "icon" in card &&
          (card.icon === "shield" || card.icon === "lock" || card.icon === "zap"),
      )
    : DEFAULT_TRUST_SAFETY_CONFIG.cards;

  return {
    eyebrow:
      typeof stored.eyebrow === "string" ? stored.eyebrow : DEFAULT_TRUST_SAFETY_CONFIG.eyebrow,
    title: typeof stored.title === "string" ? stored.title : DEFAULT_TRUST_SAFETY_CONFIG.title,
    cards,
  };
}

export async function saveTrustSafetyConfig(config: TrustSafetyConfig): Promise<void> {
  await saveTrustSafetyFn({ data: config });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("trust-safety-changed"));
}
