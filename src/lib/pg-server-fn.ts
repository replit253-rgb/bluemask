import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PUBLIC_READ_KEYS = [
  "discordLink",
  "discordUsers",
  "whatsapp",
  "game_worlds_header",
  "home_games_header",
  "featured_accounts_config",
  "site_config",
];

const WRITABLE_KEYS = [
  "discordLink",
  "discordUsers",
  "whatsapp",
  "game_worlds_header",
  "home_games_header",
  "featured_accounts_config",
  "site_config",
  "admin_notification_email",
];

// --- Schemas ---
const StoreKeyEnum = z.enum([
  "discordLink",
  "discordUsers",
  "whatsapp",
  "game_worlds_header",
  "home_games_header",
  "featured_accounts_config",
  "site_config",
  "admin_notification_email",
]);

const ProductSchema = z.object({
  code: z.string().max(255),
  game: z.string().max(255),
  title: z.string().max(255),
  badge: z.string().max(100).optional().nullable(),
  price: z.number().min(0),
  discountPercent: z.number().optional(),
  hasDiscount: z.boolean().optional(),
  status: z.string().max(50).optional().nullable(),
  image: z.string().max(1000).optional().nullable(),
  screenshots: z.array(z.string().max(1000)).optional(),
  description: z.string().max(10000).optional().nullable(),
  server: z.string().max(255).optional().nullable(),
  stats: z.any().optional(), // JSONB
  highlights: z.array(z.string().max(1000)).optional(),
});

