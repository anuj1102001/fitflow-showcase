import { Suspense } from "react";
import { OffersScreen } from "@/components/screens/offers";

export const metadata = { title: "Offer Builder" };

export default function Page() {
  return (
    <Suspense>
      <OffersScreen />
    </Suspense>
  );
}
