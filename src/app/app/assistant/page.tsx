import { Suspense } from "react";
import { AssistantScreen } from "@/components/screens/assistant";

export const metadata = { title: "Assistant" };

export default function Page() {
  return (
    <Suspense>
      <AssistantScreen />
    </Suspense>
  );
}