const TopupSchema = z.object({
  code: z.string().max(255),
  game: z.string().max(255),
  name: z.string().max(255),
  detail: z.string().max(1000).optional().nullable(),
  price: z.number().min(0),
  image: z.string().max(1000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  popular: z.boolean().optional(),
  sort_order: z.number().optional(),
  description: z.string().max(2000).optional().nullable(),
  features: z.array(z.string().max(1000)).optional(),
  instructions: z.string().max(2000).optional().nullable(),
  deliveryTime: z.string().max(255).optional().nullable(),
  hasDiscount: z.boolean().optional(),
  discountPercent: z.number().int().min(1).max(99).optional().nullable(),
  diamonds: z.number().int().min(0).optional().nullable(),
});

const ServiceSchema = z.object({
  slug: z.string().max(255),
  name: z.string().max(255),
  tagline: z.string().max(255),
  intro: z.string().max(2000),
  steps: z.array(
    z.object({
      title: z.string().max(255),
      text: z.string().max(1000),
    }),
  ),
  image: z.string().max(1000).optional().nullable(),
  sort_order: z.number().optional(),
  gameSlugs: z.array(z.string().max(255)).optional(),
  checklist: z.array(z.string().max(1000)).optional(),
  fee: z.string().max(255).optional(),
});

const TestimonialSchema = z.object({
  id: z.string().max(255),
  service: z.string().max(255),
  game: z.string().max(255),
  name: z.string().max(255),
  role: z.enum(["Buyer", "Seller"]),
  quote: z.string().max(2000),
  date: z.string().max(255),
  image: z.string().max(1000).optional().nullable(),
});

const FaqSchema = z.object({
  id: z.string().max(255),
  question: z.string().max(500),
  answer: z.string().max(2000),
});

const PageSchema = z.object({
  slug: z.string().max(255),
  title: z.string().max(255),
  heroTitle: z.string().max(255).optional().nullable(),
  heroSubtitle: z.string().max(500).optional().nullable(),
  heroImage: z.string().max(1000).optional().nullable(),
  heroImageMobile: z.string().max(1000).optional().nullable(),
  leadText: z.string().max(2000).optional().nullable(),
  announcement: z.string().max(1000).optional().nullable(),
  buttonText: z.string().max(255).optional().nullable(),
  buttonLink: z.string().max(1000).optional().nullable(),
  secondaryButtonText: z.string().max(255).optional().nullable(),
  secondaryButtonLink: z.string().max(1000).optional().nullable(),
  sectionTitle: z.string().max(255).optional().nullable(),
  sectionSubtitle: z.string().max(1000).optional().nullable(),
});

const GameWorldCardSchema = z.object({
  id: z.string().max(255),
  slug: z.string().max(255),
  name: z.string().max(255),
  genre: z.string().max(255).optional().nullable(),
  image: z.string().max(1000).optional().nullable(),
  imageAlt: z.string().max(255).optional().nullable(),
  number: z.string().max(50).optional().nullable(),
  services: z.any().optional(), // JSONB
  accountPoints: z.any().optional(), // JSONB
  sort_order: z.number().optional(),
});

const GameWorldsDataSchema = z.object({
  eyebrow: z.string().max(255).optional().nullable(),
  title: z.string().max(255).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  cards: z.array(GameWorldCardSchema),
});

const HomeGameCardSchema = z.object({
  id: z.string().max(255),
  slug: z.string().max(255),
  name: z.string().max(255),
  genre: z.string().max(255).optional().nullable(),
  image: z.string().max(1000).optional().nullable(),
  imageAlt: z.string().max(255).optional().nullable(),
  actionText: z.string().max(100).optional().nullable(),
  linkUrl: z.string().max(1000).optional().nullable(),
  sort_order: z.number().optional(),
});

const HomeGamesDataSchema = z.object({
  eyebrow: z.string().max(255).optional().nullable(),
  title: z.string().max(255).optional().nullable(),
  linkText: z.string().max(100).optional().nullable(),
  linkUrl: z.string().max(1000).optional().nullable(),
  cards: z.array(HomeGameCardSchema),
});

const TrustSafetyCardSchema = z.object({
  id: z.string().min(1).max(255),
  title: z.string().max(255),
  description: z.string().max(2000),
  icon: z.enum(["shield", "lock", "zap"]),
});

const TrustSafetyDataSchema = z.object({
  eyebrow: z.string().max(255),
  title: z.string().max(255),
  cards: z.array(TrustSafetyCardSchema).max(20),
});

const FeaturedAccountsConfigSchema = z.object({
  title: z.string().max(255).optional().nullable(),
  subtitle: z.string().max(500).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  items: z
    .array(
      z.object({
        id: z.string().max(255),
        name: z.string().max(255),
        image: z.string().max(1000).optional().nullable(),
        price: z.number().optional(),
        badge: z.string().max(100).optional().nullable(),
        highlights: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

const DeleteIdSchema = z.object({
  id: z.string().max(255),
});

const DeleteCodeSchema = z.object({
  code: z.string().max(255),
});

const DeleteSlugSchema = z.object({
  slug: z.string().max(255),
});

// --- Products ---
export const getProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres("SELECT * FROM products ORDER BY code DESC");
  return res.rows.map((row: any) => ({
    code: row.code as string,
    game: row.game as string,
    title: row.title as string,
    badge: row.badge,
    price: Number(row.price),
    discountPercent: row.discount_percent ?? undefined,
    hasDiscount: row.has_discount ?? false,
    status: row.status,
    image: row.image,
    screenshots: row.screenshots || [],
    description: row.description,
    server: row.server,
    stats: row.stats,
    highlights: row.highlights || [],
  }));
});

export const saveProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ProductSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const {
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
    } = data;
    const res = await queryPostgres(
      `INSERT INTO products (code, game, title, badge, price, status, discount_percent, has_discount, image, screenshots, description, server, stats, highlights)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (code) DO UPDATE SET
         game = EXCLUDED.game, title = EXCLUDED.title, badge = EXCLUDED.badge, price = EXCLUDED.price,
         discount_percent = EXCLUDED.discount_percent, has_discount = EXCLUDED.has_discount,
         status = EXCLUDED.status, image = EXCLUDED.image, screenshots = EXCLUDED.screenshots,
         description = EXCLUDED.description, server = EXCLUDED.server, stats = EXCLUDED.stats, highlights = EXCLUDED.highlights
       RETURNING *`,
      [
        code,
        game,
        title,
        badge,
        price,
        status,
        data.discountPercent,
        data.hasDiscount ?? false,
        image,
        screenshots || [],
        description,
        server,
        JSON.stringify(stats || {}),
        highlights || [],
      ],
    );
    return res.rows[0];
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => DeleteCodeSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const res = await queryPostgres("DELETE FROM products WHERE code = $1", [data.code]);
    return { rowCount: res.rowCount };
  });

// --- Top-Ups ---
export const getTopupsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres("SELECT * FROM topups ORDER BY sort_order ASC, code DESC");
  return res.rows.map((row: any) => ({
    code: row.code as string,
    game: row.game as string,
    name: row.name as string,
    detail: row.detail,
    price: Number(row.price),
    image:
      typeof row.image === "string" && row.image.startsWith("/src/assets/images/")
        ? undefined
        : row.image,
    category: row.category,
    popular: row.popular,
    sort_order: row.sort_order,
    description: row.description,
    features: row.features || [],
    instructions: row.instructions,
    deliveryTime: row.delivery_time,
    hasDiscount: row.has_discount ?? false,
    discountPercent: row.discount_percent ?? undefined,
    diamonds: row.diamonds ?? undefined,
  }));
});

