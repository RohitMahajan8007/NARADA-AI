import React from "react";
// Import from motion/react for the latest version
import { motion } from "motion/react";

const Workflow = () => {
  // 1. Define the animation settings
  const containerVariants = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // This creates the 01 -> 02 -> 03 sequence
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 40 },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Custom smooth ease-out
      },
    },
  };

  return (
    <section className="workflow" id="workflow">
      {/* Heading Animation */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span>Our Workflow</span>
      </motion.h2>

      {/* Bento Grid Wrapper */}
      <motion.div
        className="bentogrid"
        variants={containerVariants}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }} // Trigger slightly before it hits center
      >
        <div className="bento">
          {/* BOX 01 */}
          <motion.div className="box1" variants={itemVariants}>
            <div className="top">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.5 }}
                transition={{ delay: 0.4 }}
              >
                01
              </motion.span>
            </div>
            <div className="bottom">
              <h3>Connect Your Assets</h3>
              <p>
                Add your website URLs or API endpoints — simply paste the link
                and Narada AI handles the rest.
              </p>
            </div>
          </motion.div>

          {/* BOX 02 */}
          <motion.div className="box2" variants={itemVariants}>
            <div className="top">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.5 }}
                transition={{ delay: 0.5 }}
              >
                02
              </motion.span>
            </div>
            <div className="bottom">
              <h3>Global Probing</h3>
              <p>
                Our edge nodes monitor your infrastructure from 20+ locations
                every 10 seconds.
              </p>
            </div>
          </motion.div>

          {/* BOX 03 */}
          <motion.div className="box3" variants={itemVariants}>
            <div className="top">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.5 }}
                transition={{ delay: 0.6 }}
              >
                03
              </motion.span>
            </div>
            <div className="bottom">
              <h3>AI Failure Analysis</h3>
              <p>
                Narada AI identifies the root cause and captures technical
                headers immediately upon failure.
              </p>
            </div>
          </motion.div>

          {/* BOX 04 */}
          <motion.div className="box4" variants={itemVariants}>
            <div className="top">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.5 }}
                transition={{ delay: 0.7 }}
              >
                04
              </motion.span>
            </div>
            <div className="bottom">
              <h3>Instant Resolution</h3>
              <p>
                Receive actionable alerts via Slack or Telegram and resolve
                incidents before users notice.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Workflow;
