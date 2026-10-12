import type { Metadata } from "next";
import { AppShell } from "@/components/app/shell";

export const metadata: Metadata = { title: { default: "Demo", template: "%s · FITFLOW demo" }, robots: { index: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
