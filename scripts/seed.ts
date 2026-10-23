import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:EDUJUANDA12345@localhost:5432/BLUEMASK";

const initialProducts = [
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
];

const initialTopups = [
  {
    code: "WOS-PACK-1",
    game: "whiteout-survival",
    name: "Frost Star Pack",
    detail: "1,000 + 100 Gems & Speedups",
    price: 10,
    image: "/assets/game-whiteout.jpg",
  },
  {
    code: "KS-PACK-1",
    game: "kingshot",
    name: "Kingdom Star Pack",
    detail: "1,200 Gold & Resource Chests",
    price: 12,
    image: "/assets/game-kingshot.jpg",
  },
];

async function seedDatabase() {
  console.log("Connecting to PostgreSQL to seed database...");
  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL for seeding.");

    // Seed products
    for (const p of initialProducts) {
      await client.query(
        `INSERT INTO products (code, game, title, badge, price, status, image, screenshots, description, server, stats, highlights)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (code) DO UPDATE SET
           game = EXCLUDED.game,
           title = EXCLUDED.title,
           badge = EXCLUDED.badge,
           price = EXCLUDED.price,
           status = EXCLUDED.status,
           stats = EXCLUDED.stats,
           highlights = EXCLUDED.highlights`,
        [
          p.code,
          p.game,
          p.title,
          p.badge,
          p.price,
          p.status,
          null,
          [],
          null,
          null,
          JSON.stringify(p.stats),
          p.highlights,
        ],
      );
    }
    console.log(`Seeded ${initialProducts.length} products.`);

    // Seed topups
    for (const t of initialTopups) {
      await client.query(
        `INSERT INTO topups (code, game, name, detail, price, image)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO UPDATE SET
           game = EXCLUDED.game,
           name = EXCLUDED.name,
           detail = EXCLUDED.detail,
           price = EXCLUDED.price,
           image = EXCLUDED.image`,
        [t.code, t.game, t.name, t.detail, t.price, t.image],
      );
    }
    console.log(`Seeded ${initialTopups.length} topup packages.`);

    console.log("Database seeding completed successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    await client.end();
  }
}

seedDatabase();
