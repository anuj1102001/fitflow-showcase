import { Suspense } from "react";
import { ClientsScreen } from "@/components/screens/clients";

export const metadata = { title: "Clients" };

export default function Page() {
  return (
    <Suspense>
      <ClientsScreen />
    </Suspense>
  );
}
