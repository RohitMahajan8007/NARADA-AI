import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useTransform,
} from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const partners = [
  {
    id: 1,
    name: "Luxury Shop",
    uptime: "99.98%",
    lat: "24ms",
    region: "US-East",
    status: "Healthy",
    img: "https://plus.unsplash.com/premium_photo-1679079456083-9f288e224e96?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=500",
  },
  {
    id: 2,
    name: "Flowstate IO",
    uptime: "100%",
    lat: "12ms",
    region: "EU-West",
    status: "Healthy",
    img: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1142&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=500",
  },
  {
    id: 3,
    name: "BitPulse",
    uptime: "99.85%",
    lat: "105ms",
    region: "Asia-South",
    status: "Warning",
    img: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=500",
  },
  {
    id: 4,
    name: "Daily Tech",
    uptime: "100%",
    lat: "45ms",
    region: "US-West",
    status: "Healthy",
    img: "https://images.unsplash.com/photo-1560671563-7a75c5838af3?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=500",
  },
  {
    id: 5,
    name: "Cloud Nodes",
    uptime: "99.92%",
    lat: "30ms",
    region: "Global",
    status: "Healthy",
    img: "https://images.unsplash.com/photo-1773332611612-ffdaa753afb1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=500",
  },
  {
    id: 6,
    name: "Dev Ops",
    uptime: "98.50%",
    lat: "210ms",
    region: "EU-Central",
    status: "Critical",
    img: "https://images.unsplash.com/photo-1455894127589-22f75500213a?q=80&w=1087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=500",
  },
];

const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const MonitorCard = ({ site }) => (
  <div className={`square-card ${site.status.toLowerCase()}`}>
    <img src={site.img} alt="" className="bg-img" />
    <div className="glass-overlay"></div>
    <div className="card-inner">
      <div className="card-top">
        <span className="region-badge">{site.region}</span>
        <div className="status-indicator">
          <div className="dot"></div>
          <span>{site.status}</span>
        </div>
      </div>
      <div className="card-main">
        <h3 className="site-name">{site.name}</h3>
        <div className="latency-info">
          <span className="val">{site.lat}</span>
          <span className="lbl">LATENCY</span>
        </div>
      </div>
      <div className="card-graph">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            d="M0 25 L15 15 L30 20 L45 5 L60 18 L75 10 L100 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </div>
      <div className="card-bottom">
        <div className="stat-pill">
          <span className="label">Uptime</span>
          <span className="value">{site.uptime}</span>
        </div>
      </div>
    </div>
  </div>
);

const LiveAssets = () => {
  const baseX = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);
  const speed = -0.001;

  useAnimationFrame((t, delta) => {
    if (!isDragging.current && !isHovered) {
      baseX.set(baseX.get() + speed * delta);
    }
  });

  const x = useTransform(baseX, (v) => `${wrap(-33.3, 0, v)}%`);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    lastPointerX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const delta = e.clientX - lastPointerX.current;
    lastPointerX.current = e.clientX;
    const trackWidth = e.currentTarget.offsetWidth;
    baseX.set(baseX.get() + (delta / trackWidth) * 100);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <section className="live-assets">
      <div className="header-flex fade-up">
        <h2>Global Infrastructure</h2>
        <div className="controls">
          <button onClick={() => baseX.set(baseX.get() + 5)}>
            <ArrowLeft size={24} />
          </button>
          <button onClick={() => baseX.set(baseX.get() - 5)}>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      <div
        className="marquee-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          isDragging.current = false;
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div className="marquee-track" style={{ x }}>
          {[...partners, ...partners, ...partners].map((site, i) => (
            <MonitorCard key={i} site={site} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LiveAssets;
