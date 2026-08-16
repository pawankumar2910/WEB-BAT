# PAVAN — Video Editor · Motion Designer · 3D Artist

Single-page interactive portfolio built with **React 19**, **Tailwind CSS v4**,
**Framer Motion** and **Lucide React**.

---

## 1. View it

### Right now, without installing anything

Node.js isn't installed on this machine, so there's a no-build preview that
runs on Python (which you do have):

```bash
python -m http.server 5500 --bind 127.0.0.1
```

Then open <http://127.0.0.1:5500/preview.html> — or just double-click
**`start-preview.bat`**.

`preview.html` compiles `src/App.jsx` in the browser with Babel and runs
Tailwind's browser build over `src/index.css`. It renders **the exact same
source files** as the real app — there is no second copy of the UI to keep in
sync. It's slower to start and needs an internet connection for the CDNs.

### The real dev server (recommended)

Install Node.js 18+ from <https://nodejs.org>, then:

```bash
npm install
```

```bash
npm run dev
```

`npm run build` produces the deployable `dist/` folder. `preview.html` and
`start-preview.bat` are dev conveniences and are not part of that build.

---

## 2. Sections

| # | Section | What's interactive |
| --- | --- | --- |
| 0 | Floating pill navbar | auto-hides on scroll down, returns on scroll up; active-section pill; dark/light toggle; live "Available for Projects" dot |
| 1 | Hero | giant `HI, I'M PAVAN` with the 3D cut-out sitting just in front of its baseline; the stage tilts to the mouse (and to the gyroscope on phones); left glass card with the tagline and large software tiles, right glass card with stats + Enquire |
| 2 | Services | four cards; hovering lights up that service's software badges; clicking opens a modal with deliverables, turnaround and workflow |
| 3 | Work | 15° diagonal three-lane reel; hovering eases it down to ~12% speed; clicking opens the full-screen player |
| 4 | Orchid case study | shutter roll-up on scroll entry, details grid, custom player with expand-to-full-screen |
| 5 | About | large portrait + film-style credits; every line is always legible and each one lights as it passes the middle of the screen |
| 6 | Contact + footer | validated glass form, `mailto:` submit, success modal, socials |

---

## 3. Make it yours

Everything person-specific is in the config block at the top of `src/App.jsx`:

```js
const SITE = {
  firstName: "PAVAN",
  role:      "Video Editor · Motion Designer · 3D Artist",
  email:     "pavankch29@gmail.com",
  location:  "Available worldwide · Remote",
  tagline:   "Building SaaS Videos, Poster Designing, 3D Artwork, & Motion VFX.",
  stats:     [ ... ],
};
```

The content arrays sit directly beneath it: `NAV_LINKS`, `SOFTWARE`,
`SERVICES`, `SHOWCASE`, `ORCHID`, `CREDITS`, `SOCIALS`, `SERVICE_OPTIONS`.

### Assets

All three live in `public/assets/` and are mapped by the `ASSETS` object at the
top of `src/App.jsx` — see `public/assets/README.txt`.

### Colours and type

`src/index.css`. Accent colours are `@theme` tokens (Tailwind generates
`text-violet`, `bg-cyan`, … from them). Surfaces and text use plain custom
properties declared twice — once under `:root, html.dark`, once under
`html.light` — which is what makes the theme toggle flip the whole page.

---

## 4. Structure

```
index.html          Vite entry
preview.html        no-build preview (dev only)
start-preview.bat   double-click launcher for the above
src/
  main.jsx          React root
  index.css         tokens, theme variants, glass + reel + credits classes
  App.jsx           the whole page, section by section
public/assets/      the two images and the Orchid film
```

`App.jsx` is deliberately one file, in numbered sections:

1. Site config · 2. Hooks · 3. Primitives · 4. Cinema player · 5. Navigation
6. Hero · 7. Services · 8. Work showcase · 9. Orchid case study
10. About credits · 11. Contact · 12. Footer · 13. Page

Keeping it in one file is what lets the no-build preview compile the real
source; splitting it into modules would break that (the browser can't resolve
nested `.jsx` imports without a bundler).

---

## 5. Things you'll probably want to change

- **The contact form doesn't post anywhere.** It validates, then opens the
  visitor's mail client pre-filled for `pavankch29@gmail.com` and shows the
  success modal. Swap the `window.location.href = buildMailto()` line in
  `handleSubmit` for a `fetch()` to Formspree/Resend to collect submissions
  server-side instead.
- **Every reel tile plays `orchid-video.mp4`.** Give each `SHOWCASE` entry its
  own `src` (and drop the file in `public/assets/`) as real work lands.
- **Reel thumbnails are generated gradients** (`ArtTile`), not real frames.
  Swap in `<img>` posters when you have them.
- **Social links point at bare domains** — put your real profile URLs in
  `SOCIALS`.
- **Project names and tags are placeholder copy.** The hero stat numbers are
  real; the `SHOWCASE` entries are not.

---

### Motion, deliberately conservative

Two rules the hero and About sections follow, after a run-in with animations
that never ticked:

- **Nothing that carries content starts at `opacity: 0`.** The hero cut-out has
  no entrance animation at all, the headline's entrance animates transform
  only, and every credit line is fully opaque at rest. If an animation never
  runs, the page still reads correctly — text just sits a few pixels low.
- **The credits are laid out in normal flow**, not a sticky scroll-transform
  roll. They scroll with the page and cannot freeze off-screen; the
  centre-of-viewport highlight is an IntersectionObserver on top.

## Accessibility notes

- Honours `prefers-reduced-motion`: the reel stops, the shutter and float
  loops are skipped, transitions collapse.
- Modals are real dialogs — `role="dialog"`, `aria-modal`, Esc to close,
  focus moves to the panel, backdrop click closes, scroll locked (except the
  reel player, which closes when you scroll ~480px away by design).
- Form errors wired with `aria-invalid` / `aria-describedby`; the video
  scrubber is a keyboard-operable `role="slider"` (←/→ seek 5s).
- Visible focus ring on keyboard navigation only (`:focus-visible`).
- Skip link to the contact section as the first tab stop.
