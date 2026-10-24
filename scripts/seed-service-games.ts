import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required for seeding service games.");
  process.exit(1);
}

const games = [
  {
    id: "service-game-whiteout-survival",
    slug: "whiteout-survival",
    name: "Whiteout Survival",
    genre: "STRATEGY · SURVIVAL",
    image: "/assets/games/whiteout-survival.jpg",
    imageAlt: "A survivor facing a fortress in a snowy valley",
    actionText: "Explore accounts",
    linkUrl: "/accounts?game=whiteout-survival",
  },
  {
    id: "service-game-kingshot",
    slug: "kingshot",
    name: "Kingshot",
    genre: "STRATEGY · FANTASY",
    image: "/assets/games/kingshot.jpg",
    imageAlt: "An archer overlooking a castle in a green kingdom",
    actionText: "Explore accounts",
    linkUrl: "/accounts?game=kingshot",
  },
  {
    id: "service-game-rise-of-kingdoms",
    slug: "rise-of-kingdoms",
    name: "Rise of Kingdoms",
    genre: "STRATEGY · CIVILIZATION",
    image: "/assets/games/rise-of-kingdoms.jpg",
    imageAlt: "Cavalry riding toward an ancient city at the foot of the mountains",
    actionText: "Explore accounts",
    linkUrl: "/accounts?game=rise-of-kingdoms",
  },
  {
    id: "service-game-call-of-dragons",
    slug: "call-of-dragons",
    name: "Call of Dragons",
    genre: "STRATEGY · FANTASY",
    image: "/assets/games/call-of-dragons.jpg",
    imageAlt: "A dragon flying over a fantasy royal city",
    actionText: "Explore accounts",
    linkUrl: "/accounts?game=call-of-dragons",
  },
];

const services: {
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  steps: { title: string; text: string }[];
  gameSlugs: string[];
  checklist?: string[];
  sortOrder: number;
}[] = [
  {
    slug: "middleman",
    name: "Middleman",
    tagline: "Calm transactions, both sides protected.",
    intro:
      "RedMoon acts as the go-between for buyer and seller so the account and the payment change hands safely.",
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
    gameSlugs: games.map((game) => game.slug),
    sortOrder: 1,
  },
  {
    slug: "buy-sell-accounts",
    name: "Buy & Sell Accounts",
    tagline: "The account you want for your next adventure.",
    intro:
      "Find an account that fits your playstyle, or list the account you want to sell through the RedMoon team.",
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
    gameSlugs: games.map((game) => game.slug),
    sortOrder: 2,
  },
  {
    slug: "top-up",
    name: "Top Up",
    tagline: "Fast top ups, straight to your account.",
    intro:
      "Top up in-game packs for Whiteout Survival and Kingshot in rupiah, handled by the RedMoon team on Discord.",
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
    gameSlugs: ["whiteout-survival", "kingshot"],
    checklist: ["Player ID", "Character name", "State / kingdom number", "Chosen pack"],
    sortOrder: 3,
  },
];

async function seedServiceGames() {
  const client = new pg.Client({ connectionString });
  let transactionStarted = false;
  try {
    await client.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    for (const [index, game] of games.entries()) {
      await client.query(
        `INSERT INTO home_games
          (id, slug, name, genre, image, image_alt, action_text, link_url, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug, name = EXCLUDED.name, genre = EXCLUDED.genre,
          image = EXCLUDED.image, image_alt = EXCLUDED.image_alt,
          action_text = EXCLUDED.action_text, link_url = EXCLUDED.link_url,
          sort_order = EXCLUDED.sort_order`,
        [
          game.id,
          game.slug,
          game.name,
          game.genre,
          game.image,
          game.imageAlt,
          game.actionText,
          game.linkUrl,
          index,
        ],
      );
    }

    for (const service of services) {
      await client.query(
        `INSERT INTO services
          (slug, name, tagline, intro, steps, sort_order, game_slugs, checklist)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name, tagline = EXCLUDED.tagline, intro = EXCLUDED.intro,
          steps = EXCLUDED.steps, sort_order = EXCLUDED.sort_order,
          game_slugs = EXCLUDED.game_slugs, checklist = EXCLUDED.checklist`,
        [
          service.slug,
          service.name,
          service.tagline,
          service.intro,
          JSON.stringify(service.steps),
          service.sortOrder,
          service.gameSlugs,
          service.checklist ?? null,
        ],
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;
    console.log(`Seeded ${games.length} service games and ${services.length} services.`);
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Failed to roll back service game seeding:", rollbackError);
      }
    }
    console.error("Failed to seed service games:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void seedServiceGames();
