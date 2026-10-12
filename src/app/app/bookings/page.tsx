import { Suspense } from "react";
import { BookingsScreen } from "@/components/screens/bookings";

export const metadata = { title: "Bookings" };

export default function Page() {
  return (
    <Suspense>
      <BookingsScreen />
    </Suspense>
  );
}
