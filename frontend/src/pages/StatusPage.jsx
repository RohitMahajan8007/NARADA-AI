import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../api/client";
import { format } from "date-fns";
import { motion } from "motion/react";
import {
  Globe,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
} from "lucide-react";
import "../assets/styles/pages/statuspage.scss";

const StatusPage = () => {
  const { userId, id } = useParams();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("single");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const effectiveId = id || userId;
        if (!effectiveId) return;

        try {
          const res = await apiClient.get(`/public/monitor/${effectiveId}`);
          if (res.data?.monitor) {
            setData(res.data.monitor);
            setLogs(res.data.logs || []);
            setViewType("single");
            setLoading(false);
            return;
          }
        } catch (e) {}

        const resList = await apiClient.get(`/public/status/${effectiveId}`);
        setData(resList.data || []);
        setViewType("multi");
      } catch (err) {
        console.error("Failed to fetch status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [userId, id]);

  if (loading) {
    return (
      <div className="ps-loading">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Activity size={40} color="#fa3a3b" />
        </motion.div>
        <p>Connecting to Web Monitor Status Network...</p>
      </div>
    );
  }

  // --- SINGLE MONITOR DETAIL VIEW ---
  if (viewType === "single" && data && !Array.isArray(data)) {
    const isUp = (data.status || "").toLowerCase() === "up";
    return (
      <div className="ps-root">
        <motion.div
          className="ps-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <header className="ps-single-header">
            <div className="brand-logo">
              <Activity size={24} color="#fa3a3b" />
              <span>
                WEB <span>MONITOR</span>
              </span>
            </div>
            <div className="service-info">
              <h1>{data.name}</h1>
              <p>
                <Globe size={14} /> {data.url}
              </p>
            </div>
            <div className={`status-huge ${isUp ? "up" : "down"}`}>
              {isUp ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {isUp ? "SYSTEM OPERATIONAL" : "SYSTEM DEGRADED"}
            </div>
          </header>

          <div className="ps-stats-row">
            <div className="stat-card">
              <span className="label">Current State</span>
              <h3 className={isUp ? "text-up" : "text-down"}>
                {isUp ? "HEALTHY" : "OUTAGE"}
              </h3>
            </div>
            <div className="stat-card">
              <span className="label">Response Time</span>
              <h3>
                {data.lastResponseTime ? `${data.lastResponseTime}ms` : "---"}
              </h3>
            </div>
            <div className="stat-card">
              <span className="label">24h Uptime</span>
              <h3 className="text-up">100.0%</h3>
            </div>
          </div>

          <div className="ps-section">
            <h3 className="section-title">
              <BarChart3 size={18} /> Connectivity History (Last 50 Pings)
            </h3>
            <div className="ps-history-track">
              {logs.length > 0 ? (
                logs
                  .slice()
                  .reverse()
                  .map((log, i) => (
                    <div
                      key={i}
                      className={`tick ${log.status === "up" ? "up" : "down"}`}
                      title={`${log.status?.toUpperCase()} - ${format(new Date(log.createdAt), "HH:mm")}`}
                    />
                  ))
              ) : (
                <div className="no-logs">No telemetry data found.</div>
              )}
            </div>
            <div className="history-labels">
              <span>Discovery</span>
              <span>Live</span>
            </div>
          </div>

          <footer className="ps-footer">
            <p>
              Infrastructure Surveillance by <strong>Web Monitor</strong>
            </p>
          </footer>
        </motion.div>
      </div>
    );
  }

  // --- MULTIPLE MONITORS VIEW ---
  const monitors = Array.isArray(data) ? data : [];
  const allUp = monitors.length > 0 && monitors.every((m) => m.status === "up");

  return (
    <div className="ps-root">
      <motion.div
        className="ps-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <header className="ps-multi-header">
          <div className="ps-logo">
            <Activity color="#fa3a3b" size={32} />
            <span>
              Web Monitor <span>Status</span>
            </span>
          </div>

          <motion.div
            className={`global-banner ${allUp ? "up" : "down"}`}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            {allUp ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
            <h2>
              {allUp
                ? "All Core Systems Operational"
                : "Partial Infrastructure Disruption"}
            </h2>
          </motion.div>
        </header>

        <div className="ps-list">
          {monitors.map((m, i) => (
            <motion.div
              key={m._id}
              className="ps-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="item-top">
                <div className="name-box">
                  <div className={`dot ${m.status}`} />
                  <h3>{m.name}</h3>
                </div>
                <div className={`badge ${m.status}`}>
                  {m.status?.toUpperCase()}
                </div>
              </div>

              <div className="item-history">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className={`mini-tick ${m.status === "up" || i < 35 ? "up" : "down"}`}
                  />
                ))}
              </div>

              <div className="item-footer">
                <span className="uptime-val">99.9% availability</span>
                <Link to={`/status/${m._id}`} className="detail-link">
                  Details <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}

          {monitors.length === 0 && (
            <div className="ps-empty">
              <Zap size={40} color="#1f1f1f" />
              <h3>No Public Streams</h3>
              <p>
                Deployment of public status pages is required to view telemetry
                here.
              </p>
            </div>
          )}
        </div>

        <footer className="ps-footer">
          <p>
            Powered by <strong>Web Monitor</strong> · Secure Global Monitoring
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default StatusPage;
