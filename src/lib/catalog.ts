import whiteoutArtworkUrl from "@/assets/game-whiteout.jpg";
const whiteoutArtwork = { url: whiteoutArtworkUrl };
import kingshotArtworkUrl from "@/assets/game-kingshot.jpg";
const kingshotArtwork = { url: kingshotArtworkUrl };
import rokArtworkUrl from "@/assets/game-rok.jpg";
const rokArtwork = { url: rokArtworkUrl };
import dragonsArtworkUrl from "@/assets/game-dragons.jpg";
const dragonsArtwork = { url: dragonsArtworkUrl };

export const discordLink = "https://discord.gg/WHRzebh8pz";
export const discordUserLink = "https://discordapp.com/users/980636376691249152";
export const whatsappNumber = "+62 821-2780-6072";
export const whatsappClean = "6282127806072";

export const games = [
  {
    slug: "whiteout-survival",
    name: "Whiteout Survival",
    genre: "STRATEGY · SURVIVAL",
    image: whiteoutArtwork.url,
    imageAlt: "A survivor facing a fortress in a snowy valley",
    number: "01",
    accountPoints: [
      "Furnace level & state",
      "Heroes and gear",
      "Power & troops",
      "Account binding history",
    ],
  },
  {
    slug: "kingshot",
    name: "Kingshot",
    genre: "STRATEGY · FANTASY",
    image: kingshotArtwork.url,
    imageAlt: "An archer overlooking a castle in a green kingdom",
    number: "02",
    accountPoints: [
      "Town center level",
      "Heroes and gear",
      "Power & kingdom",
      "Account binding history",
    ],
  },
  {
    slug: "rise-of-kingdoms",
    name: "Rise of Kingdoms",
    genre: "STRATEGY · CIVILIZATION",
    image: rokArtwork.url,
    imageAlt: "Cavalry riding toward an ancient city at the foot of the mountains",
    number: "03",
    accountPoints: [
      "City hall & VIP level",
      "Commanders and equipment",
      "Power & kingdom",
      "Account binding history",
    ],
  },
  {
    slug: "call-of-dragons",
    name: "Call of Dragons",
    genre: "STRATEGY · FANTASY",
    image: dragonsArtwork.url,
    imageAlt: "A dragon flying over a fantasy royal city",
    number: "04",
    accountPoints: [
      "Stronghold level",
      "Heroes, artifacts & behemoths",
      "Power & server",
      "Account binding history",
    ],
  },
] as const;

export type Game = (typeof games)[number];
export type GameSlug = Game["slug"];
export type ServiceSlug =
  "middleman" | "buy-sell-accounts" | "jual-beli-akun" | "top-up" | (string & {});

export type Service = {
  slug: ServiceSlug;
  name: string;
  tagline: string;
  intro: string;
  steps: { title: string; text: string }[];
  /** Games served. Empty means all games. */
  gameSlugs?: GameSlug[];
  /** What the customer needs to prepare. Falls back to the game's account info. */
  checklist?: string[];
  image?: string;
  fee?: string;
};

export const services: Service[] = [
  {
    slug: "middleman",
    name: "Middleman",
    tagline: "Calm transactions, both sides protected.",
    intro:
      "BlueMask acts as the go-between for buyer and seller so the account and the payment change hands safely.",
    steps: [
      {
        title: "Contact the team",
        text: "Open a ticket on Discord with the deal details and both parties.",
      },
      {
        title: "Account check",
        text: "The team reviews the account and the agreement before the deal starts.",
      },
      {
        title: "Funds held",
        text: "The buyer pays the middleman, then the seller hands over the account.",
      },
      {
        title: "Done",
        text: "Once the buyer safely receives the account, the funds are released to the seller.",
      },
    ],
  },
  {
    slug: "buy-sell-accounts",
    name: "Buy & Sell Accounts",
    tagline: "The account you want for your next adventure.",
    intro:
      "Find an account that fits your playstyle, or list the account you want to sell through the BlueMask team.",
    steps: [
      {
        title: "Tell us what you need",
        text: "Describe the account you're looking for or the one you want to sell.",
      },
      { title: "Pick an offer", text: "The team helps match you with available offers." },
      {
        title: "Agree on a price",
        text: "Details and price are discussed directly with the team.",
      },
      {
        title: "Handover",
        text: "The deal is processed safely, with middleman support if needed.",
      },
    ],
  },
  {
    slug: "top-up",
    name: "Top Up",
    tagline: "Fast top ups, straight to your account.",
    intro:
      "Top up in-game packs for Whiteout Survival and Kingshot in rupiah, handled by the BlueMask team on Discord.",
    gameSlugs: ["whiteout-survival", "kingshot"],
    checklist: ["Player ID", "Character name", "State / kingdom number", "Chosen pack"],
    steps: [
      { title: "Choose a pack", text: "Pick a top up pack from the price list on this page." },
      {
        title: "Send your ID",
        text: "Copy your order and send it with your player ID in a Discord ticket.",
      },
      { title: "Pay", text: "Pay through the official channel the team gives you." },
      {
        title: "Pack delivered",
        text: "The team processes the top up and sends proof once the pack lands in your account.",
      },
    ],
  },
];

