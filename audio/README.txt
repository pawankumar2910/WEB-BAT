THIS FOLDER IS NO LONGER USED BY THE REACT APP
==============================================

The React site (index.html -> src/main.jsx) synthesises every UI sound at
call time with the Web Audio API. There are no audio files to add, and
dropping .mp3s in here will not change anything.

  Engine:  src/lib/audio.js
  Binding: src/hooks/useSfx.js

Voices are `hover` (tick), `click` (bass thud), `whoosh`, `open`, `close`,
`focus`, `select`, `success` and `toggleOn`. To retune one, edit its entry
in the VOICES table in src/lib/audio.js — each is a few lines of
oscillator and filtered-noise scheduling. Volume lives in the `peak`
values; the master gain and limiter are at the top of the file.

Sound is muted-state-persistent via localStorage ("pavan:sfx-muted") and
toggled from the speaker button in the navbar. Browsers keep the audio
context suspended until the first gesture, so nothing is audible until
the visitor clicks, scrolls or types once.

--------------------------------------------------------------------
The notes below apply only to the older vanilla build, which is still on
disk as index.vanilla.html + script.js + style.css. That build used
Howler.js and did read files from this folder: hover.mp3, click.mp3,
swoosh.mp3, open.mp3, toggle.mp3. If you are not running that build, you
can ignore this folder entirely.
