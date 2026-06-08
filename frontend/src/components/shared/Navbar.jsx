import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoreHorizontal } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header>
      <div className="header-inner">
        {/* LEFT: Logo */}
        <div className="left">
          <div className="logo">
            <a href="/">
              <span className="brand">Web Monitor</span>
              <span className="byline">by Monster</span>
            </a>
          </div>
        </div>

        {/* MIDDLE: Desktop Nav (Hidden on mobile via CSS) */}
        <div className="middle">
          <nav>
            <a href="/">Home</a>
            <a href="#features">Features</a>
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>

        {/* RIGHT: CTA & Mobile Menu */}
        <div className="right">
          <button id="nav-cta" onClick={() => window.location.href='/login'}>Getting Started</button>

          <div className="more">
            <div className="menu" onClick={toggleMenu}>
              {/* Using your specific rotating SVG logic */}
              <MoreHorizontal
                id="rotatesvg"
                style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
              />
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="nav-card" // Removed "show" as Motion handles this now
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href="/" onClick={() => setIsOpen(false)}>
                    Home
                  </a>
                  <a href="#features" onClick={() => setIsOpen(false)}>
                    Features
                  </a>
                  <a
                    href="https://github.com/your-repo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                  <a href="#faq" onClick={() => setIsOpen(false)}>
                    FAQ
                  </a>

                  {/* Container now properly holds the divider and button */}
                  <div className="container">
                    <div className="divider" />
                    <button className="dashboard-btn">Dashboard</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
