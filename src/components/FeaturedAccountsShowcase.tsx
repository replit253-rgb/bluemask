import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { products, type Product } from "@/lib/products";
import { getProductsFromDB } from "@/lib/db";
import {
  getFeaturedAccountsConfig,
  getDisplayFeaturedProducts,
  type FeaturedAccountsConfig,
  DEFAULT_FEATURED_ACCOUNTS_CONFIG,
} from "@/lib/featured-accounts";
import { ProductGrid } from "@/components/Products";

export function FeaturedAccountsShowcase() {
  const [config, setConfig] = useState<FeaturedAccountsConfig>(() => getFeaturedAccountsConfig());
  const [, setAllProducts] = useState<Product[]>([]);
  const [displayItems, setDisplayItems] = useState<Product[]>([]);

  const refreshData = async () => {
    const currentConfig = getFeaturedAccountsConfig();
    setConfig(currentConfig);

    const itemsFromDB = await getProductsFromDB();
    const activeProducts = itemsFromDB && itemsFromDB.length > 0 ? itemsFromDB : products;
    setAllProducts(activeProducts);

    const filtered = await getDisplayFeaturedProducts(activeProducts, currentConfig);
    setDisplayItems(filtered);
  };

  useEffect(() => {
    refreshData();

    const handleConfigChange = () => refreshData();
    window.addEventListener("featured-accounts-changed", handleConfigChange);
    window.addEventListener("products-changed", handleConfigChange);

    return () => {
      window.removeEventListener("featured-accounts-changed", handleConfigChange);
      window.removeEventListener("products-changed", handleConfigChange);
    };
  }, []);

  const linkTarget = config.linkUrl || "/accounts";

  return (
    <section id="accounts" className="bm-section--full">
      <div className="bm-section-head">
        <div>
          <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
            {config.eyebrow || DEFAULT_FEATURED_ACCOUNTS_CONFIG.eyebrow}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {config.title || DEFAULT_FEATURED_ACCOUNTS_CONFIG.title}
          </h2>
        </div>
        <Link className="bm-text-link" to={linkTarget} search={{}}>
          {config.linkText || DEFAULT_FEATURED_ACCOUNTS_CONFIG.linkText}{" "}
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <ProductGrid items={displayItems} />

      <div className="mt-8 text-center md:hidden">
        <Link className="bm-btn bm-btn-outline w-full" to={linkTarget} search={{}}>
          {config.linkText || DEFAULT_FEATURED_ACCOUNTS_CONFIG.linkText}{" "}
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
