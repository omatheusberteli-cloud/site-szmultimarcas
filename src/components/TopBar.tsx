import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function TopBar() {
  const [timeLeft, setTimeLeft] = useState(14580); // ~4 hours countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14580));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-black font-mono text-[9px] font-bold uppercase tracking-[0.2em] py-2 px-4 flex items-center justify-center gap-2 border-b border-white/10 z-50 relative">
      <div className="flex items-center gap-2 bg-black text-white px-3 py-0.5 rounded-full text-[8px] tracking-widest shrink-0 border border-white/20">
        <Clock className="w-3 h-3 text-orange-400 animate-spin" />
        <span>OFERTAS DA SEMANA ENCERRAM EM:</span>
        <span className="text-orange-400 font-bold">
          {hours.toString().padStart(2, "0")}h {minutes.toString().padStart(2, "0")}m {seconds.toString().padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
}
