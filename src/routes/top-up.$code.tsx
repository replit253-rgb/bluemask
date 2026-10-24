import { createFileRoute, redirect } from "@tanstack/react-router";
import { getTopUpsFromDB } from "@/lib/db";

export const Route = createFileRoute("/top-up/$code")({
  beforeLoad: async ({ params }) => {
    const items = await getTopUpsFromDB();
    const item = items.find((topup) => topup.code.toLowerCase() === params.code.toLowerCase());
    const game = item?.game || "whiteout-survival";
    throw redirect({
      to: "/services/$service/$game/$code",
      params: {
        service: "top-up",
        game,
        code: params.code,
      },
    });
  },
  component: () => null,
});
