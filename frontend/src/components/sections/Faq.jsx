import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    question: "What is Narada AI?",
    answer:
      "Narada AI monitors your website 24/7 and alerts you before downtime impacts your users—so you stay one step ahead, always.",
  },
  {
    question: "How is Narada AI different from other monitoring tools?",
    answer:
      "Most tools tell you after your site is down.Narada AI predicts issues early and notifies you before downtime even begins.",
  },
  {
    question: "How does Narada AI predict downtime?",
    answer:
      "We use intelligent monitoring and pattern analysis to detect unusual behavior, performance drops, and early warning signals—before they become critical failures.",
  },
  {
    question: "Do I need technical knowledge to use it?",
    answer:
      "Not at all. Narada AI is built for simplicity—just connect your site and we handle the rest.",
  },
  {
    question: "How will I receive alerts?",
    answer:
      "You’ll get instant alerts via email, SMS, or integrations like Slack—so you can act immediately.",
  },
  // {
  //   question: "Can Narada AI monitor multiple websites?",
  //   answer:
  //     "Yes, you can monitor multiple domains from a single dashboard with ease.",
  // },
  // {
  //   question: "Will it affect my website performance?",
  //   answer:
  //     "No. Narada AI runs lightweight checks that do not impact your site’s speed or user experience.",
  // },
  // {
  //   question: "Is Narada AI suitable for small businesses?",
  //   answer:
  //     "Absolutely. Whether you're a startup or scaling business, Narada AI helps you avoid costly downtime.",
  // },
];

const FAQItem = ({ faq, isOpen, toggle }) => {
  return (
    <div className="faq-item">
      <button className="faq-header" onClick={toggle} aria-expanded={isOpen}>
        <h3>{faq.question}</h3>
        <motion.svg
          className="arrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="faq-content">
              <p>{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="faq" id="faq">
      <h2 className="fade-up">
        <span>FAQ</span>
      </h2>

      <div className="bentogrid">
        <div className="bento">
          <div className="box1">
            <h3>
              Got Questions? <br />
              We Got Answers
            </h3>
            <p>
              Straightforward, no-fluff answers to help you feel confident about
              working with us.
            </p>
          </div>

          <div className="box2">
            <div className="faq-container">
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    faq={faq}
                    isOpen={openIndex === index}
                    toggle={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
