import { createFileRoute, redirect } from "@tanstack/react-router";

type Search = { game?: string | undefined };

export const Route = createFileRoute("/akun/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    game: typeof s["game"] === "string" ? s["game"] : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/accounts",
      search,
    });
  },
  component: () => null,
});
