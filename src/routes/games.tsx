import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { AccountsForSaleWorlds } from "@/components/AccountsForSaleWorlds";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Games — RedMoon Gaming Store" },
      {
        name: "description",
        content:
          "Explore Whiteout Survival, Kingshot, Rise of Kingdoms and Call of Dragons accounts and services at RedMoon.",
      },
      { property: "og:title", content: "Games — RedMoon Gaming Store" },
      {
        property: "og:description",
        content: "Choose your game and explore RedMoon accounts, middleman and top ups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamesPage,
});

export function GameCards() {
  return <AccountsForSaleWorlds />;
}

function GamesPage() {
  return (
    <main className="bm">
      <SiteHeader />
      <AccountsForSaleWorlds />
      <SiteFooter />
    </main>
  );
}
