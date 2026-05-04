import React from "react";
import { motion } from "motion/react";

const pricingPlans = [
  {
    id: "box1",
    title: "Lite Monitor",
    desc: "Basic uptime for personal sites",
    price: "$5",
    unit: "/month",
    spots: "For Startups",
    img: "/assets/img/first-pricing.jpg",
    features: [
      "Up to 5 Monitors",
      "1-minute check intervals",
      "Email & Telegram alerts",
      "7-day log history",
      "Basic latency reports",
      "Standard support",
      "SSL expiry reminders",
      "Global ping checks",
    ],
  },
  {
    id: "box2",
    title: "Pro Guardian",
    desc: "AI-powered monitoring for startups",
    price: "$12",
    unit: "/month",
    spots: "For Businesses",
    img: "/assets/img/second.jpg",
    features: [
      "Up to 25 Monitors",
      "30-second check intervals",
      "Slack & Discord alerts",
      "30-day log history",
      "AI-powered incident summaries",
      "Advanced latency graphs",
      "Root cause suggestions",
      "Priority support",
    ],
  },
  {
    id: "box3",
    title: "Elite Suite",
    desc: "Full-scale infra control",
    price: "$30",
    unit: "/month",
    spots: "For Enterprises",
    img: "/assets/img/third-pricing.jpg",
    features: [
      "Unlimited Monitors",
      "10-second check intervals",
      "Custom status pages",
      "Full API Access",
      "Unlimited log history",
      "AI Root Cause Analysis",
      "Weekly AI Health reports",
      "24/7 Dedicated support",
    ],
  },
];

const Pricing = () => {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <section className="pricing" id="pricing">
      <motion.h2 {...fadeUp}>
        <span>Pricing</span>
      </motion.h2>

      <div className="bentogrid">
        <div className="bento">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={plan.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.1 }}
            >
              <div
                className="top"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${plan.img})`,
                }}
              >
                <div className="label">
                  <div className="status-dot">
                    <div className="ping"></div>
                    <div className="dot"></div>
                  </div>
                  <span className="label-text">{plan.spots}</span>
                </div>
                <h3>{plan.title}</h3>
                <p>{plan.desc}</p>
                <span className="pricing">
                  {plan.price}
                  <span className="desc">{plan.unit}</span>
                </span>
                <button onClick={() => window.location.href='/login'}>Get Started</button>
              </div>

              <div className="bottom">
                {plan.features.map((feature, i) => (
                  <p key={i}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
