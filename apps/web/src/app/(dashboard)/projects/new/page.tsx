import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Project</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect a Figma file to a GitHub repo and choose your Design System path.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
