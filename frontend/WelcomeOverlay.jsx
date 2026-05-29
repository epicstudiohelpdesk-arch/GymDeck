import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GymDeck WelcomeOverlay (Production-Grade Minimalist)
 * A clean, typographic-first transition for professional SaaS platforms.
 */

const WelcomeOverlay = ({ name = "Admin", onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-transition after text reveal
    const timer = setTimeout(() => {
      handleExit();
    }, 2500);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleExit();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onComplete, 400);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.2 }
    },
    exit: { 
      opacity: 0, 
      scale: 1.02,
      filter: "blur(20px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#f8fafc] overflow-hidden cursor-pointer"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleExit}
        >
          <div className="relative flex flex-col items-center">
            {/* Minimal ID line */}
            <motion.div 
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div className="h-[1px] w-8 bg-blue-600/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600/60">
                Workspace Initialized
              </span>
              <div className="h-[1px] w-8 bg-blue-600/30" />
            </motion.div>

            {/* Large Typographic Reveal */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="flex flex-wrap justify-center max-w-4xl px-8 text-center">
                {"Welcome Back !".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className={`text-5xl md:text-8xl font-black tracking-tighter text-slate-900 ${char === " " ? "mr-4" : ""}`}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
              <h1 className="flex flex-wrap justify-center max-w-4xl px-8 text-center">
                {name.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className={`text-4xl md:text-6xl font-medium tracking-tight text-slate-500 ${char === " " ? "mr-4" : ""}`}
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>
            </div>

            {/* Subtle Status Line */}
            <motion.div 
              className="mt-12 flex items-center gap-4 text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[11px] font-mono tracking-widest uppercase">Sync Complete</span>
              </div>
              <div className="w-[1px] h-3 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest uppercase">System Secure</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Brand Mark */}
          <motion.div 
            className="absolute bottom-12 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <div className="w-5 h-5 text-slate-900">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.5c1.05 3.98 2.03 4.97 6 6-3.97 1.03-4.95 2.02-6 6-1.05-3.98-2.03-4.97-6-6 3.97-1.03-4.95-2.02 6-6Z" />
              </svg>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">GymDeck</span>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────
export function mountWelcomeOverlay(name, onComplete) {
  const rootElement = document.createElement("div");
  rootElement.id = "welcome-overlay-root";
  document.body.appendChild(rootElement);

  const root = createRoot(rootElement);
  
  const handleComplete = () => {
    root.unmount();
    rootElement.remove();
    if (onComplete) onComplete();
  };

  root.render(<WelcomeOverlay name={name} onComplete={handleComplete} />);
}

export default WelcomeOverlay;

