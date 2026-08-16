ASSETS USED BY THE SITE
=======================

Filenames are mapped in src/lib/constants.js (the ASSETS object). Change a
name there, not here.

HERO REVEAL PAIR  — hero-cowl.webp / hero-face.webp     (1800x1350 each)
----------------------------------------------------------------------
  hero-face.webp   the bare face, sits underneath, never masked
  hero-cowl.webp   the Batman cowl, sits on top, masked by the cursor

  THESE TWO MUST STAY PIXEL-ALIGNED AND THE SAME SIZE. The reveal works by
  punching a transparent hole in the cowl so the face shows through the
  gap; if the images drift by even a few pixels the face no longer lines
  up inside the hole. Both were generated from the 3200x2400 originals in
  Downloads by the same resize pass. Regenerate them together or not at
  all.

  hero-cowl.png / hero-face.png are lossless fallbacks (~1.2 MB each) and
  are not referenced by default — the .webp pair is ~120 KB combined.

STILLS
------
  pavan-portrait.jpg   900x900  the coffee illustration, used framed in
                       the About / end-credits section.

FILMS
-----
  orchid-video.mp4     1920x1080 landscape, 69s   (ORCHID case study)
  atcozy-video.mp4     1080x1920 VERTICAL,   29s  (AtCozy brand film)

  The AtCozy master is portrait. Every component that renders it reads
  `aspect` from the item data (LANDSCAPE / PORTRAIT in constants.js) and
  contains it over a blurred backdrop rather than cropping it into a 16:9
  slot. Don't hardcode aspect-video around these.

POSTERS
-------
  poster-orchid.jpg    single decoded frame, 960px wide
  poster-atcozy.jpg    single decoded frame, 960px wide

  The work reel renders 24 tiles. Mounting a <video> in each one opened 24
  range requests against the two multi-megabyte masters before the page
  had painted. Tiles now show these posters and only mount a real <video>
  while the pointer is on them, so a cold load pulls two JPEGs instead of
  ~57 MB of film.

  Regenerate with ffmpeg (any build):
    ffmpeg -ss 6 -i orchid-video.mp4 -frames:v 1 -vf scale=960:-2 -q:v 4 poster-orchid.jpg

UNUSED
------
  pavan-3d-model.png   left over from the previous hero; nothing imports
                       it now that the reveal pair is in place.
