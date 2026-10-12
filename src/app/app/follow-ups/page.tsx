import { Suspense } from "react";
import { FollowUpsScreen } from "@/components/screens/follow-ups";

export const metadata = { title: "Follow-ups" };

export default function Page() {
  return (
    <Suspense>
      <FollowUpsScreen />
    </Suspense>
  );
}
