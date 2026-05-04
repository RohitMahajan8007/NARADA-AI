import React from "react";
import { motion } from "motion/react";

const WhyChooseUs = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <section className="whychooseus" id="features">
      <motion.h2 {...fadeUp}>
        <span>Why Choose Us</span>
      </motion.h2>

      <div className="bentogrid">
        <div className="bento">
          {/* BOX 1 */}
          <motion.div
            className="box1"
            {...fadeUp}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/img/first-pricing.jpg")`,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3>
                10-Second <br /> Monitoring <br /> Intervals
              </h3>
              <p>
                Proactive probing that catches outages and latency spikes before
                they affect your users.
              </p>
            </div>
          </motion.div>

          {/* BOX 2 */}
          <motion.div
            className="box2"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/assets/img/second.jpg")`,
            }}
          >
            <h3>99.99%</h3>
            <p className="glass-pill">
              Uptime Tracking <br /> Accuracy
            </p>
          </motion.div>

          {/* BOX 3 */}
          <motion.div
            className="box3"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
          >
            <div className="top">
              <div className="scroll-wrapper">
                {/* Row 1 - Infrastructure */}
                <div className="scroll-container row-1">
                  <div className="scroll-track">
                    {[1, 2, 3, 4].map(
                      (
                        i, // Repeat items for infinite loop
                      ) => (
                        <React.Fragment key={i}>
                          <div className="logo-item">
                            <img src="/assets/img/google.png" alt="Google" />
                          </div>
                          <div className="logo-item">
                            <img src="/assets/img/meta.png" alt="Meta" />
                          </div>
                          <div className="logo-item">
                            <img
                              src="/assets/img/instagram.png"
                              alt="Instagram"
                            />
                          </div>
                          <div className="logo-item">
                            <img src="/assets/img/youtube.png" alt="YouTube" />
                          </div>
                        </React.Fragment>
                      ),
                    )}
                  </div>
                </div>

                {/* Row 2 - Tech Stack */}
                <div className="scroll-container row-2">
                  <div className="scroll-track">
                    {[1, 2, 3, 4].map((i) => (
                      <React.Fragment key={i}>
                        <div className="logo-item">
                          <img src="/assets/img/framer.png" alt="Framer" />
                        </div>
                        <div className="logo-item">
                          <img src="/assets/img/blender.png" alt="Blender" />
                        </div>
                        <div className="logo-item">
                          <img src="/assets/img/tailwind.png" alt="Tailwind" />
                        </div>
                        <div className="logo-item">
                          <img
                            src="/assets/img/visual-studio-code.png"
                            alt="Visual Studio"
                          />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Row 3 - Platforms */}
                <div className="scroll-container row-3">
                  <div className="scroll-track">
                    {[1, 2, 3, 4].map((i) => (
                      <React.Fragment key={i}>
                        <div className="logo-item">
                          <img src="/assets/img/figma.png" alt="Figma" />
                        </div>
                        <div className="logo-item">
                          <img src="/assets/img/vue.png" alt="Vue JS" />
                        </div>
                        <div className="logo-item">
                          <img src="/assets/img/vimeo.png" alt="Vimeo" />
                        </div>
                        <div className="logo-item">
                          <img src="/assets/img/twitch.png" alt="Twitch" />
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bottom">
              <h3>Trusted by 10K+ Brands</h3>
              <p className="glass-pill">
                From independent developers to mission-critical infrastructure,
                Narada AI is the choice for high-performance systems worldwide.
              </p>
            </div>
          </motion.div>

          {/* BOX 4 */}
          <motion.div
            className="box4"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
          >
            <div className="left">
              <h3>Instant Alerts on Every Channel</h3>
              <p className="glass-pill">
                Narada AI integrates seamlessly with your existing workflow. Get
                downtime notifications on Slack, Telegram, Discord, and more in
                under 2 seconds.
              </p>
            </div>
            <div className="right">
              <div className="scroll-wrapper-vertical">
                {/* Column 1: Scrolling Down */}
                <div className="scroll-container-vertical col-1">
                  <div className="scroll-track-vertical">
                    {/* Add 8-10 integration logos here */}
                    <div className="logo-item-vertical">
                      <img src="/assets/img/telegram.png" alt="Telegram" />
                    </div>
                    <div className="logo-item-vertical">
                      <img src="/assets/img/discord.png" alt="Discord" />
                    </div>
                    <div className="logo-item-vertical">
                      <img src="/assets/img/snapchat.png" alt="Snapchat" />
                    </div>
                    <div className="logo-item-vertical">
                      <img src="/assets/img/google.png" alt="Google" />
                    </div>
                    {/* Duplicate for infinite loop */}
                    <div className="logo-item-vertical">
                      <img src="/assets/img/telegram.png" alt="Telegram" />
                    </div>
                    <div className="logo-item-vertical">
                      <img src="/assets/img/discord.png" alt="Discord" />
                    </div>
                  </div>
                </div>
                {/* Column 2: Scrolling Up (Visible on Desktop) */}
                <div className="scroll-container-vertical col-2">
                  <div className="scroll-track-vertical">
                    <div className="logo-item-vertical">
                      <img src="/assets/img/meta.png" alt="Meta" />
                    </div>
                    <div className="logo-item-vertical">
                      <img src="/assets/img/github.png" alt="Github" />
                    </div>
                    <div className="logo-item-vertical">
                      <img src="/assets/img/wechat.png" alt="Wechat" />
                    </div>
                    <div className="logo-item-vertical">
                      <img src="/assets/img/twitch.png" alt="Twitch" />
                    </div>
                    {/* Duplicate for infinite loop */}
                    <div className="logo-item-vertical">
                      <img src="/assets/img/meta.png" alt="Meta" />
                    </div>
                    <div className="logo-item-vertical">
                      <img src="/assets/img/github.png" alt="Github" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* BOX 5 */}
          <motion.div
            className="box5"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.4 }}
          >
            <h3>40ms</h3>
            <p className="glass-pill">
              Average Global <br /> Response Latency
            </p>
          </motion.div>

          {/* BOX 6 */}
          <motion.div
            className="box6"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.5 }}
          >
            {/* The Image Side */}
            <div
              className="left"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url("/assets/img/second.jpg")`,
              }}
            ></div>

            {/* The Text Side */}
            <div className="right">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>

              <h3>AI Root Cause Analysis</h3>
              <p className="glass-pill">
                Narada doesn't just detect downtime—it explains it. Get instant
                AI summaries identifying the exact cause and suggested fixes for
                every incident.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
