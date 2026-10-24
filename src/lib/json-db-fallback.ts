import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface StoreData {
  products: any[];
  topups: any[];
  services: any[];
  testimonials: any[];
  faqs: any[];
  pages: any[];
  store_settings: Record<string, any>;
  game_worlds: {
    cards: any[];
  };
  home_games: {
    cards: any[];
  };
}

const defaultStore: StoreData = {
  products: [
    {
      code: "BM-WOS-01",
      game: "whiteout-survival",
      title: "FC 5 · 92M Power · 6 Mythic Heroes",
      badge: "FC 5",
      price: 300,
      status: "tersedia",
      image: "/src/assets/images/chest_treasure_gold_1792579173076.jpg",
      screenshots: [],
      description: "FC 5 account with 92M Power, VIP 10, State #812. 6 five-star mythic heroes.",
      server: "State #812",
      stats: [
        { label: "Furnace", value: "FC 5" },
        { label: "Power", value: "92M" },
        { label: "VIP", value: "10" },
      ],
      highlights: ["6 five-star mythic heroes", "Full pets at level 60"],
    },
    {
      code: "BM-WOS-02",
      game: "whiteout-survival",
      title: "FC 3 · 58M Power · Clean Farm Account",
      badge: "FC 3",
      price: 140,
      status: "tersedia",
      image: "/src/assets/images/chest_magic_crystal_1792579173404.jpg",
      screenshots: [],
      description: "FC 3 account with 58M Power, VIP 8, State #1044.",
      server: "State #1044",
      stats: [
        { label: "Furnace", value: "FC 3" },
        { label: "Power", value: "58M" },
        { label: "VIP", value: "8" },
      ],
      highlights: ["40+ days of speedups", "Red chief gear in 4 slots"],
    },
  ],
  topups: Array.from({ length: 23 }, (_, i) => ({
    code: `WOS-PID-${i + 1}`,
    game: "whiteout-survival",
    name: `${(i + 1) * 0.99} Pack ID Top Up`,
    detail: "Pack ID top up for WOS",
    price: (i + 1) * 0.99,
    category: "Pack ID Top Up",
    popular: i === 9,
    image: "/src/assets/images/chest_wooden_loot_1792579173425.jpg",
    sort_order: i,
  })),
  services: [
    {
      slug: "middleman",
      name: "Middleman",
      tagline: "Calm transactions, both sides protected.",
      intro: "RedMoon acts as the go-between for buyer and seller.",
      steps: [
        { title: "Contact the team", text: "Open a ticket on Discord." },
        { title: "Account check", text: "Team reviews the account." },
        { title: "Funds held", text: "Buyer pays middleman." },
        { title: "Done", text: "Funds released to seller." },
      ],
      sort_order: 1,
      image: "",
    },
    {
      slug: "boost",
      name: "Power Boost",
      tagline: "Reach your goals faster.",
      intro: "We help you grow your account power safely.",
      steps: [
        { title: "Select plan", text: "Choose your boost target." },
        { title: "Team start", text: "Our pros log in and work." },
        { title: "Progress check", text: "Get daily updates." },
        { title: "Success", text: "Target reached." },
      ],
      sort_order: 2,
      image: "",
    },
    {
      slug: "maintenance",
      name: "Account Maintenance",
      tagline: "Keep your account active while you sleep.",
      intro: "Daily tasks and event management by RedMoon.",
      steps: [
        { title: "Consultation", text: "Discuss your account needs." },
        { title: "Assignment", text: "Assigned staff takes over." },
        { title: "Maintenance", text: "Daily tasks completed." },
        { title: "Reporting", text: "Weekly activity report." },
      ],
      sort_order: 3,
      image: "",
    },
  ],
  testimonials: Array.from({ length: 12 }, (_, i) => ({
    id: `test-${i + 1}`,
    service: i % 2 === 0 ? "middleman" : "boost",
    game: "whiteout-survival",
    name: `User ${i + 1}`,
    role: i % 3 === 0 ? "Seller" : "Buyer",
    quote: `Great experience with RedMoon service! Recommended for everyone. #${i + 1}`,
    date: "Oct 2026",
    image: null,
    created_at: new Date(Date.now() - i * 60000).toISOString(),
  })),
  faqs: [
    { id: "faq-1", question: "How long does top up take?", answer: "Typically 5-15 minutes." },
  ],
  pages: [
    {
      slug: "home",
      title: "RedMoon Gaming Store",
      hero_title: "Dominance starts here.",
      hero_subtitle: "The trusted hub for high-tier accounts.",
      hero_image: "/src/assets/hero-bg.jpg",
      lead_text: "Safe middleman service and account marketplace.",
      announcement: "New stock available now!",
      updated_at: new Date().toISOString(),
    },
  ],
  store_settings: {
    discordLink: "https://discord.gg/WHRzebh8pz",
    whatsapp: "+62 821-2780-6072",
    discordUsers: [{ name: "bluemask22", link: "https://discord.com/users/980636376691249152" }],
    game_worlds_header: {
      eyebrow: "GAMES",
      title: "Supported Game Worlds",
      subtitle: "Browse accounts and top-ups by game title.",
    },
    home_games_header: {
      eyebrow: "EXPLORE",
      title: "Popular Game Categories",
      linkText: "View All Games",
      linkUrl: "/games",
    },
    featured_accounts_config: {
      title: "Featured Accounts",
      subtitle: "Hand-picked high tier listings",
      description: "Verified and secure accounts ready for transfer.",
      items: [],
    },
  },
  game_worlds: {
    cards: [
      {
        id: "wos",
        slug: "whiteout-survival",
        name: "Whiteout Survival",
        genre: "Strategy",
        image: "",
        imageAlt: "WOS",
        number_code: "#1",
        services: {},
        account_points: {},
        sort_order: 0,
      },
      {
        id: "ks",
        slug: "kingshot",
        name: "KingShot",
        genre: "Strategy",
        image: "",
        imageAlt: "KingShot",
        number_code: "#2",
        services: {},
        account_points: {},
        sort_order: 1,
      },
    ],
  },
  home_games: {
    cards: [
      {
        id: "h1",
        slug: "whiteout-survival",
        name: "Whiteout Survival",
        genre: "Strategy",
        image: "",
        imageAlt: "WOS",
        action_text: "Explore",
        link_url: "/services/middleman/whiteout-survival",
        sort_order: 0,
      },
    ],
  },
};

