import { useEffect, useRef, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { SiDiscord } from "react-icons/si";
import { useGetViews } from "@workspace/api-client-react";

function Landing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { data: viewData } = useGetViews({ query: { retry: false, throwOnError: false } });

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

    const spawnBurst = (x: number, y: number) => {
      const id = Date.now() + Math.random();
      setBursts((prev) => [...prev, { id, x, y }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 250);
    };

    const handleInteraction = async (e: MouseEvent | TouchEvent | KeyboardEvent) => {
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      }

      spawnBurst(x, y);

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

      {/* Tap-point glitch bursts */}
      {bursts.map((b) => (
        <div
          key={b.id}
          className="glitch-burst"
          style={{ left: b.x, top: b.y }}
        />
      ))}

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

      {/* Bottom-left HUD: username + view counter */}
      <div
        className="fade-in absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 font-mono select-none"
        style={{}}
      >
        {/* View count */}
        <div className="flex items-center gap-1.5">
          {/* Blinking dot */}
          <span
            className="inline-block w-[5px] h-[5px] rounded-full"
            style={{
              background: 'rgba(0,255,255,0.7)',
              boxShadow: '0 0 4px rgba(0,255,255,0.8)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span
            className="text-[10px] sm:text-[11px] tracking-[0.18em] tabular-nums text-white/60"
            style={{ textShadow: '0 0 8px rgba(0,255,255,0.4)' }}
          >
            {viewData != null ? viewData.count.toLocaleString() : '—'}
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-white/25 ml-0.5">
            views
          </span>
        </div>

        {/* Username */}
        <p
          className="text-[9px] sm:text-[10px] tracking-[0.28em] uppercase text-white/40"
          style={{ textShadow: '0 0 6px rgba(0,255,255,0.3)' }}
        >
          <span style={{ color: 'rgba(0,255,255,0.6)' }}>@</span>karankk0415v
        </p>
      </div>

      {/* Main Content */}
      <div className="fade-in-delayed z-10 flex flex-col items-center justify-center gap-8 px-4 w-full max-w-2xl">
        <div className="glitch-wrapper">
          <h1 
            ref={titleRef}
            className="glitch-text text-5xl sm:text-7xl md:text-[6rem] font-bold text-white tracking-tighter"
            data-text="Wind Breaker"
          >
            Wind Breaker
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
