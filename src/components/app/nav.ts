import { BarChart3, BicepsFlexed, CalendarDays, HeartPulse, LayoutDashboard, MessageSquareText, Repeat, Sparkles, Users, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; blurb: string };

export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Follow-up",
    items: [
      { href: "/app", label: "Today", icon: LayoutDashboard, blurb: "Who to follow up today and why, then your numbers" },
      { href: "/app/sequences", label: "Sequences", icon: Repeat, blurb: "Multi-step follow-up cadences that pause when people reply" },
      { href: "/app/follow-ups", label: "Compose", icon: MessageSquareText, blurb: "Drafts that show their reasoning; you send" },
      { href: "/app/leads", label: "Leads", icon: Users, blurb: "Every enquiry from every channel, in one pipeline" },
      { href: "/app/clients", label: "Clients", icon: HeartPulse, blurb: "Check-ins, progress and clients who are slipping" },
      { href: "/app/bookings", label: "Bookings", icon: CalendarDays, blurb: "Discovery calls, sessions and check-ins" },
    ],
  },
  {
    group: "Business",
    items: [
      { href: "/app/offers", label: "Offer Builder", icon: Sparkles, blurb: "Package your coaching into clear, priced offers" },
      { href: "/app/analytics", label: "Analytics", icon: BarChart3, blurb: "Lead flow, conversion and revenue trends" },
    ],
  },
  { group: "AI", items: [{ href: "/app/assistant", label: "Assistant", icon: BicepsFlexed, blurb: "Ask questions about your business" }] },
];

export const ALL_NAV = NAV.flatMap((g) => g.items);
export const navFor = (path: string) => [...ALL_NAV].sort((a, b) => b.href.length - a.href.length).find((n) => (n.href === "/app" ? path === "/app" : path.startsWith(n.href)));
