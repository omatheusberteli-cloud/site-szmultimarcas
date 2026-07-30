import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function EagleIntro() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // Duração total da animação

    return () => clearTimeout(timer);
  }, []);

  const text = "REAL STORE";
  const letters = text.split("");

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 bg-white flex items-center justify-center overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-orange-500 opacity-95" />
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
              />
            ))}
          </div>

          {/* Main Logo Container */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Logo Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <img 
                src="/logorealstore.png" 
                alt="Real Store Logo"
                className="w-64 md:w-80 h-auto object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>

          {/* Corner decorations */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 border-l-2 border-t-2 border-orange-400/30"
              style={{
                top: i === 0 || i === 1 ? 20 : 'auto',
                bottom: i === 2 || i === 3 ? 20 : 'auto',
                left: i === 0 || i === 3 ? 20 : 'auto',
                right: i === 1 || i === 2 ? 20 : 'auto',
                transform: i === 1 || i === 3 ? 'rotate(90deg)' : i === 2 ? 'rotate(180deg)' : 'none'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.2 }}
            />
          ))}

          {/* Floating particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-40"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{
                x: [null, Math.random() * window.innerWidth],
                y: [null, Math.random() * window.innerHeight],
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Glow effect behind text */}
          <motion.div
            className="absolute w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