export const saveTopupFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => TopupSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const {
      code,
      game,
      name,
      detail,
      price,
      image,
      category,
      popular,
      sort_order,
      description,
      features,
      instructions,
      deliveryTime,
      hasDiscount,
      discountPercent,
      diamonds,
    } = data;
    const res = await queryPostgres(
      `INSERT INTO topups (code, game, name, detail, price, image, category, popular, sort_order, description, features, instructions, delivery_time, has_discount, discount_percent, diamonds)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (code) DO UPDATE SET
         game = EXCLUDED.game, name = EXCLUDED.name, detail = EXCLUDED.detail, price = EXCLUDED.price, 
         image = EXCLUDED.image, category = EXCLUDED.category, popular = EXCLUDED.popular,
         sort_order = EXCLUDED.sort_order, description = EXCLUDED.description,
         features = EXCLUDED.features, instructions = EXCLUDED.instructions,
         delivery_time = EXCLUDED.delivery_time, has_discount = EXCLUDED.has_discount,
         discount_percent = EXCLUDED.discount_percent, diamonds = EXCLUDED.diamonds
       RETURNING *`,
      [
        code,
        game,
        name,
        detail,
        price,
        image,
        category,
        popular || false,
        sort_order || 0,
        description,
        features || [],
        instructions,
        deliveryTime,
        hasDiscount || false,
        hasDiscount ? discountPercent : null,
        diamonds ?? null,
      ],
    );
    return res.rows[0];
  });

export const deleteTopupFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => DeleteCodeSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const res = await queryPostgres("DELETE FROM topups WHERE code = $1", [data.code]);
    return { rowCount: res.rowCount };
  });

// --- Services ---
export const getServicesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres("SELECT * FROM services ORDER BY sort_order ASC");
  return res.rows.map((row) => ({
    slug: row.slug,
    name: row.name ?? row.title,
    tagline: row.tagline ?? "",
    intro: row.intro ?? row.description ?? "",
    steps: row.steps || [],
    image: row.image,
    sort_order: row.sort_order,
    gameSlugs: row.game_slugs || undefined,
    checklist: row.checklist || undefined,
    fee: row.fee || undefined,
  }));
});

export const saveServiceFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ServiceSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const { slug, name, tagline, intro, steps, image, sort_order, gameSlugs, checklist, fee } =
      data;
    const res = await queryPostgres(
      `INSERT INTO services (slug, name, tagline, intro, steps, image, sort_order, game_slugs, checklist, fee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, tagline = EXCLUDED.tagline, intro = EXCLUDED.intro, 
         steps = EXCLUDED.steps, image = EXCLUDED.image, sort_order = EXCLUDED.sort_order,
         game_slugs = EXCLUDED.game_slugs, checklist = EXCLUDED.checklist, fee = EXCLUDED.fee
       RETURNING *`,
      [
        slug,
        name,
        tagline,
        intro,
        JSON.stringify(steps),
        image,
        sort_order || 0,
        gameSlugs || null,
        checklist || null,
        fee || null,
      ],
    );
    return res.rows[0];
  });

export const deleteServiceFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => DeleteSlugSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const res = await queryPostgres("DELETE FROM services WHERE slug = $1", [data.slug]);
    return { rowCount: res.rowCount };
  });

// --- Testimonials ---
export const getTestimonialsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres("SELECT * FROM testimonials ORDER BY created_at DESC");
  return res.rows.map((row) => ({
    id: row.id,
    service: row.service,
    game: row.game,
    name: row.name,
    role: row.role,
    quote: row.quote,
    date: row.date,
    image: row.image,
    created_at: row.created_at,
  }));
});

