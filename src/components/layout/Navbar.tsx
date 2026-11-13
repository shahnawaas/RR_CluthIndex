import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useScrolledPast } from "../../hooks/useMediaQuery";

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#teams", label: "Teams" },
  { href: "#insights", label: "Squad insights" },
  { href: "#about", label: "About" },
];

export function Navbar() {
  const scrolled = useScrolledPast(24);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        solid ? "bg-navy/95 shadow-[0_1px_0_rgba(215,182,109,0.25)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="#top" className="group flex items-baseline gap-2.5 text-white" onClick={() => setOpen(false)}>
          <span className="display text-[1.7rem] leading-none">Royals</span>
          <span className="display text-[1.7rem] leading-none text-pink">2027</span>
          <span className="hidden text-[13px] font-semibold text-white/60 sm:inline">Player selection</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-4 py-2 text-[14px] font-semibold text-white/75 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/10 px-5 md:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href} className="border-b border-white/10 last:border-0">
                <a
                  href={l.href}
                  onClick={(e) => {
                    // Close the menu first, then scroll once its collapse no longer shifts the layout.
                    e.preventDefault();
                    setOpen(false);
                    window.setTimeout(() => {
                      document.querySelector(l.href)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      history.replaceState(null, "", l.href);
                    }, 260);
                  }}
                  className="display block py-4 text-3xl text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
