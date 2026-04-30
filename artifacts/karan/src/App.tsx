import { useEffect, useRef, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { SiDiscord } from "react-icons/si";

function Landing() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const startBeatDetection = () => {
      const video = videoRef.current;
      const title = titleRef.current;
      if (!video || !title || audioCtxRef.current) return;

      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;

        const src = ctx.createMediaElementSource(video);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        analyser.connect(ctx.destination);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let cooldownUntil = 0;

        const tick = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;

          const now = performance.now();
          if (avg > 140 && now > cooldownUntil) {
            title.classList.add("glitching");
            cooldownUntil = now + 140;
            window.setTimeout(() => title.classList.remove("glitching"), 120);
          }

          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch (error) {
        console.error("Beat detection setup failed", error);
      }
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
          startBeatDetection();
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
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
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
            data-text="Ace ⚡"
          >
            Ace <span className="text-[0.6em] align-middle">⚡</span>
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
