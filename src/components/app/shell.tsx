"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bell, CalendarPlus, ChevronsLeft, Menu as MenuIcon, Plus, RotateCcw, Search, Sparkles, UserPlus, X, BookOpen, Home } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { EASE, SPRING } from "@/components/motion/kit";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Avatar, Kbd, Menu, MenuItem, Skeleton } from "@/components/ui/kit";
import { LogoMark, Logo } from "@/components/ui/logo";
import { useToast } from "@/components/ui/toast";
import { ThemeFlip, ThemeToggle } from "@/components/theme-toggle";
import { ago } from "@/lib/format";
import { COACH } from "@/lib/seed";
import { useDemo, useHydrated } from "@/lib/store";
import { useUI } from "@/lib/ui-store";
import { BookingForm, LeadForm } from "./forms";
import { CommandPalette } from "./palette";
import { NAV, navFor } from "./nav";
import { Welcome } from "./welcome";

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const hydrated = useHydrated();
  const [collapsed, setCollapsed] = useState(false);
  const { mobileNav, setMobileNav, setPalette } = useUI();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("ff-nav") === "1");
    } catch {}
  }, []);
  useEffect(() => setMobileNav(false), [path, setMobileNav]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPalette]);

  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("ff-nav", c ? "0" : "1");
      } catch {}
      return !c;
    });
  };
  const current = navFor(path);

  return (
    <div className="min-h-dvh bg-bg">
      <DemoStrip />
      <div className="flex">
        {/* Desktop sidebar */}
        <motion.aside animate={{ width: collapsed ? 76 : 252 }} transition={{ duration: 0.35, ease: EASE }} className="sticky top-0 hidden h-dvh shrink-0 border-r border-line bg-panel/40 lg:block">
          <Sidebar collapsed={collapsed} onToggle={toggle} path={path} />
        </motion.aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileNav && (
            <div className="fixed inset-0 z-[75] lg:hidden">
              <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} />
              <motion.aside className="absolute inset-y-0 left-0 w-[280px] border-r border-line bg-panel" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ duration: 0.35, ease: EASE }} aria-label="Navigation">
                <button onClick={() => setMobileNav(false)} className="icon-btn absolute right-3 top-3 h-9 w-9" aria-label="Close menu">
                  <X size={16} />
                </button>
                <Sidebar collapsed={false} path={path} />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <Topbar title={current?.label ?? "FITFLOW"} blurb={current?.blurb} />
          <main id="main" className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
            {hydrated ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={path} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32, ease: EASE }}>
                  {children}
                </motion.div>
              </AnimatePresence>
            ) : (
              <ShellSkeleton />
            )}
          </main>
        </div>
      </div>
      {hydrated && (
        <>
          <LeadForm />
          <BookingForm />
          <CommandPalette />
          <Welcome />
        </>
      )}
    </div>
  );
}

function DemoStrip() {
  const reset = useDemo((s) => s.reset);
  const toast = useToast();
  const router = useRouter();
  return (
    <div className="relative z-[60] flex h-9 items-center justify-center gap-3 border-b border-line bg-[linear-gradient(90deg,rgb(var(--lime)/.08),transparent_30%,transparent_70%,rgb(var(--lime)/.08))] px-4 text-[12px] text-fg-2">
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-s1" aria-hidden />
      <span className="truncate">
        <span className="font-medium text-fg">Interactive prototype</span>
        <span className="hidden sm:inline"> · Fictional coach and sample data · Your changes are saved in this browser only</span>
      </span>
      <button
        onClick={() => {
          if (!confirm("Reset the demo? Your edits will be replaced with fresh sample data.")) return;
          reset();
          router.push("/app");
          toast({ tone: "success", title: "Demo reset", body: "Fresh sample data loaded." });
        }}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 font-medium text-fg-2 transition hover:bg-panel-2 hover:text-fg"
      >
        <RotateCcw size={12} /> Reset
      </button>
    </div>
  );
}

