import {
  PortfolioPageHeader,
  PortfolioPageShell,
  PORTFOLIO_MAIN_CLASS_NAME,
} from "@/components/app-header";
import { ProjectSubmissionFlow } from "@/components/project-submission-form";

export function ProjectSubmissionPage() {
  return (
    <PortfolioPageShell>
      <main className={PORTFOLIO_MAIN_CLASS_NAME}>
        <PortfolioPageHeader
          title={
            <>
              Submit once, <span className="text-page-title-accent">publish everywhere</span>
            </>
          }
          subtitle="Prepare one Sui project locally, connect your wallet only when you are ready, and pay the shared 10 SUI Registry fee to submit it across every Doji app."
        />
        <ProjectSubmissionFlow />
      </main>
    </PortfolioPageShell>
  );
}
