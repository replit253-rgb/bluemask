import { createFileRoute, redirect } from "@tanstack/react-router";
import { findTopUpPackage } from "@/lib/topup";

export const Route = createFileRoute("/top-up/$code")({
  beforeLoad: ({ params }) => {
    const item = findTopUpPackage(params.code);
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
