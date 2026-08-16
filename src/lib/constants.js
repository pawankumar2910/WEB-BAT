import {
  Boxes,
  Clapperboard,
  Clock,
  Layers,
  Palette,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";

/* =====================================================================
   ASSETS
   Everything lives in /public/assets. hero-cowl and hero-face are a
   pixel-aligned 1800x1350 pair — the cursor mask in Hero depends on that
   alignment, so never resize one without the other.
   ===================================================================== */
const ASSET_BASE =
  (typeof window !== "undefined" && window.__ASSET_BASE__) || "/";
const asset = (file) => `${ASSET_BASE}assets/${file}`;

export const ASSETS = {
  heroCowl: asset("hero-cowl.webp"),
  heroFace: asset("hero-face.webp"),
  heroCowlFallback: asset("hero-cowl.png"),
  heroFaceFallback: asset("hero-face.png"),
  portrait: asset("pavan-portrait.jpg"),

  /* Orchid is a 1920x1080 landscape master; AtCozy is a 1080x1920
     vertical cut. Anything rendering these must respect `aspect` below —
     forcing the vertical film into a 16:9 frame crops it to ribbons. */
  orchidVideo: asset("orchid-video.mp4"),
  atcozyVideo: asset("atcozy-video.mp4"),

  /* Single decoded frame per film. The reel paints these instead of
     mounting 24 <video> elements on load. */
  orchidPoster: asset("poster-orchid.jpg"),
  atcozyPoster: asset("poster-atcozy.jpg"),
};

export const LANDSCAPE = "16 / 9";
export const PORTRAIT = "9 / 16";

export const SITE = {
  firstName: "PAVAN",
  role: "Video Editor · Motion Designer · 3D Artist",
  email: "pavankch29@gmail.com",
  instagram: "renderedby.pk",
  instagramUrl: "https://instagram.com/renderedby.pk",
  location: "Available worldwide · Remote",
  tagline: "Building SaaS Videos, Poster Designing, 3D Artwork, and more.",
  availability: "Available for Projects",
  stats: [
    { value: "15+", label: "Projects delivered" },
    { value: "4+", label: "Brands & studios" },
    { value: "4 yrs", label: "Post-production" },
  ],
};

export const NAV_LINKS = [
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

/* Adobe-style monogram tiles; no external brand SVGs required. */
export const SOFTWARE = {
  ae: { id: "ae", name: "After Effects", short: "Ae", color: "#9999FF" },
  pr: { id: "pr", name: "Premiere Pro", short: "Pr", color: "#EA77FF" },
  ps: { id: "ps", name: "Photoshop", short: "Ps", color: "#31A8FF" },
  dr: { id: "dr", name: "DaVinci Resolve", short: "Dr", color: "#F0455B" },
  bl: { id: "bl", name: "Blender", short: "Bl", color: "#F5792A" },
};

export const SERVICES = [
  {
    id: "saas",
    icon: Rocket,
    title: "SaaS Product Demos & Launch Trailers",
    blurb:
      "Scroll-stopping product films that make complex software feel obvious.",
    tools: ["ae", "pr", "dr"],
    accent: "#8B5CF6",
    turnaround: "5–8 working days",
    deliverables: [
      "Master 60–90s launch film (4K ProRes + H.264)",
      "Vertical 9:16 and square 1:1 social cutdowns",
      "6–10s teaser loops for paid ads",
      "Animated UI mockups & device composites",
      "Captions, SRT file and clean audio stems",
    ],
    workflow: [
      { step: "Discovery", detail: "Product walkthrough, script and storyboard sign-off." },
      { step: "Capture", detail: "High-frame-rate screen capture and asset prep in Photoshop." },
      { step: "Animate", detail: "Kinetic UI, transitions and VFX built in After Effects." },
      { step: "Finish", detail: "Resolve colour pass, sound design, delivery in every ratio." },
    ],
  },
  {
    id: "vfx",
    icon: Wand2,
    title: "Advanced VFX & Compositing",
    blurb:
      "Invisible fixes and loud spectacle — roto, tracking, particles, 3D composites.",
    tools: ["ae", "ps", "bl"],
    accent: "#06B6D4",
    turnaround: "3–10 working days per sequence",
    deliverables: [
      "Shot-by-shot composite breakdowns",
      "3D camera track & object integration",
      "Rotoscoping, clean plates and wire removal",
      "Particle, light-wrap and atmospheric passes",
      "Layered project file handover on request",
    ],
    workflow: [
      { step: "Plate review", detail: "Footage audit, shot list and difficulty grading." },
      { step: "Track & roto", detail: "3D camera solve, matte extraction, clean plates." },
      { step: "Composite", detail: "Element build, grade-matching and light wrap." },
      { step: "Review", detail: "Two revision rounds with annotated review links." },
    ],
  },
  {
    id: "grade",
    icon: Palette,
    title: "Cinematic Colour Grading",
    blurb:
      "Node-based grading in Resolve Studio — a look that survives every screen.",
    tools: ["dr", "pr"],
    accent: "#C89B6A",
    turnaround: "2–5 working days",
    deliverables: [
      "Shot-matched primary balance across the timeline",
      "Custom creative look / show LUT",
      "Skin-tone protection & secondary isolations",
      "Film grain, halation and optional print emulation",
      "Broadcast-safe QC and mastered deliverables",
    ],
    workflow: [
      { step: "Conform", detail: "Round-trip from Premiere, media relink and timeline QC." },
      { step: "Balance", detail: "Primary correction, shot matching, exposure and balance." },
      { step: "Look", detail: "Creative grade, power windows, tracked secondaries." },
      { step: "Master", detail: "Grain, sharpening, scopes QC and per-platform exports." },
    ],
  },
  {
    id: "3d",
    icon: Boxes,
    title: "3D Artwork & Poster Design",
    blurb:
      "Blender-built scenes, product renders and poster art with type-driven motion.",
    tools: ["bl", "ae", "pr", "ps"],
    accent: "#A78BFA",
    turnaround: "4–12 working days",
    deliverables: [
      "Modelled, textured and lit 3D scenes",
      "Still key-art / poster renders at print resolution",
      "Looping product turntables and hero animations",
      "Kinetic typography and logo stings",
      "Source files, render passes and alpha exports",
    ],
    workflow: [
      { step: "Concept", detail: "Moodboard, blockout and camera language." },
      { step: "Build", detail: "Modelling, shading and lighting in Blender." },
      { step: "Render", detail: "Cycles passes rendered in layers for full comp control." },
      { step: "Motion", detail: "Comp, type and finishing across After Effects and Premiere." },
    ],
  },
];

/* =====================================================================
   WORK REEL
   The two films with real footage lead the lane. The remaining tiles are
   styled placeholders — each reuses one of the two masters as `src` until
   its own file lands in /public/assets. Swap the `src` and drop the
   `placeholder` flag as real cuts arrive.
   ===================================================================== */
export const SHOWCASE = [
  {
    id: "orchid",
    title: "Orchid",
    category: "Agentic AI Film",
    year: "2025",
    runtime: "01:09",
    aspect: LANDSCAPE,
    tools: ["ae", "dr", "pr"],
    tags: ["AI generation", "Frame interpolation", "Resolve grade"],
    from: "#8B5CF6",
    to: "#06B6D4",
    src: ASSETS.orchidVideo,
    poster: ASSETS.orchidPoster,
  },
  {
    id: "atcozy",
    title: "AtCozy",
    category: "Brand Film",
    year: "2025",
    runtime: "00:29",
    aspect: PORTRAIT,
    tools: ["pr", "ae", "dr"],
    tags: ["Brand identity", "Event film", "Sound design"],
    from: "#C89B6A",
    to: "#8B5CF6",
    src: ASSETS.atcozyVideo,
    poster: ASSETS.atcozyPoster,
  },
  {
    id: "w3",
    title: "Midnight Bloom",
    category: "Colour Grade",
    year: "2024",
    runtime: "01:09",
    aspect: LANDSCAPE,
    tools: ["dr"],
    tags: ["Resolve", "Show LUT", "Halation"],
    from: "#C89B6A",
    to: "#8B5CF6",
    src: ASSETS.orchidVideo,
    poster: ASSETS.orchidPoster,
    placeholder: true,
  },
  {
    id: "w4",
    title: "Vector Sans",
    category: "Poster Series",
    year: "2024",
    runtime: "00:29",
    aspect: PORTRAIT,
    tools: ["ps", "bl"],
    tags: ["Key art", "Typography", "Print"],
    from: "#A78BFA",
    to: "#F5792A",
    src: ASSETS.atcozyVideo,
    poster: ASSETS.atcozyPoster,
    placeholder: true,
  },
  {
    id: "w5",
    title: "Skyforge",
    category: "VFX Breakdown",
    year: "2025",
    runtime: "01:09",
    aspect: LANDSCAPE,
    tools: ["ae", "bl", "ps"],
    tags: ["Compositing", "3D track", "Particles"],
    from: "#22D3EE",
    to: "#8B5CF6",
    src: ASSETS.orchidVideo,
    poster: ASSETS.orchidPoster,
    placeholder: true,
  },
  {
    id: "w6",
    title: "Loop Studio",
    category: "Brand Sting",
    year: "2024",
    runtime: "00:29",
    aspect: PORTRAIT,
    tools: ["ae", "pr"],
    tags: ["Logo animation", "Motion GFX"],
    from: "#6D5CF6",
    to: "#22D3EE",
    src: ASSETS.atcozyVideo,
    poster: ASSETS.atcozyPoster,
    placeholder: true,
  },
];

/* =====================================================================
   PROJECTS / CASE STUDIES
   ===================================================================== */
export const PROJECTS = [
  {
    id: "orchid-case",
    client: "Orchid",
    title: "An Agentic AI Video Experience",
    year: "2025",
    runtime: "01:09",
    aspect: LANDSCAPE,
    scope: ["AI Video Generation", "Frame Interpolation", "DaVinci Colour Pass", "Sound Design"],
    accent: "#8B5CF6",
    gradient: { from: "#8B5CF6", to: "#06B6D4" },
    src: ASSETS.orchidVideo,
    poster: ASSETS.orchidPoster,
    intro:
      "A fully agentic short-form film: generative shots directed frame by frame, interpolated to a true 24fps cadence, then finished like live action — a Resolve colour pass, a designed soundstage, and a hand-cut edit.",
    details: [
      {
        label: "Client / Concept",
        value:
          "Self-initiated flagship — proving an end-to-end agentic AI pipeline can hold a cinematic grade.",
        icon: Sparkles,
      },
      {
        label: "Scope",
        value: "AI Video Generation · Frame Interpolation · DaVinci Colour Pass · Sound Design",
        icon: Layers,
      },
      {
        label: "Role",
        value: "Direction, prompt design, edit, compositing, grade and final mix.",
        icon: Clapperboard,
      },
      { label: "Runtime / Year", value: "01:30 · 2025 · 4K 24fps master", icon: Clock },
    ],
    tools: ["ae", "dr", "pr", "bl", "ps"],
  },
  {
    id: "atcozy-case",
    client: "AtCozy",
    title: "Vertical Brand Film",
    year: "2025",
    runtime: "00:29",
    aspect: PORTRAIT,
    scope: ["Event Film", "Vertical Edit", "Colour Grade", "Sound Design"],
    accent: "#C89B6A",
    gradient: { from: "#C89B6A", to: "#8B5CF6" },
    src: ASSETS.atcozyVideo,
    poster: ASSETS.atcozyPoster,
    intro:
      "A warm, tactile brand film cut natively for vertical. Handheld coverage of a real room of people, edited to a slow rhythm and graded warm without letting the skin tones go orange — the whole point was to make the brand feel lived-in rather than staged.",
    details: [
      {
        label: "Client",
        value: "AtCozy — lifestyle brand launch campaign.",
        icon: Sparkles,
      },
      {
        label: "Scope",
        value: "Edit · Motion Graphics · Colour Grade · Sound Design",
        icon: Layers,
      },
      {
        label: "Role",
        value: "Offline edit, motion design, grade and mix.",
        icon: Clapperboard,
      },
      { label: "Runtime / Year", value: "00:29 · 2025 · 1080x1920 vertical", icon: Clock },
    ],
    tools: ["pr", "ae", "dr", "ps"],
  },
];

/* End credits, read top to bottom as they scroll up. */
export const CREDITS = [
  { role: "Edited by", name: "PAVAN", hero: true },
  { divider: true },
  { role: "Post-Production", name: "AFTER EFFECTS · DAVINCI RESOLVE · PREMIERE PRO" },
  { role: "3D & Design", name: "BLENDER · PHOTOSHOP" },
  { divider: true },
  { role: "Experience", name: "FOUR YEARS IN POST-PRODUCTION" },
  { role: "Approach", name: "EVERY FRAME IS A DECISION" },
  { divider: true },
  { role: "Now Booking", name: "YOUR PROJECT", hero: true },
];

export const SERVICE_OPTIONS = [
  "SaaS Video",
  "Poster Design",
  "3D Artwork",
  "Colour Grading",
  "VFX & Compositing",
  "Other",
];