export const saveTestimonialFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => TestimonialSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const { id, service, game, name, role, quote, date, image } = data;
    const res = await queryPostgres(
      `INSERT INTO testimonials (id, service, game, name, role, quote, date, image, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id) DO UPDATE SET
         service = EXCLUDED.service, game = EXCLUDED.game, name = EXCLUDED.name, 
         role = EXCLUDED.role, quote = EXCLUDED.quote, date = EXCLUDED.date, image = EXCLUDED.image,
         created_at = COALESCE(testimonials.created_at, NOW())
       RETURNING *`,
      [id, service, game, name, role, quote, date, image],
    );
    return res.rows[0];
  });

export const deleteTestimonialFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => DeleteIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const res = await queryPostgres("DELETE FROM testimonials WHERE id = $1", [data.id]);
    return { rowCount: res.rowCount };
  });

// --- Admin credentials ---
const AdminLoginSchema = z.object({
  username: z.string().max(255),
  password: z.string().min(1).max(128),
});

const ChangeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });

export const verifyAdminLoginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => AdminLoginSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const { isLegacyAdminPassword, verifyAdminPassword } = await import("./admin-auth");
    const validUsername = ["admin", "admin@gmail.com"].includes(data.username.trim().toLowerCase());
    if (!validUsername) return { authenticated: false };

    const result = await queryPostgres("SELECT value FROM store_settings WHERE key = $1", [
      "admin_password_hash",
    ]);
    const stored = result.rows[0]?.value;
    const authenticated =
      stored && typeof stored === "object" && !Array.isArray(stored)
        ? verifyAdminPassword(data.password, stored)
        : isLegacyAdminPassword(data.password);
    return { authenticated };
  });

