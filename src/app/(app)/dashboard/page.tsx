'use client';

import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { RecommendedQuiz } from '@/components/dashboard/recommended-quiz';
import { WeeklyPerformance } from '@/components/dashboard/weekly-performance';
import { RecentActivities } from '@/components/dashboard/recent-activities';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyPerformance />
        </div>
        <div className="space-y-6">
          <RecommendedQuiz />
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}
