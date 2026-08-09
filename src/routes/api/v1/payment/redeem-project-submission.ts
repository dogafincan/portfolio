import { createFileRoute } from "@tanstack/react-router";

import { forwardRegistrySubmissionRequest } from "@/lib/registry-submission-gateway.server";

export const Route = createFileRoute("/api/v1/payment/redeem-project-submission")({
  server: {
    handlers: {
      POST: ({ request }) => forwardRegistrySubmissionRequest(request, "paid"),
    },
  },
});
