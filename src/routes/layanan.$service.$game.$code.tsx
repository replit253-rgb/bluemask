import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/layanan/$service/$game/$code")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/services/$service/$game/$code",
      params: {
        service: params.service,
        game: params.game,
        code: params.code,
      },
    });
  },
  component: () => null,
});
