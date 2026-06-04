import Reveal from "./Reveal";

export default function Manifesto() {
  return (
    <section id="how" className="relative overflow-hidden bg-ink py-28 sm:py-36">
      {/* top luminous light-band */}
      <div aria-hidden className="glow-line absolute inset-x-0 top-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-44 w-[70%] -translate-x-1/2 rounded-full bg-accent/30 blur-[80px]"
      />
      {/* bottom luminous light-band (brighter, cyan-led) */}
      <div aria-hidden className="glow-line absolute inset-x-0 bottom-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-1/2 h-52 w-[80%] -translate-x-1/2 rounded-full bg-[#1fc9f5]/30 blur-[90px]"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 dotgrid opacity-70" />

      <div className="shell relative">
        <Reveal>
          <p className="kicker text-muted-dark">The idea behind Forge</p>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-6 max-w-4xl text-balance font-display text-3xl font-semibold leading-[1.12] tracking-tight text-paper sm:text-4xl md:text-[44px]">
            You can&apos;t really tell who&apos;s good from a résumé.{" "}
            <span className="grad-text">You can tell from what they build.</span>{" "}
            Forge hands people a real problem and a deadline, then lets the work
            do the talking.
          </p>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-dark">
            Whether you&apos;re hunting for new ideas, hiring engineers, or
            getting your own team comfortable with AI, every program ends with
            something real: working projects, and a clear read on who can do the
            job.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
