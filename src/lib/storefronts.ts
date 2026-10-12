import { img, IMAGES } from "./images";
import type { Offer, Storefront } from "./types";

/** Static content for the public storefronts. Testimonials are fictional and labelled as such in the UI. */

export type Testimonial = { name: string; detail: string; quote: string };
export type Faq = { q: string; a: string };

export const AARAV_TESTIMONIALS: Testimonial[] = [
  { name: "Rhea K.", detail: "Product manager · Strength Foundations", quote: "I'd never touched a barbell. Twelve weeks later I look forward to leg day, and my back stopped aching at my desk." },
  { name: "Sameer P.", detail: "Engineer · Desk-to-Deadlift Hybrid", quote: "The in-person sessions fixed my form in one go. The weekly check-ins kept me honest through two product launches." },
  { name: "Anita D.", detail: "Teacher · Fat-Loss Accelerator", quote: "No crash diet, just food I already cook at home. The group chat made it feel like a team sport." },
];

export const AARAV_FAQ: Faq[] = [
  { q: "Do I need a gym membership?", a: "No. Programs can be built for home with dumbbells or bands, and adjusted if you join a gym later." },
  { q: "How much time does it take each week?", a: "Most clients train 3 times a week for 45–60 minutes, plus a 5-minute check-in form on Sundays." },
  { q: "What if I have an injury?", a: "Tell me during the discovery call. I'll adapt the plan, and for anything medical I'll ask you to get clearance from a doctor or physio first." },
  { q: "Can I pay in instalments?", a: "Yes, programs of 8 weeks or longer can be split into two payments." },
];

export const MEERA_OFFERS: Offer[] = [
  {
    id: "m1",
    title: "Desk Body Reset",
    tagline: "Ease stiff hips, shoulders and lower back in four weeks.",
    description: "Four weeks of 20-minute guided mobility sessions you can do before work, plus a posture check-in every Friday.",
    type: "Small-group program",
    goal: "Move pain-free",
    audience: "Desk workers",
    price: 2999,
    weeks: 4,
    benefits: ["12 live 20-minute sessions", "Recordings for busy days", "Friday posture check-in", "Desk stretch cheat-sheet"],
    cta: "Join the next batch",
    status: "live",
    createdAt: "",
  },
  {
    id: "m2",
    title: "Strong & Supple 1:1",
    tagline: "Yoga-based strength for women 30+, built around your week.",
    description: "A personal 10-week plan combining yoga flows and simple strength work, with a weekly video call and messaging support.",
    type: "1:1 online coaching",
    goal: "Build strength",
    audience: "Women 30+",
    price: 12999,
    weeks: 10,
    benefits: ["Personal 10-week plan", "Weekly 30-minute video call", "Form feedback on video", "Breathwork for better sleep"],
    cta: "Book a free consult",
    status: "live",
    createdAt: "",
  },
  {
    id: "m3",
    title: "Postnatal Gentle Return",
    tagline: "Rebuild your core at your own pace, with your doctor's clearance.",
    description: "A gentle 8-week plan for mothers six months or more postpartum: short sessions, pelvic-floor friendly progressions and a fortnightly call.",
    type: "1:1 online coaching",
    goal: "Return to fitness",
    audience: "New mothers",
    price: 8999,
    weeks: 8,
    benefits: ["15–25 minute home sessions", "Pelvic-floor friendly progressions", "Fortnightly video call", "Flexible scheduling"],
    cta: "Ask about a spot",
    status: "live",
    createdAt: "",
  },
];

export const MEERA: Storefront = {
  slug: "meera",
  coachName: "Meera Iyer",
  role: "Yoga & mobility coach",
  city: "Pune",
  headline: "Move with ease. Build strength that lasts.",
  bio: "I help busy women and desk workers feel at home in their bodies again, through yoga-based strength and mobility that fits into 20–30 minutes a day.",
  theme: "bloom",
  heroImage: IMAGES.coachMeera,
  offerIds: MEERA_OFFERS.map((o) => o.id),
  showTestimonials: true,
  showFaq: true,
  ctaLabel: "Book a free consult",
  stats: [
    { label: "Years teaching", value: "9" },
    { label: "Session length", value: "20–30 min" },
    { label: "Batch size", value: "Max 10" },
  ],
};

export const MEERA_TESTIMONIALS: Testimonial[] = [
  { name: "Kavitha R.", detail: "Architect · Desk Body Reset", quote: "My shoulders used to be up by my ears by 4 pm. Twenty minutes in the morning changed my whole workday." },
  { name: "Leena S.", detail: "New mum · Postnatal Gentle Return", quote: "Meera never rushed me. I felt stronger every fortnight, and safe doing it." },
  { name: "Farah M.", detail: "Consultant · Strong & Supple 1:1", quote: "It's the first program I've stuck with for more than a month. It fits around my travel." },
];

export const MEERA_FAQ: Faq[] = [
  { q: "I'm not flexible at all. Is that OK?", a: "Completely. Flexibility is something we build together; every pose has an easier option." },
  { q: "What do I need at home?", a: "A mat and a sturdy chair. Optional: a resistance band and two yoga blocks." },
  { q: "Are classes live?", a: "Group programs are live with recordings; 1:1 plans are on your schedule with a weekly call." },
];

/** Hero photo options in the storefront builder. */
export const HERO_OPTIONS = [
  { id: "coach", label: "Coach portrait", src: IMAGES.coachAarav },
  { id: "session", label: "Coaching session", src: img("coachingSession", 1400) },
  { id: "lift", label: "Barbell training", src: img("barbellBack", 1400) },
  { id: "press", label: "Dumbbell press", src: img("dumbbellPress", 1400) },
];
