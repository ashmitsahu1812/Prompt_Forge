"use client";

import { useState, useEffect } from "react";

export default function RippleEffect() {
  const [ripples, setRipples] = useState<{ id: number, x: number, y: number }[]>([]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {ripples.map(r => (
        <div key={r.id} className="shockwave absolute" style={{ left: r.x, top: r.y }} />
      ))}
    </div>
  );
}
