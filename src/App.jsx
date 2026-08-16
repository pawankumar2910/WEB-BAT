import React, { useCallback, useState } from "react";

import { scrollToId } from "./lib/utils.js";
import { useAudioUnlock, useSfx } from "./hooks/useSfx.js";
import { Navbar } from "./components/Navbar.jsx";
import { Hero } from "./components/Hero.jsx";
import { Services } from "./components/Services.jsx";
import { WorkShowcase } from "./components/WorkReel.jsx";
import { CinemaPlayer } from "./components/CinemaPlayer.jsx";
import { Projects } from "./components/Projects.jsx";
import { AboutCredits } from "./components/AboutCredits.jsx";
import { Contact } from "./components/Contact.jsx";

/* =====================================================================
   App owns only what crosses section boundaries: the film currently
   playing fullscreen, and the enquiry prefill the hero hands to the
   contact form. Everything else is local to its section.
   ===================================================================== */
export default function App() {
  useAudioUnlock();
  const { play } = useSfx();

  const [playing, setPlaying] = useState(null);
  const [prefill, setPrefill] = useState("");

  const openFilm = useCallback(
    (item) => {
      play("whoosh");
      setPlaying(item);
    },
    [play]
  );

  const enquire = useCallback(() => {
    setPrefill("");
    scrollToId("contact");
  }, []);

  return (
    <>
      <Navbar />

      <main>
        <Hero onEnquire={enquire} />
        <Services />
        <WorkShowcase onOpen={openFilm} />
        <Projects />
        <AboutCredits />
        <Contact prefill={prefill} />
      </main>

      <CinemaPlayer item={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
