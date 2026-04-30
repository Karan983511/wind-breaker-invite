import { useEffect, useRef, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { SiDiscord } from "react-icons/si";

function Landing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const startTimedGlitch = () => {
      const title = titleRef.current;
      if (!title || intervalRef.current !== null) return;

      // Change the interval (ms) to match the song's beat
      intervalRef.current = window.setInterval(() => {
        title.classList.add("glitching");
        window.setTimeout(() => title.classList.remove("glitching"), 150);
      }, 500);
    };

    const handleInteraction = async () => {
      if (hasInteracted) return;

      try {
        if (videoRef.current) {
          videoRef.current.muted = false;
          if (videoRef.current.paused) {
            await videoRef.current.play();
          }
          setHasInteracted(true);
          setHintVisible(false);
          startTimedGlitch();
        }
      } catch (error) {
        console.error("Autoplay failed on interaction", error);
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hasInteracted]);

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden">
      {/* CRT overlay */}
      <div className="scanlines" />

      {/* Background Video */}
      <video
        ref={videoRef}
        src={`${import.meta.env.BASE_URL}karan.mp4`}
        autoPlay
        loop
        muted // Starts muted, unmuted on interaction
        playsInline
        preload="auto"
        disablePictureInPicture
        className="fixed inset-0 w-full h-full object-cover z-[-2] bg-black"
        style={{ filter: 'brightness(0.7) contrast(1.2)' }}
      />

      {/* Dark Gradient Overlay */}
      <div className="fixed inset-0 z-[-1] bg-black/40 bg-gradient-to-b from-transparent via-black/20 to-black/90" />

      {/* Username badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-mono text-white/50 select-none">
        <span className="text-primary/70">@</span>karankk0415v
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center justify-center gap-8 px-4 w-full max-w-2xl">
        <div className="glitch-wrapper">
          <h1 
            ref={titleRef}
            className="glitch-text text-5xl sm:text-7xl md:text-[6rem] font-bold text-white tracking-tighter"
            data-text="Wind Breaker 🍁"
          >
            Wind Breaker <span className="text-[0.6em] align-middle">🍁</span>
          </h1>
        </div>

        <a
          href="https://discord.gg/Xh5jHuU2m"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-neon mt-4 flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto min-w-[240px] rounded-sm group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
        >
          <SiDiscord className="w-6 h-6 transition-transform group-hover:scale-110" />
          <span className="font-bold text-lg">JOIN SERVER</span>
        </a>
      </div>

      {/* Audio Hint */}
      <div 
        className={`absolute bottom-8 left-0 right-0 text-center transition-opacity duration-1000 ${
          hintVisible ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-sm tracking-[0.2em] uppercase text-white animate-pulse">
          [ tap anywhere for sound ]
        </p>
      </div>
    </main>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={Landing} />
      </Switch>
    </WouterRouter>
  );
}

export default App;
