import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { QuickActionButton } from "@/components/dashboard/quick-action-button";
import { NotificationToastProvider } from "@/components/notification-toast";
import { OnboardingTour } from "@/components/onboarding-tour";
import { BudgetAlertToast } from "@/components/budget-alert-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
          {children}
        </main>
        <QuickActionButton />
        <NotificationToastProvider />
        <BudgetAlertToast />
        <OnboardingTour />
      </div>
  );
}