function Sidebar({ collapsed, onToggle, path }: { collapsed: boolean; onToggle?: () => void; path: string }) {
  const leads = useDemo((s) => s.leads);
  const hydrated = useHydrated();
  const active = hydrated ? leads.filter((l) => l.stage === "new").length : 0;
  const current = navFor(path)?.href;
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center", collapsed ? "justify-center" : "justify-between px-5")}>
        <Link href="/" aria-label="FITFLOW home">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
        {onToggle && !collapsed && (
          <button onClick={onToggle} className="grid h-8 w-8 place-items-center rounded-lg text-fg-3 transition hover:bg-panel-2 hover:text-fg" aria-label="Collapse sidebar" title="Collapse sidebar">
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>
      {onToggle && collapsed && (
        // Expand sits right under the logo, where the collapse arrow was, so the control never moves far.
        <div className="px-3 pb-1">
          <button onClick={onToggle} className="mx-auto grid h-9 w-10 place-items-center rounded-xl border border-line text-fg-2 transition hover:border-line-2 hover:bg-panel-2 hover:text-fg" aria-label="Expand sidebar" title="Expand sidebar">
            <ChevronsLeft size={16} className="rotate-180" />
          </button>
        </div>
      )}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-3" aria-label="App">
        {NAV.map((g) => (
          <div key={g.group}>
            {!collapsed && <p className="eyebrow mb-2 px-3">{g.group}</p>}
            <ul className="space-y-0.5">
              {g.items.map((n) => {
                const on = current === n.href;
                const Icon = n.icon;
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      title={collapsed ? n.label : undefined}
                      aria-current={on ? "page" : undefined}
                      className={cn("group relative flex h-10 items-center gap-3 rounded-xl text-[14px] font-medium transition-colors", collapsed ? "justify-center" : "px-3", on ? "text-fg" : "text-fg-3 hover:bg-panel-2/60 hover:text-fg")}
                    >
                      {on && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl border border-line-2 bg-panel-2" transition={SPRING} />}
                      {on && <motion.span layoutId="nav-bar" className="absolute -left-3 top-2 h-6 w-[3px] rounded-r-full bg-s1" transition={SPRING} />}
                      <Icon size={18} className={cn("relative shrink-0", on && "text-lime-fg")} />
                      {!collapsed && <span className="relative flex-1 truncate">{n.label}</span>}
                      {!collapsed && n.href === "/app/leads" && active > 0 && <span className="relative rounded-md bg-lime px-1.5 text-[11px] font-semibold text-lime-ink">{active}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        {collapsed ? (
          <Link href="/app/sequences" title="Your sequences" aria-label="Your sequences" className="mx-auto grid w-fit place-items-center rounded-full transition hover:opacity-80">
            <Avatar name={COACH.name} src={COACH.avatar} size={36} />
          </Link>
        ) : (
          <Link href="/case-study" className="flex items-center gap-3 rounded-2xl border border-line bg-panel-2/50 p-3 transition hover:border-line-2">
            <Avatar name={COACH.name} src={COACH.avatar} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">{COACH.name}</p>
              <p className="truncate text-[12px] text-fg-3">Strength coach · Bengaluru</p>
            </div>
            <BookOpen size={14} className="text-fg-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function Topbar({ title, blurb }: { title: string; blurb?: string }) {
  const { setMobileNav, setPalette, openLeadForm, openBookingForm } = useUI();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={() => setMobileNav(true)} className="icon-btn lg:hidden" aria-label="Open menu">
          <MenuIcon size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-semibold leading-tight">{title}</h1>
          {blurb && <p className="hidden truncate text-[12.5px] text-fg-3 md:block">{blurb}</p>}
        </div>
        <button onClick={() => setPalette(true)} className="hidden h-10 w-64 items-center gap-2.5 rounded-lg border border-line bg-panel px-4 text-[13px] text-fg-3 transition hover:border-line-2 md:flex" aria-label="Search (Ctrl K)">
          <Search size={15} />
          <span className="flex-1 text-left">Search leads, pages…</span>
          <Kbd>⌘K</Kbd>
        </button>
        <button onClick={() => setPalette(true)} className="icon-btn md:hidden" aria-label="Search">
          <Search size={17} />
        </button>
        <Menu
          label="Create new"
          width={220}
          trigger={({ toggle, open }) => (
            <button onClick={toggle} aria-expanded={open} className={buttonClass({ size: "sm" }, "h-10 px-3 sm:px-4")}>
              <Plus size={16} />
              <span className="hidden sm:inline">New</span>
            </button>
          )}
        >
          {(close) => (
            <>
              <MenuItem icon={<UserPlus size={15} />} onClick={() => (close(), openLeadForm())}>Lead</MenuItem>
              <MenuItem icon={<CalendarPlus size={15} />} onClick={() => (close(), openBookingForm())}>Booking</MenuItem>
              <MenuItem icon={<Sparkles size={15} />} onClick={() => (close(), router.push("/app/offers?new=1"))}>Offer with AI</MenuItem>
            </>
          )}
        </Menu>
        <ThemeFlip className="hidden sm:inline-grid" />
        <Notifications />
        <Menu
          label="Account"
          width={240}
          trigger={({ toggle, open }) => (
            <button onClick={toggle} aria-expanded={open} aria-label="Account menu" className="rounded-full ring-offset-2 ring-offset-bg transition hover:ring-2 hover:ring-line-2">
              <Avatar name={COACH.name} src={COACH.avatar} size={38} />
            </button>
          )}
        >
          {(close) => (
            <>
              <div className="px-3 pb-2 pt-1.5">
                <p className="text-[13.5px] font-semibold">{COACH.name}</p>
                <p className="text-[12px] text-fg-3">Fictional demo account</p>
              </div>
              <div className="my-1 h-px bg-line" />
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <span className="text-[13px] text-fg-2">Appearance</span>
                <ThemeToggle size="sm" />
              </div>
              <div className="my-1 h-px bg-line" />
              <MenuItem icon={<BookOpen size={15} />} onClick={() => (close(), router.push("/case-study"))}>Read the case study</MenuItem>
              <MenuItem icon={<Home size={15} />} onClick={() => (close(), router.push("/"))}>Back to website</MenuItem>
            </>
          )}
        </Menu>
      </div>
    </header>
  );
}

function Notifications() {
  const items = useDemo((s) => s.notifications);
  const markAllRead = useDemo((s) => s.markAllRead);
  const markRead = useDemo((s) => s.markRead);
  const router = useRouter();
  const hydrated = useHydrated();
  const unread = hydrated ? items.filter((n) => !n.read).length : 0;
  return (
    <Menu
      label="Notifications"
      width={340}
      trigger={({ toggle, open }) => (
        <button onClick={toggle} aria-expanded={open} className="icon-btn relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
          <Bell size={17} />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-lime-ink">
                {unread}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
            <p className="text-[13.5px] font-semibold">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[12px] font-medium text-lime-fg hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-[360px] overflow-y-auto">
            {items.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-fg-3">You&apos;re all caught up.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    markRead(n.id);
                    close();
                    router.push(n.href);
                  }}
                  className="flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-panel-2"
                >
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line-2" : "bg-s1")} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[13.5px]", n.read ? "text-fg-2" : "font-semibold text-fg")}>{n.title}</span>
                    <span className="block truncate text-[12.5px] text-fg-3">{n.body}</span>
                    <span className="mt-0.5 block text-[11.5px] text-fg-3">{ago(n.at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Menu>
  );
}

function ShellSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading demo">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[118px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[340px] rounded-2xl xl:col-span-2" />
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
    </div>
  );
}