export const changeAdminPasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ChangeAdminPasswordSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const { hashAdminPassword, isLegacyAdminPassword, verifyAdminPassword } =
      await import("./admin-auth");
    const result = await queryPostgres("SELECT value FROM store_settings WHERE key = $1", [
      "admin_password_hash",
    ]);
    const stored = result.rows[0]?.value;
    const currentPasswordValid =
      stored && typeof stored === "object" && !Array.isArray(stored)
        ? verifyAdminPassword(data.currentPassword, stored)
        : isLegacyAdminPassword(data.currentPassword);

    if (!currentPasswordValid) {
      throw new Error("Current password is incorrect.");
    }

    const passwordHash = hashAdminPassword(data.newPassword);
    await queryPostgres(
      `INSERT INTO store_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      ["admin_password_hash", JSON.stringify(passwordHash)],
    );
    return { success: true };
  });

// --- FAQs ---
export const getFaqsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres("SELECT * FROM faqs ORDER BY id ASC");
  return res.rows.map((row: any) => ({ id: row.id, question: row.question, answer: row.answer }));
});

export const saveFaqFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => FaqSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const { id, question, answer } = data;
    const res = await queryPostgres(
      `INSERT INTO faqs (id, question, answer)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         question = EXCLUDED.question, answer = EXCLUDED.answer
       RETURNING *`,
      [id, question, answer],
    );
    return res.rows[0];
  });

export const deleteFaqFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => DeleteIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const res = await queryPostgres("DELETE FROM faqs WHERE id = $1", [data.id]);
    return { rowCount: res.rowCount };
  });

// --- Store Settings ---
export const getStoreSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres("SELECT * FROM store_settings");
  const settings: Record<string, any> = {};
  res.rows.forEach((row) => {
    if (PUBLIC_READ_KEYS.includes(row.key) && row.key !== "site_config") {
      settings[row.key] = row.value;
    }
  });
  const config = res.rows.find((row) => row.key === "site_config")?.value;
  if (config && typeof config === "object" && !Array.isArray(config)) {
    Object.assign(settings, config);
  }
  return settings;
});

export const saveStoreSettingsFn = createServerFn({ method: "POST" })
  .validator((data: { key: string; value: any }) => {
    const validatedKey = StoreKeyEnum.parse(data.key);
    if (!WRITABLE_KEYS.includes(validatedKey)) {
      throw new Error(`Key ${validatedKey} is not writable`);
    }
    return { key: validatedKey, value: data.value };
  })
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const res = await queryPostgres(
      `INSERT INTO store_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
       RETURNING *`,
      [data.key, JSON.stringify(data.value)],
    );
    return res.rows[0];
  });

// --- Pages ---
export const getPageFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => DeleteSlugSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const res = await queryPostgres("SELECT * FROM pages WHERE slug = $1", [data.slug]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      slug: row.slug,
      title: row.title,
      heroTitle: row.hero_title,
      heroSubtitle: row.hero_subtitle,
      heroImage: row.hero_image,
      heroImageMobile: row.hero_image_mobile,
      leadText: row.lead_text,
      announcement: row.announcement,
      buttonText: row.button_text,
      buttonLink: row.button_link,
      secondaryButtonText: row.secondary_button_text,
      secondaryButtonLink: row.secondary_button_link,
      sectionTitle: row.section_title,
      sectionSubtitle: row.section_subtitle,
      updatedAt: row.updated_at,
    };
  });

export const savePageFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => PageSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    const {
      slug,
      title,
      heroTitle,
      heroSubtitle,
      heroImage,
      heroImageMobile,
      leadText,
      announcement,
      buttonText,
      buttonLink,
      secondaryButtonText,
      secondaryButtonLink,
      sectionTitle,
      sectionSubtitle,
    } = data;
    const res = await queryPostgres(
      `INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_image, hero_image_mobile, lead_text, announcement, button_text, button_link, secondary_button_text, secondary_button_link, section_title, section_subtitle, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title, hero_title = EXCLUDED.hero_title, hero_subtitle = EXCLUDED.hero_subtitle,
         hero_image = EXCLUDED.hero_image, hero_image_mobile = EXCLUDED.hero_image_mobile,
         lead_text = EXCLUDED.lead_text, announcement = EXCLUDED.announcement,
         button_text = EXCLUDED.button_text, button_link = EXCLUDED.button_link,
         secondary_button_text = EXCLUDED.secondary_button_text,
         secondary_button_link = EXCLUDED.secondary_button_link,
         section_title = EXCLUDED.section_title, section_subtitle = EXCLUDED.section_subtitle,
         updated_at = NOW()
       RETURNING *`,
      [
        slug,
        title,
        heroTitle,
        heroSubtitle,
        heroImage,
        heroImageMobile,
        leadText,
        announcement,
        buttonText,
        buttonLink,
        secondaryButtonText,
        secondaryButtonLink,
        sectionTitle,
        sectionSubtitle,
      ],
    );
    return res.rows[0];
  });

// --- Game Worlds & Home Games ---
export const getGameWorldsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres("SELECT * FROM game_worlds ORDER BY sort_order ASC, id ASC");
  const settingsRes = await queryPostgres(
    "SELECT value FROM store_settings WHERE key = 'game_worlds_header'",
  );
  const header = settingsRes.rows[0]?.value || {};
  return {
    ...header,
    configured: Boolean(settingsRes.rows[0]),
    cards: res.rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      genre: row.genre,
      image: row.image,
      imageAlt: row.image_alt,
      number: row.number_code,
      services: row.services,
      accountPoints: row.account_points,
    })),
  };
});

export const saveGameWorldsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => GameWorldsDataSchema.parse(data))
  .handler(async ({ data }) => {
    const { getPgPool } = await import("./pg-server");
    const pool = getPgPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const { eyebrow, title, subtitle, cards } = data;

      await client.query(
        `INSERT INTO store_settings (key, value) VALUES ('game_worlds_header', $1) 
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify({ eyebrow, title, subtitle })],
      );

      await client.query("DELETE FROM game_worlds");

      if (Array.isArray(cards)) {
        for (const [index, card] of cards.entries()) {
          await client.query(
            `INSERT INTO game_worlds (id, slug, name, genre, image, image_alt, number_code, services, account_points, sort_order) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              card.id,
              card.slug,
              card.name,
              card.genre,
              card.image,
              card.imageAlt,
              card.number,
              JSON.stringify(card.services || {}),
              JSON.stringify(card.accountPoints || {}),
              index,
            ],
          );
        }
      }

      await client.query("COMMIT");
      return { success: true };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  });

export const getHomeGamesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres("SELECT * FROM home_games ORDER BY sort_order ASC, id ASC");
  const settingsRes = await queryPostgres(
    "SELECT value FROM store_settings WHERE key = 'home_games_header'",
  );
  const header = settingsRes.rows[0]?.value || {};
  return {
    ...header,
    cards: res.rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      genre: row.genre,
      image: row.image,
      imageAlt: row.image_alt,
      actionText: row.action_text,
      linkUrl: row.link_url,
    })),
  };
});

export const saveHomeGamesFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => HomeGamesDataSchema.parse(data))
  .handler(async ({ data }) => {
    const { getPgPool } = await import("./pg-server");
    const pool = getPgPool();
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const { eyebrow, title, linkText, linkUrl, cards } = data;

      await client.query(
        `INSERT INTO store_settings (key, value) VALUES ('home_games_header', $1) 
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify({ eyebrow, title, linkText, linkUrl })],
      );

      await client.query("DELETE FROM home_games");

      if (Array.isArray(cards)) {
        for (const card of cards) {
          await client.query(
            `INSERT INTO home_games (id, slug, name, genre, image, image_alt, action_text, link_url, sort_order) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              card.id,
              card.slug,
              card.name,
              card.genre,
              card.image,
              card.imageAlt,
              card.actionText,
              card.linkUrl,
              card.sort_order || 0,
            ],
          );
        }
      }

      await client.query("COMMIT");
      return { success: true };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  });

export const getTrustSafetyFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const result = await queryPostgres("SELECT value FROM store_settings WHERE key = $1", [
    "trust_safety_config",
  ]);
  return result.rows[0]?.value ?? null;
});

export const saveTrustSafetyFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => TrustSafetyDataSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    await queryPostgres(
      `INSERT INTO store_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      ["trust_safety_config", JSON.stringify(data)],
    );
    return { success: true };
  });

export const getFeaturedAccountsConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  const { queryPostgres } = await import("./pg-server");
  const res = await queryPostgres(
    "SELECT value FROM store_settings WHERE key = 'featured_accounts_config'",
  );
  return res.rows.length > 0 ? res.rows[0].value : null;
});

export const saveFeaturedAccountsConfigFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => FeaturedAccountsConfigSchema.parse(data))
  .handler(async ({ data }) => {
    const { queryPostgres } = await import("./pg-server");
    await queryPostgres(
      `INSERT INTO store_settings (key, value) VALUES ('featured_accounts_config', $1) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(data)],
    );
    return { success: true };
  });

// --- Media Uploads ---
export const uploadImageFn = createServerFn({ method: "POST" })
  .validator((data: { base64: string; fileName: string; contentType: string }) => data)
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const crypto = await import("node:crypto");

    const UPLOAD_DIR = process.env["UPLOAD_DIR"];
    if (!UPLOAD_DIR) {
      throw new Error("UPLOAD_DIR is required");
    }

    // Generic prefix removal
    const base64Data = data.base64.replace(/^data:[^;]+;base64,/, "");

    // 5MB Size limit check before Buffer.from
    const sizeInBytes =
      (base64Data.length * 3) / 4 -
      (base64Data.endsWith("==") ? 2 : base64Data.endsWith("=") ? 1 : 0);
    if (sizeInBytes > 5 * 1024 * 1024) {
      throw new Error("File size exceeds 5MB limit");
    }

    const buffer = Buffer.from(base64Data, "base64");

    // Magic Bytes Check
    const hex = buffer.slice(0, 4).toString("hex").toUpperCase();
    let ext = "";
    if (hex.startsWith("FFD8FF")) ext = ".jpg";
    else if (hex === "89504E47") ext = ".png";
    else if (hex === "47494638") ext = ".gif";
    else if (hex === "52494646" && buffer.slice(8, 12).toString() === "WEBP") ext = ".webp";
    else {
      throw new Error("Unsupported file type or invalid magic bytes");
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const hash = crypto.randomBytes(8).toString("hex");
    const safeName = `${Date.now()}-${hash}${ext}`;
    const filePath = path.join(UPLOAD_DIR, safeName);

    await fs.writeFile(filePath, buffer);

    const publicSiteUrl = process.env["PUBLIC_SITE_URL"]?.replace(/\/+$/, "");
    const uploadPath = `/uploads/${safeName}`;

    return { url: publicSiteUrl ? `${publicSiteUrl}${uploadPath}` : uploadPath };
  });
