'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const COLS = 4;
const ROWS = 3;
const TOTAL = COLS * ROWS;

interface Drop {
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function makeDrops(count: number): Drop[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    size: 4 + Math.random() * 7,
    duration: 7 + Math.random() * 8,
    delay: Math.random() * 10,
    opacity: 0.12 + Math.random() * 0.22,
  }));
}

export default function Home() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [drops] = useState<Drop[]>(() => makeDrops(14));

  type Ripple = {
    x: number; y: number; r: number; maxR: number; alpha: number; fill: boolean;
  };
  const ripples = useRef<Ripple[]>([]);

  useEffect(() => { setLoaded(true); }, []);

  // Canvas ink ripple loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ripples.current = ripples.current.filter(r => r.alpha > 0.006);
      for (const r of ripples.current) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        if (r.fill) {
          ctx.fillStyle = `rgba(0,0,0,${r.alpha * 0.55})`;
          ctx.fill();
        } else {
          ctx.strokeStyle = `rgba(153,27,27,${r.alpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        r.r += (r.maxR - r.r) * 0.08;
        r.alpha *= 0.925;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const spawnRipple = useCallback((cx: number, cy: number) => {
    ripples.current.push({ x: cx, y: cy, r: 4, maxR: 95, alpha: 0.85, fill: false });
    ripples.current.push({ x: cx, y: cy, r: 2, maxR: 38, alpha: 0.45, fill: true });
    for (let i = 0; i < 7; i++) {
      ripples.current.push({
        x: cx + (Math.random() - 0.5) * 90,
        y: cy + (Math.random() - 0.5) * 90,
        r: 1,
        maxR: 6 + Math.random() * 28,
        alpha: 0.25 + Math.random() * 0.45,
        fill: Math.random() > 0.5,
      });
    }
  }, []);

  const handleCellClick = (idx: number, e: React.MouseEvent) => {
    spawnRipple(e.clientX, e.clientY);
    setSelected(prev => (prev === idx ? null : idx));
  };

  const selCol = selected !== null ? selected % COLS : 0;
  const selRow = selected !== null ? Math.floor(selected / COLS) : 0;

  return (
    <main className="relative min-h-screen bg-stone-950 flex flex-col items-center justify-center overflow-hidden select-none" style={{ cursor: 'crosshair' }}>

      {/* Floating ink drops background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {drops.map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-red-900"
            style={{
              left: `${d.x}%`,
              top: '-16px',
              width: d.size,
              height: d.size,
              opacity: d.opacity,
              animation: `ink-drop ${d.duration}s ${d.delay}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* Canvas ripple layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Header */}
      <header
        className="relative z-10 text-center mb-10 transition-all duration-1000"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(-12px)' }}
      >
        <div
          className="text-5xl mb-2 tracking-[0.45em] text-stone-100"
          style={{ fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif', fontWeight: 300 }}
        >
          書法
        </div>
        <div className="text-xs tracking-[0.55em] text-stone-500 uppercase mb-3">
          Calligraphy · Interactive
        </div>
        <div className="h-px w-20 mx-auto bg-gradient-to-r from-transparent via-red-900/80 to-transparent" />
      </header>

      {/* Artwork */}
      <div
        className="relative z-10 w-full max-w-2xl px-4 transition-all duration-1000 delay-200"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'scale(1)' : 'scale(0.97)' }}
      >
        <div className="relative">
          {/* Decorative borders */}
          <div className="absolute -inset-1 border border-red-950/50 pointer-events-none" />
          <div className="absolute -inset-2.5 border border-stone-800/30 pointer-events-none" />

          <img
            src="/art01.jpeg"
            alt="Chinese Calligraphy"
            className="block w-full h-auto"
            draggable={false}
          />

          {/* Interactive grid */}
          <div
            className="absolute inset-0"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            }}
          >
            {Array.from({ length: TOTAL }, (_, i) => {
              const isHov = hovered === i;
              const isSel = selected === i;
              return (
                <div
                  key={i}
                  className="relative transition-all duration-200"
                  style={{
                    background: isSel
                      ? 'rgba(127,29,29,0.20)'
                      : isHov
                      ? 'rgba(127,29,29,0.10)'
                      : 'transparent',
                    boxShadow: isSel
                      ? 'inset 0 0 0 2px rgba(185,28,28,0.75)'
                      : isHov
                      ? 'inset 0 0 0 1px rgba(185,28,28,0.45)'
                      : 'none',
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={e => handleCellClick(i, e)}
                >
                  {isHov && (
                    <>
                      <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-red-700/80 pointer-events-none" />
                      <span className="absolute top-1 right-1 w-2 h-2 border-t border-r border-red-700/80 pointer-events-none" />
                      <span className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-red-700/80 pointer-events-none" />
                      <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-red-700/80 pointer-events-none" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p
          className="text-center text-stone-600 text-xs tracking-[0.4em] uppercase mt-5 transition-opacity duration-1000 delay-700"
          style={{ opacity: loaded ? 1 : 0 }}
        >
          Hover & click any character to explore
        </p>
      </div>

      {/* Character detail modal */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: 'rgba(12,10,9,0.88)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-stone-900 border border-stone-700 p-6 w-72 text-center animate-fade-in-up"
            style={{ boxShadow: '0 0 50px rgba(153,27,27,0.12), 0 30px 60px rgba(0,0,0,0.9)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Corner accents */}
            <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-900" />
            <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-900" />
            <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-900" />
            <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-900" />

            {/* Zoomed character view */}
            <div className="relative w-full overflow-hidden mb-5" style={{ paddingBottom: '100%' }}>
              <img
                src="/art01.jpeg"
                alt={`Character ${selected + 1}`}
                draggable={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${COLS * 100}%`,
                  height: `${ROWS * 100}%`,
                  transform: `translate(-${(selCol / COLS) * 100}%, -${(selRow / ROWS) * 100}%)`,
                  imageRendering: 'pixelated',
                }}
              />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent mb-4" />

            <p className="text-stone-500 text-xs tracking-[0.35em] uppercase mb-1">Character</p>
            <p className="text-stone-200 text-xl tracking-widest mb-5">
              {selected + 1}
              <span className="text-stone-600 text-sm ml-1">/ {TOTAL}</span>
            </p>

            <div className="flex gap-2 justify-center">
              {[
                { label: '← Prev', action: () => setSelected(p => p !== null ? (p > 0 ? p - 1 : TOTAL - 1) : 0) },
                { label: 'Close', action: () => setSelected(null) },
                { label: 'Next →', action: () => setSelected(p => p !== null ? (p < TOTAL - 1 ? p + 1 : 0) : 0) },
              ].map(btn => (
                <button
                  key={btn.label}
                  className="px-3 py-1.5 border border-stone-700 text-stone-400 text-xs tracking-widest hover:border-red-900 hover:text-stone-100 transition-all duration-200"
                  onClick={btn.action}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="relative z-10 mt-10 text-stone-700 text-xs tracking-[0.5em] transition-opacity duration-1000 delay-1000"
        style={{ opacity: loaded ? 1 : 0 }}
      >
        CHINESE CALLIGRAPHY · 書法藝術
      </footer>
    </main>
  );
}
