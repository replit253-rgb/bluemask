import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/layanan/$service/$game")({
  beforeLoad: ({ params }) => {
    const service = params.service === "jual-beli-akun" ? "buy-sell-accounts" : params.service;
    throw redirect({
      to: "/services/$service/$game",
      params: { service, game: params.game },
    });
  },
  component: () => null,
});
