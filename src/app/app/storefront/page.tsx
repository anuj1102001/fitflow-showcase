import { Suspense } from "react";
import { StorefrontScreen } from "@/components/screens/storefront";

export const metadata = { title: "Storefront" };

export default function Page() {
  return (
    <Suspense>
      <StorefrontScreen />
    </Suspense>
  );
}
