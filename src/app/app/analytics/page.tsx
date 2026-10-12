import { Suspense } from "react";
import { AnalyticsScreen } from "@/components/screens/analytics";

export const metadata = { title: "Analytics" };

export default function Page() {
  return (
    <Suspense>
      <AnalyticsScreen />
    </Suspense>
  );
}
