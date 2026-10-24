import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required for seeding.");
  process.exit(1);
}

if (process.env.SEED_DEMO_DATA !== "true") {
  console.error(
    "Demo seeding is disabled. Set SEED_DEMO_DATA=true to explicitly insert demo records.",
  );
  process.exit(1);
}

const initialProducts = [
  {
    code: "BM-WOS-01",
    game: "whiteout-survival",
    title: "FC 5 · 92M Power · 6 Mythic Heroes",
    badge: "FC 5",
    price: 300,
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
];

const initialTopups = Array.from({ length: 23 }, (_, i) => ({
  code: `WOS-PID-${i + 1}`,
  game: "whiteout-survival",
  name: `${(i + 1) * 0.99} Pack ID Top Up`,
  detail: "Pack ID top up for WOS",
  price: (i + 1) * 0.99,
  category: "Pack ID Top Up",
  popular: i === 9,
  sort_order: i,
}));

const initialServices = [
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
  },
];

const initialFAQs = [
  { id: "faq-1", question: "How long does top up take?", answer: "Typically 5-15 minutes." },
];

const initialPages = [
  {
    slug: "home",
    title: "RedMoon Gaming Store",
    hero_title: "Dominance starts here.",
    hero_subtitle: "The trusted hub for high-tier accounts.",
    hero_image: "/src/assets/hero-bg.jpg",
    lead_text: "Safe middleman service and account marketplace.",
  },
];

async function seedDatabase() {
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL for idempotent seeding.");

    const checkTable = async (tableName: string) => {
      const res = await client.query(`SELECT count(*) FROM ${tableName}`);
      return parseInt(res.rows[0].count) === 0;
    };

    // Products (initialProducts.length = 2)
    if (await checkTable("products")) {
      for (const p of initialProducts) {
        await client.query(
          `INSERT INTO products (code, game, title, badge, price, status, stats, highlights) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            p.code,
            p.game,
            p.title,
            p.badge,
            p.price,
            p.status,
            JSON.stringify(p.stats),
            JSON.stringify(p.highlights),
          ],
        );
      }
      console.log(`Seeded ${initialProducts.length} products.`);
    }

    // Topups (initialTopups.length = 23)
    if (await checkTable("topups")) {
      for (const t of initialTopups) {
        await client.query(
          `INSERT INTO topups (code, game, name, detail, price, category, popular, image, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [t.code, t.game, t.name, t.detail, t.price, t.category, t.popular, t.image, t.sort_order],
        );
      }
      console.log(`Seeded ${initialTopups.length} topups.`);
    }

    // Services (initialServices.length = 3)
    if (await checkTable("services")) {
      for (const s of initialServices) {
        await client.query(
          `INSERT INTO services (slug, name, tagline, intro, steps, sort_order) VALUES ($1, $2, $3, $4, $5, $6)`,
          [s.slug, s.name, s.tagline, s.intro, JSON.stringify(s.steps), s.sort_order],
        );
      }
      console.log(`Seeded ${initialServices.length} services.`);
    }

    // FAQs
    if (await checkTable("faqs")) {
      for (const f of initialFAQs) {
        await client.query(`INSERT INTO faqs (id, question, answer) VALUES ($1, $2, $3)`, [
          f.id,
          f.question,
          f.answer,
        ]);
      }
    }

    // Pages
    if (await checkTable("pages")) {
      for (const p of initialPages) {
        await client.query(
          `INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_image, lead_text) VALUES ($1, $2, $3, $4, $5, $6)`,
          [p.slug, p.title, p.hero_title, p.hero_subtitle, p.hero_image, p.lead_text],
        );
      }
    }

    // Initial Store Settings
    if (await checkTable("store_settings")) {
      const defaultSettings = [
        { key: "discordLink", value: "https://discord.gg/WHRzebh8pz" },
        { key: "whatsapp", value: "+62 821-2780-6072" },
        {
          key: "discordUsers",
          value: [{ name: "bluemask22", link: "https://discord.com/users/980636376691249152" }],
        },
      ];
      for (const s of defaultSettings) {
        await client.query(`INSERT INTO store_settings (key, value) VALUES ($1, $2)`, [
          s.key,
          JSON.stringify(s.value),
        ]);
      }
    }

    console.log("Database seeding finished.");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.end();
  }
}

seedDatabase();
