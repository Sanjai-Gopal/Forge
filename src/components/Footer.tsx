import { Logo, LinkedInIcon, XIcon } from "./icons";

const columns = [
  {
    title: "Platform",
    links: ["Innovation hackathons", "Hiring hackathons", "Skill validation", "AI capacity building"],
  },
  {
    title: "Company",
    links: ["About", "Customers", "Careers", "Contact"],
  },
  {
    title: "Resources",
    links: ["Blog", "Guides", "Challenge library", "Status"],
  },
  {
    title: "Get started",
    links: ["Book a demo", "For builders", "Pricing", "Sign in"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink">
      <div className="shell py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo invert />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-dark">
              Hackathons, skills-based hiring, and AI upskilling, all in one
              place.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Forge on LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-paper/60 transition-colors hover:text-paper"
              >
                <LinkedInIcon width={17} height={17} />
              </a>
              <a
                href="#"
                aria-label="Forge on X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-paper/60 transition-colors hover:text-paper"
              >
                <XIcon width={16} height={16} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-dark">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-paper/70 transition-colors hover:text-paper"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-ink-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-muted-dark">
            © {new Date().getFullYear()} Forge. A concept project.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-dark">
            <a href="#" className="hover:text-paper">
              Privacy
            </a>
            <a href="#" className="hover:text-paper">
              Terms
            </a>
            <a href="#" className="hover:text-paper">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
