import { BarChart3, Bot, CalendarDays, HeartPulse, LayoutDashboard, MessageSquareText, Sparkles, Store, Users, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; blurb: string };

export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Workspace",
    items: [
      { href: "/app", label: "Overview", icon: LayoutDashboard, blurb: "Today's numbers, what needs you and what's coming up" },
      { href: "/app/leads", label: "Leads", icon: Users, blurb: "Every enquiry from every channel, in one pipeline" },
      { href: "/app/follow-ups", label: "Follow-ups", icon: MessageSquareText, blurb: "AI-drafted, personal follow-up messages" },
      { href: "/app/bookings", label: "Bookings", icon: CalendarDays, blurb: "Discovery calls, sessions and check-ins" },
      { href: "/app/clients", label: "Clients", icon: HeartPulse, blurb: "Plans, progress and check-ins for active clients" },
    ],
  },
  {
    group: "Grow",
    items: [
      { href: "/app/offers", label: "Offer Builder", icon: Sparkles, blurb: "Package your coaching into clear, priced offers" },
      { href: "/app/storefront", label: "Storefront", icon: Store, blurb: "Your public coaching page" },
      { href: "/app/analytics", label: "Analytics", icon: BarChart3, blurb: "Lead flow, conversion and revenue trends" },
    ],
  },
  { group: "AI", items: [{ href: "/app/assistant", label: "Assistant", icon: Bot, blurb: "Ask questions about your business" }] },
];

export const ALL_NAV = NAV.flatMap((g) => g.items);
export const navFor = (path: string) => [...ALL_NAV].sort((a, b) => b.href.length - a.href.length).find((n) => (n.href === "/app" ? path === "/app" : path.startsWith(n.href)));
