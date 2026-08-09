import { createLazyFileRoute } from "@tanstack/react-router";

import { ProjectSubmissionPage } from "@/components/project-submission-page";

export const Route = createLazyFileRoute("/submit")({
  component: ProjectSubmissionPage,
});
