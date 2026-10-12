import { Suspense } from "react";
import { LeadsScreen } from "@/components/screens/leads";

export const metadata = { title: "Leads" };

export default function Page() {
  return (
    <Suspense>
      <LeadsScreen />
    </Suspense>
  );
}
