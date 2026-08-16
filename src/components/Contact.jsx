import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Instagram, Mail, Send } from "lucide-react";

import { SERVICE_OPTIONS, SITE } from "../lib/constants.js";
import { EASE, cx } from "../lib/utils.js";
import { useSectionWhoosh, useSfx } from "../hooks/useSfx.js";
import { GlowButton, Reveal, SectionHeading } from "./ui/Primitives.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Shared styling for the three text controls. */
const fieldClass =
  "w-full rounded-2xl border border-[var(--glass-border)] bg-white/[0.025] px-4 py-3.5 text-[0.94rem] text-[var(--ink)] placeholder:text-[var(--ink-ghost)] outline-none transition-[border-color,box-shadow,background] duration-400 focus:border-[var(--glass-border-lit)] focus:bg-white/[0.045] focus:shadow-[0_0_0_3px_rgb(139_92_246_/_0.14)]";

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="eyebrow !text-[0.6rem]">{label}</span>
      <span className="mt-2 block">{children}</span>
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 block text-[0.75rem] text-[#ff8080]"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

/* Custom dropdown — a native <select> can't carry the glass treatment or
   fire a per-option sound, and this section is the one place the site
   asks the visitor for something. */
function NeedsDropdown({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { play } = useSfx();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          play(open ? "close" : "open", { gain: 0.5 });
          setOpen((v) => !v);
        }}
        onPointerEnter={() => play("hover")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(fieldClass, "flex items-center justify-between text-left")}
      >
        <span className={value ? "text-[var(--ink)]" : "text-[var(--ink-ghost)]"}>
          {value || "What do you need?"}
        </span>
        <ChevronDown
          className={cx(
            "h-4 w-4 shrink-0 text-[var(--ink-faint)] transition-transform duration-400 ease-[var(--ease-out-expo)]",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            transition={{ duration: 0.32, ease: EASE }}
            className="glass-strong absolute z-20 mt-2 w-full overflow-hidden rounded-2xl p-1.5"
          >
            {SERVICE_OPTIONS.map((opt, i) => (
              <motion.li
                key={opt}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.035, duration: 0.3, ease: EASE }}
                role="option"
                aria-selected={value === opt}
              >
                <button
                  type="button"
                  onPointerEnter={() => play("hover")}
                  onClick={() => {
                    play("select");
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={cx(
                    "w-full rounded-xl px-3.5 py-2.5 text-left text-[0.9rem] transition-colors duration-200",
                    value === opt
                      ? "bg-white/[0.08] text-[var(--ink)]"
                      : "text-[var(--ink-soft)] hover:bg-white/[0.05] hover:text-[var(--ink)]"
                  )}
                >
                  {opt}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && <span className="mt-1.5 block text-[0.75rem] text-[#ff8080]">{error}</span>}
    </div>
  );
}

export function Contact({ prefill }) {
  const ref = useRef(null);
  const { play } = useSfx();
  useSectionWhoosh(ref, { threshold: 0.2 });

  const [form, setForm] = useState({ name: "", email: "", need: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  /* The hero's Enquire button can pre-select a need. */
  useEffect(() => {
    if (prefill) setForm((f) => ({ ...f, need: prefill }));
  }, [prefill]);

  const set = (key) => (e) => {
    const value = typeof e === "string" ? e : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Tell me who you are.";
    if (!EMAIL_RE.test(form.email)) next.email = "That email doesn't look right.";
    if (!form.need) next.need = "Pick the closest match.";
    if (form.message.trim().length < 10) next.message = "A sentence or two, at least.";
    return next;
  };

  const submit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);

    if (Object.keys(next).length) {
      play("close");
      return;
    }

    play("success");
    setSent(true);

    /* Hand the enquiry to the visitor's mail client with everything filled
       in — there is no backend, and a mailto keeps it that way. */
    const subject = encodeURIComponent(`New enquiry — ${form.need}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nNeeds: ${form.need}\n\n${form.message}`
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" ref={ref} className="section pb-0">
      <div className="shell">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something loud"
          lead="Describe the outcome you want. I'll come back with scope, timeline and a number."
          align="center"
        />

        <Reveal delay={0.15}>
          <div className="glass-strong relative mx-auto mt-14 max-w-2xl overflow-hidden rounded-3xl p-7 sm:p-10">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="py-10 text-center"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                    className="mx-auto grid h-16 w-16 place-items-center rounded-full"
                    style={{
                      background: "rgb(139 92 246 / 0.16)",
                      boxShadow: "0 0 46px -10px rgb(139 92 246 / 0.9)",
                    }}
                  >
                    <CheckCircle2 className="h-7 w-7 text-violet-soft" strokeWidth={2.2} />
                  </motion.span>

                  <h3 className="display mt-6 text-[1.6rem] text-[var(--ink)]">
                    Thanks for Enquiring
                  </h3>
                  <p className="mt-3 text-[0.95rem] text-[var(--ink-soft)]">
                    You will be contacted shortly.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      play("click");
                      setSent(false);
                      setForm({ name: "", email: "", need: "", message: "" });
                    }}
                    onPointerEnter={() => play("hover")}
                    className="mt-7 font-display text-[0.74rem] tracking-[0.18em] uppercase text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" error={errors.name}>
                      <input
                        className={fieldClass}
                        value={form.name}
                        onChange={set("name")}
                        onFocus={() => play("focus")}
                        placeholder="Your name"
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input
                        className={fieldClass}
                        value={form.email}
                        onChange={set("email")}
                        onFocus={() => play("focus")}
                        placeholder="you@studio.com"
                        type="email"
                        autoComplete="email"
                      />
                    </Field>
                  </div>

                  <div>
                    <span className="eyebrow !text-[0.6rem]">Needs</span>
                    <div className="mt-2">
                      <NeedsDropdown value={form.need} onChange={set("need")} error={errors.need} />
                    </div>
                  </div>

                  <Field label="Brief" error={errors.message}>
                    <textarea
                      rows={5}
                      className={cx(fieldClass, "resize-none")}
                      value={form.message}
                      onChange={set("message")}
                      onFocus={() => play("focus")}
                      placeholder="What are we making, who is it for, and when do you need it?"
                    />
                  </Field>

                  <GlowButton as="button" type="submit" icon={Send} className="w-full justify-center">
                    Email Me Directly
                  </GlowButton>

                  <p className="text-center text-[0.72rem] text-[var(--ink-ghost)]">
                    Opens your mail client with the brief attached.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>

      <Footer />
    </section>
  );
}

/* =====================================================================
   FOOTER — blends into the absolute bottom of the page.
   ===================================================================== */
function Footer() {
  const { play } = useSfx();

  return (
    <footer className="relative mt-28">
      {/* The page bottoms out into pure black rather than stopping. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-28 h-28 bg-gradient-to-b from-transparent to-black"
      />
      <div className="relative bg-black pt-16 pb-10">
        <div className="shell">
          <p className="display text-center text-[clamp(2.4rem,13vw,9rem)] leading-none text-white/[0.045] select-none">
            {SITE.firstName}
          </p>

          <div className="mt-10 flex flex-col items-center gap-6 border-t border-white/[0.06] pt-8 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${SITE.email}`}
                onPointerEnter={() => play("hover")}
                onClick={() => play("click")}
                className="glass glass-lit inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[0.84rem] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                <Mail className="h-4 w-4" />
                {SITE.email}
              </a>

              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                onPointerEnter={() => play("hover")}
                onClick={() => play("click")}
                className="glass glass-lit inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[0.84rem] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                <Instagram className="h-4 w-4" />
                {SITE.instagram}
              </a>
            </div>

            <p className="text-[0.74rem] tracking-[0.16em] uppercase text-[var(--ink-ghost)]">
              © {new Date().getFullYear()} {SITE.firstName} · {SITE.role}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
