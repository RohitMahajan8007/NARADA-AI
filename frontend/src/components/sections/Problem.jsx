import React from "react";
import { motion } from "motion/react";
import { ArrowRight, AlertTriangle, TrendingDown, Skull } from "lucide-react";

const Problem = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section className="problem-section">
      <motion.h2 {...fadeUp}>
        <span>The Downtime Domino Effect</span>
      </motion.h2>

      <div className="problem-grid">
        {/* CARD 1: THE TRIGGER */}
        <motion.div className="problem-card" {...fadeUp}>
          <div className="visual-box error-bg">
            <div className="browser-mock">
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="error-text">503</div>
              <p>Service Unavailable</p>
            </div>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="alert-icon"
            >
              <AlertTriangle color="#fa3a3b" size={48} />
            </motion.div>
          </div>
          <div className="content">
            <h3>Site Goes Down</h3>
            <p>
              A silent server crash happens while you’re away. No one is
              alerted.
            </p>
          </div>
        </motion.div>

        <div className="connector">
          <ArrowRight size={32} />
        </div>

        {/* CARD 2: THE IMPACT */}
        <motion.div
          className="problem-card"
          {...fadeUp}
          transition={{ delay: 0.1 }}
        >
          <div className="visual-box money-bg">
            <div className="chart-mock">
              {/* SVG Descending Chart */}
              <svg viewBox="0 0 100 50" className="descending-chart">
                <motion.path
                  d="M0,5 L25,15 L50,10 L75,35 L100,45"
                  fill="none"
                  stroke="#fa3a3b"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2 }}
                />
              </svg>
              <div className="loss-tag">-$12,400</div>
            </div>
            <TrendingDown className="trending-icon" size={40} />
          </div>
          <div className="content">
            <h3>Revenue Bleeds</h3>
            <p>
              Customers hit a wall. Sales stop. Marketing spend is wasted in
              real-time.
            </p>
          </div>
        </motion.div>

        <div className="connector">
          <ArrowRight size={32} />
        </div>

        {/* CARD 3: THE DISASTER */}
        <motion.div
          className="problem-card"
          {...fadeUp}
          transition={{ delay: 0.2 }}
        >
          <div className="visual-box collapse-bg">
            <div className="user-churn">
              <div className="churn-bar" style={{ height: "20%" }}></div>
              <div className="churn-bar" style={{ height: "40%" }}></div>
              <div
                className="churn-bar"
                style={{ height: "80%", background: "#fa3a3b" }}
              ></div>
            </div>
            <div className="status-label">Reputation: CRITICAL</div>
            <Skull className="skull-icon" size={40} />
          </div>
          <div className="content">
            <h3>Brand Collapse</h3>
            <p>
              Users lose trust and move to competitors. Your growth curve
              flattens.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Problem;
