import React, { useState } from "react";
import { motion } from "motion/react";

const testimonialData = {
  individuals: [
    {
      id: 1,
      name: "Laura Sydney",
      role: "Indie Hacker",
      text: "Narada caught a 503 error on my portfolio before I even finished my coffee. Essential tool.",
      img: "https://images.unsplash.com/photo-1516522973472-f009f23bba59?q=80&w=800",
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Freelancer",
      text: "The Telegram alerts are instant. No more checking my dashboard manually every hour.",
      img: "https://images.unsplash.com/photo-1586907835000-f692bbd4c9e0?q=80&w=800",
    },
    {
      id: 3,
      name: "Farah Kazism",
      role: "Web Dev",
      text: "Finally, a monitoring tool that looks as good as the high-end sites I build for my clients.",
      img: "https://images.unsplash.com/photo-1541823709867-1b206113eafd?q=80&w=800",
    },
  ],
  startups: [
    {
      id: 4,
      name: "Loreal",
      role: "Founder",
      text: "Saved us $2,000 in lost revenue during our Product Hunt launch. The AI logs are a lifesaver.",
      img: "https://images.unsplash.com/photo-1504276048855-f3d60e69632f",
    },
    {
      id: 5,
      name: "MINI UI",
      role: "Design Agency",
      text: "Our clients love the public status pages. It builds massive trust without extra work.",
      img: "https://images.unsplash.com/photo-1601396344868-31e008cd6e7c?q=80&w=800",
    },
    {
      id: 10,
      name: "PeaceVilla",
      role: "SaaS Founder",
      text: "Saved us $2,000 in lost revenue during our Product Hunt launch. The AI logs are a lifesaver.",
      img: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=800",
    },
  ],
  business: [
    {
      id: 6,
      name: "SpaceX",
      role: "Ops Director",
      text: "Global probing from 20+ locations ensures our enterprise infrastructure is always reachable.",
      img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800",
    },
    {
      id: 7,
      name: "Google",
      role: "SDE Lead",
      text: "The AI Root Cause Analysis reduced our Mean Time to Recovery by 40%. Highly reliable.",
      img: "https://images.unsplash.com/photo-1524504542391-127872011665?q=80&w=800",
    },
    {
      id: 11,
      name: "Global Ops",
      role: "Systems VP",
      text: "Narada is now our primary source of truth for global latency tracking and system health.",
      img: "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800",
    },
  ],
};

const CardDeck = ({ category, items }) => {
  const [cards, setCards] = useState(items);

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.x) > 100) {
      setCards((prev) => {
        const newArr = [...prev];
        // YOUR JS LOGIC: Take top (last in array) and move to back (start of array)
        const topCard = newArr.pop();
        newArr.unshift(topCard);
        return newArr;
      });
    }
  };

  return (
    <div className="deck-column">
      <div className="category-header">
        <div className="dot"></div>
        <span>{category}</span>
      </div>

      <div className="stack-container">
        {cards.map((card, i) => {
          const isTop = i === cards.length - 1;
          const offset = cards.length - 1 - i;

          return (
            <motion.div
              key={card.id}
              className="testimonial-card"
              drag={isTop ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              animate={{
                // AGGRESSIVE TILT LOGIC
                rotateZ: isTop ? 0 : offset * -12, // Fanned out rotation
                rotateX: isTop ? 0 : 15, // Leaning back
                x: isTop ? 0 : offset * 25, // Offset to the right
                y: isTop ? 0 : offset * -15, // Offset upwards
                scale: isTop ? 1 : 1 - offset * 0.07,
                zIndex: i,
              }}
              whileDrag={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{
                backgroundImage: `url(${card.img})`,
                cursor: isTop ? "grab" : "default",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Separate Blur Elements */}
              <div className={`card-content ${isTop ? "visible" : "hidden"}`}>
                <div className="glass-label">
                  <h2>{card.name}</h2>
                  <p>{card.role}</p>
                </div>
                <div className="glass-quote">
                  <p>"{card.text}"</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2 className="fade-up">
        <span>Real Stories. Real Uptime.</span>
      </h2>
      <div className="decks-grid">
        <CardDeck category="Individuals" items={testimonialData.individuals} />
        <CardDeck category="Startups" items={testimonialData.startups} />
        <CardDeck category="Enterprise" items={testimonialData.business} />
      </div>
    </section>
  );
};

export default Testimonials;
