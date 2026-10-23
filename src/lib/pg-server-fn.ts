import { createServerFn } from "@tanstack/react-start";
import { queryPostgres } from "./pg-server";

export const getProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  const res = await queryPostgres("SELECT * FROM products ORDER BY code DESC");
  return res.rows.map((row: any) => ({
    code: row.code as string,
    game: row.game as string,
    title: row.title as string,
    badge: row.badge,
    price: Number(row.price),
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
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const { code, game, title, badge, price, status, image, screenshots, description, server, stats, highlights } = data;
    const res = await queryPostgres(
      `INSERT INTO products (code, game, title, badge, price, status, image, screenshots, description, server, stats, highlights)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (code) DO UPDATE SET
         game = EXCLUDED.game, title = EXCLUDED.title, badge = EXCLUDED.badge, price = EXCLUDED.price,
         status = EXCLUDED.status, image = EXCLUDED.image, screenshots = EXCLUDED.screenshots,
         description = EXCLUDED.description, server = EXCLUDED.server, stats = EXCLUDED.stats, highlights = EXCLUDED.highlights`,
      [code, game, title, badge, price, status, image, screenshots, description, server, JSON.stringify(stats), highlights]
    );
    if (res.rowCount === 0) throw new Error("Failed to save product");
    return { success: true };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const res = await queryPostgres("DELETE FROM products WHERE code = $1", [data.code]);
    if (res.rowCount === 0) throw new Error("Product not found");
    return { success: true };
  });

export const getTopupsFn = createServerFn({ method: "GET" }).handler(async () => {
  const res = await queryPostgres("SELECT * FROM topups ORDER BY code DESC");
  return res.rows.map((row: any) => ({
    code: row.code as string,
    game: row.game as string,
    name: row.name as string,
    detail: row.detail,
    price: Number(row.price),
    image: row.image,
  }));
});

export const saveTopupFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const { code, game, name, detail, price, image } = data;
    const res = await queryPostgres(
      `INSERT INTO topups (code, game, name, detail, price, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO UPDATE SET
         game = EXCLUDED.game, name = EXCLUDED.name, detail = EXCLUDED.detail, price = EXCLUDED.price, image = EXCLUDED.image`,
      [code, game, name, detail, price, image]
    );
    if (res.rowCount === 0) throw new Error("Failed to save topup");
    return { success: true };
  });

export const deleteTopupFn = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const res = await queryPostgres("DELETE FROM topups WHERE code = $1", [data.code]);
    if (res.rowCount === 0) throw new Error("Topup not found");
    return { success: true };
  });

export const getPageFn = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const res = await queryPostgres("SELECT * FROM pages WHERE slug = $1", [data.slug]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      slug: row.slug,
      title: row.title,
      heroTitle: row.hero_title,
      heroSubtitle: row.hero_subtitle,
      heroImage: row.hero_image,
      leadText: row.lead_text,
      announcement: row.announcement,
      updatedAt: row.updated_at,
    };
  });

export const savePageFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const { slug, title, heroTitle, heroSubtitle, heroImage, leadText, announcement } = data;
    await queryPostgres(
      `INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_image, lead_text, announcement, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title, hero_title = EXCLUDED.hero_title, hero_subtitle = EXCLUDED.hero_subtitle,
         hero_image = EXCLUDED.hero_image, lead_text = EXCLUDED.lead_text, announcement = EXCLUDED.announcement, updated_at = NOW()`,
      [slug, title, heroTitle, heroSubtitle, heroImage, leadText, announcement]
    );
    return { success: true };
  });

export const getGameWorldsFn = createServerFn({ method: "GET" }).handler(async () => {
  const res = await queryPostgres("SELECT * FROM game_worlds ORDER BY sort_order ASC, id ASC");
  const settingsRes = await queryPostgres("SELECT value FROM store_settings WHERE key = 'game_worlds_header'");
  const header = (settingsRes.rows[0]?.value as any) || {};
  return {
    ...header,
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
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const { eyebrow, title, subtitle, cards } = data;
    await queryPostgres(
      `INSERT INTO store_settings (key, value) VALUES ('game_worlds_header', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify({ eyebrow, title, subtitle })]
    );
    await queryPostgres("DELETE FROM game_worlds");
    if (Array.isArray(cards)) {
      for (const card of cards) {
        await queryPostgres(
          `INSERT INTO game_worlds (id, slug, name, genre, image, image_alt, number_code, services, account_points, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [card.id, card.slug, card.name, card.genre, card.image, card.imageAlt, card.number, card.services, card.accountPoints, card.sortOrder]
        );
      }
    }
    return { success: true };
  });

export const getHomeGamesFn = createServerFn({ method: "GET" }).handler(async () => {
  const res = await queryPostgres("SELECT * FROM home_games ORDER BY sort_order ASC, id ASC");
  const settingsRes = await queryPostgres("SELECT value FROM store_settings WHERE key = 'home_games_header'");
  const header = (settingsRes.rows[0]?.value as any) || {};
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
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const { eyebrow, title, linkText, linkUrl, cards } = data;
    await queryPostgres(
      `INSERT INTO store_settings (key, value) VALUES ('home_games_header', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify({ eyebrow, title, linkText, linkUrl })]
    );
    await queryPostgres("DELETE FROM home_games");
    if (Array.isArray(cards)) {
      for (const card of cards) {
        await queryPostgres(
          `INSERT INTO home_games (id, slug, name, genre, image, image_alt, action_text, link_url, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [card.id, card.slug, card.name, card.genre, card.image, card.imageAlt, card.actionText, card.linkUrl, card.sortOrder]
        );
      }
    }
    return { success: true };
  });

export const getFaqsFn = createServerFn({ method: "GET" }).handler(async () => {
  const res = await queryPostgres("SELECT * FROM faqs ORDER BY id ASC");
  return res.rows.map((row: any) => ({ id: row.id, question: row.question, answer: row.answer }));
});

export const getFeaturedAccountsConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  const res = await queryPostgres("SELECT value FROM store_settings WHERE key = 'featured_accounts_config'");
  return res.rows.length > 0 ? res.rows[0].value : null;
});

export const saveFeaturedAccountsConfigFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    await queryPostgres(
      `INSERT INTO store_settings (key, value) VALUES ('featured_accounts_config', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [JSON.stringify(data)]
    );
    return { success: true };
  });
