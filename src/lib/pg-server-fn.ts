import { createServerFn } from "@tanstack/react-start";
import { queryPostgres } from "./pg-server";

export const getProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await queryPostgres("SELECT * FROM products ORDER BY code DESC");
    return res.rows.map((row: Record<string, unknown>) => ({
      code: row.code as string,
      game: row.game as string,
      title: row.title as string,
      badge: (row.badge as string) || undefined,
      price: Number(row.price),
      status: row.status as string,
      image: (row.image as string) || undefined,
      screenshots: (row.screenshots as string[]) || [],
      description: (row.description as string) || undefined,
      server: (row.server as string) || undefined,
      stats: (row.stats as Record<string, string>) || {},
      highlights: (row.highlights as string[]) || [],
    }));
  } catch {
    return [];
  }
});

export const saveProductFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
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
      await queryPostgres(
        `INSERT INTO products (code, game, title, badge, price, status, image, screenshots, description, server, stats, highlights)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (code) DO UPDATE SET
           game = EXCLUDED.game,
           title = EXCLUDED.title,
           badge = EXCLUDED.badge,
           price = EXCLUDED.price,
           status = EXCLUDED.status,
           image = EXCLUDED.image,
           screenshots = EXCLUDED.screenshots,
           description = EXCLUDED.description,
           server = EXCLUDED.server,
           stats = EXCLUDED.stats,
           highlights = EXCLUDED.highlights`,
        [
          code,
          game,
          title,
          badge || null,
          price,
          status || "tersedia",
          image || null,
          screenshots || [],
          description || null,
          server || null,
          JSON.stringify(stats || {}),
          highlights || [],
        ],
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    try {
      await queryPostgres("DELETE FROM products WHERE code = $1", [data.code]);
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const getTopupsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await queryPostgres("SELECT * FROM topups ORDER BY code DESC");
    return res.rows.map((row: Record<string, unknown>) => ({
      code: row.code as string,
      game: row.game as string,
      name: row.name as string,
      detail: (row.detail as string) || undefined,
      price: Number(row.price),
      image: (row.image as string) || undefined,
    }));
  } catch {
    return [];
  }
});

export const saveTopupFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
      const { code, game, name, detail, price, image } = data;
      await queryPostgres(
        `INSERT INTO topups (code, game, name, detail, price, image)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (code) DO UPDATE SET
           game = EXCLUDED.game,
           name = EXCLUDED.name,
           detail = EXCLUDED.detail,
           price = EXCLUDED.price,
           image = EXCLUDED.image`,
        [code, game, name, detail || null, price, image || null],
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const deleteTopupFn = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    try {
      await queryPostgres("DELETE FROM topups WHERE code = $1", [data.code]);
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const getPageFn = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    try {
      const res = await queryPostgres("SELECT * FROM pages WHERE slug = $1", [data.slug]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          slug: row.slug as string,
          title: row.title as string,
          heroTitle: row.hero_title as string,
          heroSubtitle: (row.hero_subtitle as string) || "",
          heroImage: (row.hero_image as string) || "",
          leadText: (row.lead_text as string) || "",
          announcement: (row.announcement as string) || "",
          updatedAt: (row.updated_at as string) || new Date().toISOString(),
        };
      }
      return null;
    } catch {
      return null;
    }
  });

export const savePageFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
      const { slug, title, heroTitle, heroSubtitle, heroImage, leadText, announcement } = data;
      await queryPostgres(
        `INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_image, lead_text, announcement, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           hero_title = EXCLUDED.hero_title,
           hero_subtitle = EXCLUDED.hero_subtitle,
           hero_image = EXCLUDED.hero_image,
           lead_text = EXCLUDED.lead_text,
           announcement = EXCLUDED.announcement,
           updated_at = NOW()`,
        [
          slug,
          title,
          heroTitle,
          heroSubtitle || null,
          heroImage || null,
          leadText || null,
          announcement || null,
        ],
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const getGameWorldsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await queryPostgres("SELECT * FROM game_worlds ORDER BY sort_order ASC, id ASC");
    if (res.rows.length > 0) {
      const cards = res.rows.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        slug: row.slug as string,
        name: row.name as string,
        genre: row.genre as string,
        image: row.image as string,
        imageAlt: row.image_alt as string,
        number: row.number_code as string,
        services: (row.services as string[]) || [],
        accountPoints: (row.account_points as string[]) || [],
      }));
      const settingsRes = await queryPostgres(
        "SELECT value FROM store_settings WHERE key = 'game_worlds_header'",
      );
      const header = (settingsRes.rows[0]?.value as Record<string, unknown>) || {
        eyebrow: "THE COLLECTION",
        title: "Accounts for Sale",
        subtitle: "Four worlds. Your next adventure.",
      };
      return { ...header, cards };
    }
    return null;
  } catch {
    return null;
  }
});

