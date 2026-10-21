import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/akun/$code")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/accounts/$code",
      params: { code: params.code },
    });
  },
  component: () => null,
});