export function readStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(defaultStore, null, 2), "utf-8");
      return defaultStore;
    }
    const content = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return { ...defaultStore, ...parsed };
  } catch (err) {
    throw new Error("Failed to read JSON database store.", { cause: err });
  }
}

export function writeStore(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    throw new Error("Failed to write JSON database store.", { cause: err });
  }
}

export async function executeFallbackQuery(
  text: string,
  params: unknown[] = [],
): Promise<{ rows: any[]; rowCount: number }> {
  const store = readStore();
  const lowerText = text.trim().toLowerCase();

  // PRODUCTS
  if (lowerText.includes("from products")) {
    if (lowerText.startsWith("select")) {
      return { rows: store.products || [], rowCount: store.products?.length || 0 };
    }
    if (lowerText.startsWith("insert")) {
      const [
        code,
        game,
        title,
        badge,
        price,
        status,
        image,
        screenshots,
        description,
        server,
        stats,
        highlights,
      ] = params;
      const parsedScreenshots =
        typeof screenshots === "string" ? JSON.parse(screenshots) : screenshots || [];
      const parsedStats = typeof stats === "string" ? JSON.parse(stats) : stats || {};
      const parsedHighlights =
        typeof highlights === "string" ? JSON.parse(highlights) : highlights || [];

      const newItem = {
        code,
        game,
        title,
        badge,
        price,
        status,
        image,
        screenshots: parsedScreenshots,
        description,
        server,
        stats: parsedStats,
        highlights: parsedHighlights,
      };
      const index = store.products.findIndex((p) => p.code === code);
      if (index >= 0) {
        store.products[index] = newItem;
      } else {
        store.products.unshift(newItem);
      }
      writeStore(store);
      return { rows: [newItem], rowCount: 1 };
    }
    if (lowerText.startsWith("delete")) {
      const code = params[0];
      const initialLen = store.products.length;
      store.products = store.products.filter((p) => p.code !== code);
      writeStore(store);
      return { rows: [], rowCount: initialLen - store.products.length };
    }
  }

  // TOPUPS
  if (lowerText.includes("from topups")) {
    if (lowerText.startsWith("select")) {
      return { rows: store.topups || [], rowCount: store.topups?.length || 0 };
    }
    if (lowerText.startsWith("insert")) {
      const [code, game, name, detail, price, image, category, popular, sort_order] = params;
      const newItem = { code, game, name, detail, price, image, category, popular, sort_order };
      const index = store.topups.findIndex((t) => t.code === code);
      if (index >= 0) {
        store.topups[index] = newItem;
      } else {
        store.topups.push(newItem);
      }
      writeStore(store);
      return { rows: [newItem], rowCount: 1 };
    }
    if (lowerText.startsWith("delete")) {
      const code = params[0];
      const initialLen = store.topups.length;
      store.topups = store.topups.filter((t) => t.code !== code);
      writeStore(store);
      return { rows: [], rowCount: initialLen - store.topups.length };
    }
  }

  // SERVICES
  if (lowerText.includes("from services")) {
    if (lowerText.startsWith("select")) {
      return { rows: store.services || [], rowCount: store.services?.length || 0 };
    }
    if (lowerText.startsWith("insert")) {
      const [slug, name, tagline, intro, steps, image, sort_order] = params;
      const parsedSteps = typeof steps === "string" ? JSON.parse(steps) : steps || [];
      const newItem = { slug, name, tagline, intro, steps: parsedSteps, image, sort_order };
      const index = store.services.findIndex((s) => s.slug === slug);
      if (index >= 0) {
        store.services[index] = newItem;
      } else {
        store.services.push(newItem);
      }
      writeStore(store);
      return { rows: [newItem], rowCount: 1 };
    }
    if (lowerText.startsWith("delete")) {
      const slug = params[0];
      const initialLen = store.services.length;
      store.services = store.services.filter((s) => s.slug !== slug);
      writeStore(store);
      return { rows: [], rowCount: initialLen - store.services.length };
    }
  }

  // TESTIMONIALS
  if (lowerText.includes("from testimonials")) {
    if (lowerText.startsWith("select")) {
      return { rows: store.testimonials || [], rowCount: store.testimonials?.length || 0 };
    }
    if (lowerText.startsWith("insert")) {
      const [id, service, game, name, role, quote, date, image] = params;
      const newItem = {
        id,
        service,
        game,
        name,
        role,
        quote,
        date,
        image,
        created_at: new Date().toISOString(),
      };
      const index = store.testimonials.findIndex((t) => t.id === id);
      if (index >= 0) {
        store.testimonials[index] = newItem;
      } else {
        store.testimonials.unshift(newItem);
      }
      writeStore(store);
      return { rows: [newItem], rowCount: 1 };
    }
    if (lowerText.startsWith("delete")) {
      const id = params[0];
      const initialLen = store.testimonials.length;
      store.testimonials = store.testimonials.filter((t) => t.id !== id);
      writeStore(store);
      return { rows: [], rowCount: initialLen - store.testimonials.length };
    }
  }

  // FAQS
  if (lowerText.includes("from faqs")) {
    if (lowerText.startsWith("select")) {
      return { rows: store.faqs || [], rowCount: store.faqs?.length || 0 };
    }
    if (lowerText.startsWith("insert")) {
      const [id, question, answer] = params;
      const newItem = { id, question, answer };
      const index = store.faqs.findIndex((f) => f.id === id);
      if (index >= 0) {
        store.faqs[index] = newItem;
      } else {
        store.faqs.push(newItem);
      }
      writeStore(store);
      return { rows: [newItem], rowCount: 1 };
    }
    if (lowerText.startsWith("delete")) {
      const id = params[0];
      const initialLen = store.faqs.length;
      store.faqs = store.faqs.filter((f) => f.id !== id);
      writeStore(store);
      return { rows: [], rowCount: initialLen - store.faqs.length };
    }
  }

  // STORE SETTINGS
  if (lowerText.includes("store_settings")) {
    if (lowerText.startsWith("select")) {
      if (lowerText.includes("where key")) {
        const key = params[0];
        const val = store.store_settings[key];
        return {
          rows: val !== undefined ? [{ key, value: val }] : [],
          rowCount: val !== undefined ? 1 : 0,
        };
      }
      const rows = Object.entries(store.store_settings).map(([key, value]) => ({ key, value }));
      return { rows, rowCount: rows.length };
    }
    if (lowerText.startsWith("insert") || lowerText.includes("on conflict")) {
      const [key, value] = params;
      const parsedValue = typeof value === "string" ? JSON.parse(value) : value;
      store.store_settings[key] = parsedValue;
      writeStore(store);
      return { rows: [{ key, value: parsedValue }], rowCount: 1 };
    }
  }

  // PAGES
  if (lowerText.includes("from pages")) {
    if (lowerText.startsWith("select")) {
      const slug = params[0];
      const page = store.pages.find((p) => p.slug === slug);
      return { rows: page ? [page] : [], rowCount: page ? 1 : 0 };
    }
    if (lowerText.startsWith("insert")) {
      const [slug, title, hero_title, hero_subtitle, hero_image, lead_text, announcement] = params;
      const newPage = {
        slug,
        title,
        hero_title,
        hero_subtitle,
        hero_image,
        lead_text,
        announcement,
        updated_at: new Date().toISOString(),
      };
      const index = store.pages.findIndex((p) => p.slug === slug);
      if (index >= 0) {
        store.pages[index] = newPage;
      } else {
        store.pages.push(newPage);
      }
      writeStore(store);
      return { rows: [newPage], rowCount: 1 };
    }
  }

  // GAME WORLDS
  if (lowerText.includes("game_worlds")) {
    if (lowerText.startsWith("select")) {
      return {
        rows: store.game_worlds.cards || [],
        rowCount: store.game_worlds.cards?.length || 0,
      };
    }
    if (lowerText.includes("delete")) {
      store.game_worlds.cards = [];
      writeStore(store);
      return { rows: [], rowCount: 1 };
    }
    if (lowerText.startsWith("insert")) {
      const [
        id,
        slug,
        name,
        genre,
        image,
        image_alt,
        number_code,
        services,
        account_points,
        sort_order,
      ] = params;
      const newCard = {
        id,
        slug,
        name,
        genre,
        image,
        image_alt,
        number_code,
        services,
        account_points,
        sort_order,
      };
      store.game_worlds.cards.push(newCard);
      writeStore(store);
      return { rows: [newCard], rowCount: 1 };
    }
  }

  // HOME GAMES
  if (lowerText.includes("home_games")) {
    if (lowerText.startsWith("select")) {
      return { rows: store.home_games.cards || [], rowCount: store.home_games.cards?.length || 0 };
    }
    if (lowerText.includes("delete")) {
      store.home_games.cards = [];
      writeStore(store);
      return { rows: [], rowCount: 1 };
    }
    if (lowerText.startsWith("insert")) {
      const [id, slug, name, genre, image, image_alt, action_text, link_url, sort_order] = params;
      const newCard = {
        id,
        slug,
        name,
        genre,
        image,
        image_alt,
        action_text,
        link_url,
        sort_order,
      };
      store.home_games.cards.push(newCard);
      writeStore(store);
      return { rows: [newCard], rowCount: 1 };
    }
  }

  return { rows: [], rowCount: 0 };
}
