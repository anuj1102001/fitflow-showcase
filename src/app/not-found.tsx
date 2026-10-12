import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-[13px] text-lime-fg">404</p>
        <h1 className="mt-3 text-[40px] font-semibold tracking-[-0.04em]">This page skipped leg day.</h1>
        <p className="mt-3 text-fg-2">It doesn&apos;t exist in this prototype.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Link href="/" className={buttonClass({})}>Home</Link>
          <Link href="/app" className={buttonClass({ variant: "secondary" })}>Open the demo</Link>
        </div>
      </div>
    </main>
  );
}
