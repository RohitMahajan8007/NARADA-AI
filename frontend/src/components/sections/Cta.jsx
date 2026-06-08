import React from "react";
import { motion } from "motion/react";

const Contact = () => {
  // Animation Variants
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.8, delay: 0.2 },
  };

  return (
    <section className="contact" id="contact-section">
      {/* Section Heading */}
      <motion.h2 className="fade-up" {...fadeUp}>
        <span>Contact</span>
      </motion.h2>

      {/* Main CTA Card */}
      <div className="call">
        <div className="left">
          <motion.h3 className="call-text" {...fadeUp}>
            Ready to stop downtime before it starts?
          </motion.h3>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
          >
            Let’s turn your monitoring into proactive protection that secures
            your revenue and builds user trust. Deploy Web Monitor today and never be
            surprised by an outage again.
          </motion.p>

          <motion.button
            id="contact"
            className="fade-in"
            {...fadeIn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.href='/login'}
          >
            Start Monitoring Free
          </motion.button>
        </div>

        <motion.div
          className="right"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img src="/assets/img/cta.jpg" alt="Web Monitor" />
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
