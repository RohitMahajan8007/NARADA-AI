import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowRight, ShieldCheck, TrendingUp, Rocket } from "lucide-react";

// Reusable Tilt Card
const TiltCard = ({ children, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={className}
    >
      <motion.div
        style={{
          background: useTransform(
            [mouseXSpring, mouseYSpring],
            ([lastX, lastY]) =>
              `radial-gradient(circle at ${50 + lastX * 100}% ${50 + lastY * 100}%, rgba(0,255,132,0.1) 0%, transparent 80%)`,
          ),
          position: "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
      <div style={{ transform: "translateZ(50px)" }}>{children}</div>
    </motion.div>
  );
};

const Solution = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section className="solution-section">
      <motion.h2 {...fadeUp}>
        <span>The Narada Peace of Mind</span>
      </motion.h2>

      <div className="solution-grid">
        {/* CARD 1: THE SHIELD */}
        <TiltCard className="solution-card">
          <div className="visual-box">
            <div className="browser-mock">
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="status-text">200 OK</div>
              <p>System Healthy</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="floating-icon"
            >
              <ShieldCheck color="#00ff84" size={48} />
            </motion.div>
          </div>
          <div className="content">
            <h3>Proactive Shield</h3>
            <p>
              Narada watches every millisecond. If a pulse weakens, you're the
              first to know—not the last.
            </p>
          </div>
        </TiltCard>

        <div className="connector">
          <ArrowRight size={32} />
        </div>

        {/* CARD 2: THE PROFIT (Upward Graph) */}
        <TiltCard className="solution-card">
          <div className="visual-box">
            <div className="chart-mock">
              <svg viewBox="0 0 100 50" className="ascending-chart">
                <motion.path
                  d="M0,45 L20,35 L40,38 L60,15 L80,18 L100,5" // PATH GOES UP
                  fill="none"
                  stroke="#00ff84"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="gain-tag"
              >
                +$48,200
              </motion.div>
            </div>
            <TrendingUp className="trending-icon" size={40} color="#00ff84" />
          </div>
          <div className="content">
            <h3>Revenue Secured</h3>
            <p>
              Every checkout stays live. Every ad-click converts. Your bottom
              line is protected 24/7.
            </p>
          </div>
        </TiltCard>

        <div className="connector">
          <ArrowRight size={32} />
        </div>

        {/* CARD 3: THE SCALE (Rocket Launch) */}
        <TiltCard className="solution-card">
          <div className="visual-box">
            <div className="scaling-nodes">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  className="node"
                />
              ))}
            </div>
            {/* ROCKET TAKEOFF ANIMATION */}
            <motion.div
              animate={{
                y: [0, -10, 0], // Jitter/Hover
                x: [-1, 1, -1], // Vibration
              }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="rocket-wrapper"
            >
              <Rocket color="#00ff84" size={44} />
            </motion.div>
            <div className="status-label">INFRA: OPTIMIZED</div>
          </div>
          <div className="content">
            <h3>Seamless Growth</h3>
            <p>
              Scale with confidence. As you grow, Narada scales with you,
              ensuring global stability.
            </p>
          </div>
        </TiltCard>
      </div>
    </section>
  );
};

export default Solution;