export const saveGameWorldsFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
      const { eyebrow, title, subtitle, cards } = data;

      await queryPostgres(
        `INSERT INTO store_settings (key, value)
         VALUES ('game_worlds_header', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify({ eyebrow, title, subtitle })],
      );

      if (Array.isArray(cards)) {
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          await queryPostgres(
            `INSERT INTO game_worlds (id, slug, name, genre, image, image_alt, number_code, services, account_points, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE SET
               slug = EXCLUDED.slug,
               name = EXCLUDED.name,
               genre = EXCLUDED.genre,
               image = EXCLUDED.image,
               image_alt = EXCLUDED.image_alt,
               number_code = EXCLUDED.number_code,
               services = EXCLUDED.services,
               account_points = EXCLUDED.account_points,
               sort_order = EXCLUDED.sort_order`,
            [
              card.id,
              card.slug,
              card.name,
              card.genre || "",
              card.image || "",
              card.imageAlt || "",
              card.number || "",
              card.services || [],
              card.accountPoints || [],
              i,
            ],
          );
        }
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const getHomeGamesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await queryPostgres("SELECT * FROM home_games ORDER BY sort_order ASC, id ASC");
    if (res.rows.length > 0) {
      const cards = res.rows.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        slug: row.slug as string,
        name: row.name as string,
        genre: row.genre as string,
        image: row.image as string,
        imageAlt: row.image_alt as string,
        actionText: row.action_text as string,
        linkUrl: row.link_url as string,
      }));
      const settingsRes = await queryPostgres(
        "SELECT value FROM store_settings WHERE key = 'home_games_header'",
      );
      const header = (settingsRes.rows[0]?.value as Record<string, unknown>) || {
        eyebrow: "Games",
        title: "Choose your Game",
        linkText: "All games",
        linkUrl: "/games",
      };
      return { ...header, cards };
    }
    return null;
  } catch {
    return null;
  }
});

export const saveHomeGamesFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
      const { eyebrow, title, linkText, linkUrl, cards } = data;

      await queryPostgres(
        `INSERT INTO store_settings (key, value)
         VALUES ('home_games_header', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify({ eyebrow, title, linkText, linkUrl })],
      );

      if (Array.isArray(cards)) {
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          await queryPostgres(
            `INSERT INTO home_games (id, slug, name, genre, image, image_alt, action_text, link_url, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               slug = EXCLUDED.slug,
               name = EXCLUDED.name,
               genre = EXCLUDED.genre,
               image = EXCLUDED.image,
               image_alt = EXCLUDED.image_alt,
               action_text = EXCLUDED.action_text,
               link_url = EXCLUDED.link_url,
               sort_order = EXCLUDED.sort_order`,
            [
              card.id,
              card.slug,
              card.name,
              card.genre || "",
              card.image || "",
              card.imageAlt || "",
              card.actionText || "",
              card.linkUrl || "",
              i,
            ],
          );
        }
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  });

export const getFaqsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await queryPostgres("SELECT * FROM faqs ORDER BY id ASC");
    return res.rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      question: row.question as string,
      answer: row.answer as string,
    }));
  } catch {
    return [];
  }
});

export const getFeaturedAccountsConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await queryPostgres(
      "SELECT value FROM store_settings WHERE key = 'featured_accounts_config'",
    );
    if (res.rows.length > 0) {
      return res.rows[0].value as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
});

export const saveFeaturedAccountsConfigFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    try {
      await queryPostgres(
        `INSERT INTO store_settings (key, value)
         VALUES ('featured_accounts_config', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify(data)],
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  });