/** Games available for a service. */
export const gamesForService = (service: Service) =>
  service.gameSlugs ? games.filter((g) => service.gameSlugs?.includes(g.slug)) : [...games];

/** Whether a service is available for a given game. */
export const isServiceAvailable = (serviceSlug: string, gameSlug: string) => {
  const service = findService(serviceSlug);
  return Boolean(service && gamesForService(service).some((g) => g.slug === gameSlug));
};

export type Testimonial = {
  service: Service["slug"];
  game: Game["slug"] | "all";
  name: string;
  role: "Buyer" | "Seller";
  quote: string;
  date: string;
};

export const testimonials: Testimonial[] = [
  // --- Middleman ---
  {
    service: "middleman",
    game: "whiteout-survival",
    name: "Daffa",
    role: "Buyer",
    quote:
      "My first time buying an account and I was still paranoid. With the middleman, the funds were held until the Whiteout account was fully transferred and I could log in safely. Only then was the seller paid.",
    date: "Oct 2026",
  },
  {
    service: "middleman",
    game: "kingshot",
    name: "Sella",
    role: "Seller",
    quote:
      "I was selling a Kingshot account and worried about getting scammed. A ticket was opened, both sides agreed, and the middleman held the funds. The money was released that same night after the buyer confirmed.",
    date: "Sep 2026",
  },
  {
    service: "middleman",
    game: "rise-of-kingdoms",
    name: "Bagas",
    role: "Buyer",
    quote:
      "The team checked the ROK account before the deal: city hall, commanders, power, everything matched what the seller promised. Zero drama.",
    date: "Oct 2026",
  },
  {
    service: "middleman",
    game: "call-of-dragons",
    name: "Nadia",
    role: "Seller",
    quote:
      "The Call of Dragons handover was guided step by step. The buyer was also told to check everything before paying. Both of us felt at ease.",
    date: "Aug 2026",
  },
  {
    service: "middleman",
    game: "all",
    name: "Yoga",
    role: "Buyer",
    quote:
      "The Discord is responsive and every step is explained as it happens. Even a big deal felt as easy as buying phone credit.",
    date: "Sep 2026",
  },
  {
    service: "middleman",
    game: "all",
    name: "Kevin",
    role: "Seller",
    quote:
      "The middleman fee is clear upfront, no hidden charges. Proof of transfer is posted right in the ticket, no chasing anyone.",
    date: "Oct 2026",
  },
  // --- Buy & Sell Accounts ---
  {
    service: "jual-beli-akun",
    game: "whiteout-survival",
    name: "Fajar",
    role: "Buyer",
    quote:
      "I asked for a Whiteout account within my budget, and two days later I got several options with screenshots. The one I picked was even better than I expected.",
    date: "Oct 2026",
  },
  {
    service: "jual-beli-akun",
    game: "kingshot",
    name: "Mira",
    role: "Seller",
    quote:
      "My Kingshot account sold within a week. They showed me how to document the account so buyers would notice it fast.",
    date: "Sep 2026",
  },
  {
    service: "jual-beli-akun",
    game: "rise-of-kingdoms",
    name: "Arif",
    role: "Buyer",
    quote:
      "The ROK listings are honest — power and VIP level match the description. They even helped with negotiating until we had a deal.",
    date: "Aug 2026",
  },
  {
    service: "jual-beli-akun",
    game: "call-of-dragons",
    name: "Lulu",
    role: "Seller",
    quote:
      "Nobody was interested for a while, but the team kept promoting my Call of Dragons account. Eventually a serious buyer showed up.",
    date: "Sep 2026",
  },
  {
    service: "jual-beli-akun",
    game: "all",
    name: "Gilang",
    role: "Buyer",
    quote:
      "Prices are open to discussion, and every payment goes through a safe channel. I was never asked to transfer to a personal bank account.",
    date: "Oct 2026",
  },
  {
    service: "jual-beli-akun",
    game: "all",
    name: "Tasya",
    role: "Seller",
    quote:
      "Guided from listing to sale. If you're unsure about selling your account, talk to the team first.",
    date: "Jul 2026",
  },
];

export const findGame = (slug: string) => games.find((g) => g.slug === slug);
export const findService = (slug: string) => {
  const target = slug === "jual-beli-akun" ? "buy-sell-accounts" : slug;
  return services.find((s) => s.slug === target || s.slug === slug);
};
