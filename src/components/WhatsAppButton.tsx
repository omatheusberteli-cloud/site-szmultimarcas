import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ASSETS } from "../lib/assets";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "5527998499540";

  const handleOpenChat = (customText?: string) => {
    const text = customText || "Olá, equipe SZ Multimarcas! Gostaria de ajuda para escolher um produto ou tirar dúvidas sobre pagamentos e envio.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Popover Bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-72 bg-[#0E0E0E] border border-white/10 p-5 rounded-none shadow-2xl text-white relative"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                <img src={ASSETS.logo} alt="SZ Multimarcas" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Atendimento</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest">Vendedor Online</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenChat()}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold h-10 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              Iniciar Conversa WhatsApp
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-green-500 text-black rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.4)] relative border-2 border-white/20 group"
        title="Atendimento WhatsApp VIP"
      >
        <MessageCircle className="w-7 h-7 fill-black text-green-500" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-bold text-white">
          1
        </span>
      </motion.button>

    </div>
  );
}
