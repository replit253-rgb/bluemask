import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { games } from "@/lib/catalog";
import { products, type Product } from "@/lib/products";
import { getStoredProducts } from "@/lib/admin-store";
import { getProductsFromDB } from "@/lib/db";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ProductGrid } from "@/components/Products";

type Search = { game?: string | undefined };

export const Route = createFileRoute("/accounts/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    game: typeof s["game"] === "string" ? s["game"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Accounts for Sale — BlueMask Gaming Store" },
      {
        name: "description",
        content:
          "Ready-to-play Whiteout Survival, Kingshot, Rise of Kingdoms, and Call of Dragons accounts. Pick one and order on Discord.",
      },
      { property: "og:title", content: "Accounts for Sale — BlueMask" },
      {
        property: "og:description",
        content: "Pick the strategy game account you want and order on Discord.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const { game } = Route.useSearch();
  const [productList, setProductList] = useState<Product[]>(() => getStoredProducts());

  useEffect(() => {
    getProductsFromDB().then((items) => {
      if (items && items.length > 0) {
        setProductList(items);
      }
    });
  }, []);

  const activeCatalog = productList.length > 0 ? productList : products;
  const items = game ? activeCatalog.filter((p) => p.game === game) : activeCatalog;
  return (
    <main className="bm">
      <SiteHeader />
      <section className="bm-detail-hero">
        <div className="bm-hero-meta bm-mono">
          <Link to="/">← Index</Link>
          <span>Accounts for Sale</span>
          <span>{items.length} listings</span>
        </div>
        <h1 className="bm-detail-title">
          Accounts<span>Ready to Play</span>
        </h1>
        <div className="bm-filters" role="tablist" aria-label="Filter by game">
          <Link to="/accounts" search={{}} className={!game ? "is-active" : ""}>
            All
          </Link>
          {games.map((g) => (
            <Link
              key={g.slug}
              to="/accounts"
              search={{ game: g.slug }}
              className={game === g.slug ? "is-active" : ""}
            >
              {g.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="bm-section">
        <p className="bm-sample-note">
          Sample listings only. Confirm current availability and prices on Discord.
        </p>
        <ProductGrid items={items} />
      </section>
      <SiteFooter />
    </main>
  );
}
