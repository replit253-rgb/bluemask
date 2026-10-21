import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ServiceCards } from "@/components/ServiceCards";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — BlueMask Gaming Store" },
      {
        name: "description",
        content:
          "Explore BlueMask game account trading, middleman support, and Whiteout Survival and Kingshot top ups.",
      },
      { property: "og:title", content: "Services — BlueMask Gaming Store" },
      {
        property: "og:description",
        content: "Account trading, middleman support and game top ups through BlueMask.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <main className="bm">
      <SiteHeader />
      <section className="bm-section">
        <span className="bm-eyebrow">WHAT WE DO</span>
        <h1 className="bm-page-title">A better way to trade.</h1>
        <p className="bm-lead">Find your account. Protect your deal. Power up your game.</p>
        <ServiceCards />
      </section>
      <SiteFooter />
    </main>
  );
}
