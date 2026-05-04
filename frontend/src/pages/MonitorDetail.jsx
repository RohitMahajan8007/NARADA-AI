import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Activity,
  Search,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Shield,
  TrendingUp,
  Target,
  Sparkles,
  Terminal,
  BarChart3,
  Clock,
  Zap,
  Cpu,
  ChevronRight,
  Bot,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import apiClient from "../api/client";
import "../assets/styles/pages/monitordetail.scss";

const MonitorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [monitor, setMonitor] = useState(null);
  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // SEO & PageSpeed state
  const [semData, setSemData] = useState(null);
  const [semLoading, setSemLoading] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    fetchDetails();
    fetchSemInsights();
    fetchLatestAudit();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/monitors/${id}`);
      if (res.success && res.data) {
        setMonitor(res.data.monitor);
        setLogsData(res.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemInsights = async (force = false) => {
    try {
      setSemLoading(true);
      const res = await apiClient.get(
        `/monitors/${id}/seo-insights${force ? "?refresh=true" : ""}`,
      );
      setSemData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSemLoading(false);
    }
  };

  const fetchLatestAudit = async () => {
    try {
      const res = await apiClient.get(`/audit/${id}`);
      if (res.success && res.data?.audit) setAuditData(res.data.audit);
    } catch (err) {
      console.error(err);
    }
  };

  const runAudit = async () => {
    try {
      setAuditLoading(true);
      const res = await apiClient.post(`/audit/${id}`);
      if (res.success && res.data?.audit) setAuditData(res.data.audit);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  if (loading || !monitor) {
    return (
      <div className="md-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <RefreshCw size={40} color="#fa3a3b" />
        </motion.div>
        <p>Synchronizing Telemetry...</p>
      </div>
    );
  }

  const isUp = (monitor.status || "").toUpperCase() === "UP";
  const isDown = (monitor.status || "").toUpperCase() === "DOWN";

  const chartData = [...logsData]
    .slice(0, 30)
    .reverse()
    .map((l) => ({
      time: format(new Date(l.createdAt), "HH:mm:ss"),
      ms: Number(l.responseTime) || 0,
    }));

  const avgMs = Math.round(
    chartData.reduce((acc, curr) => acc + curr.ms, 0) / (chartData.length || 1),
  );
  const uptimePct =
    logsData.length > 0
      ? (
          (logsData.filter((l) => l.status === "up").length / logsData.length) *
          100
        ).toFixed(1)
      : "100";

  // ScoreRing for Lighthouse
  const ScoreRing = ({ score, label }) => {
    const color = score >= 90 ? "#10B981" : score >= 50 ? "#F59E0B" : "#fa3a3b";
    return (
      <div className="md-score-ring">
        <svg width="80" height="80">
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="#1f1f1f"
            strokeWidth="6"
            fill="transparent"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            stroke={color}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={213.6}
            initial={{ strokeDashoffset: 213.6 }}
            animate={{ strokeDashoffset: 213.6 - (score / 100) * 213.6 }}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div className="ring-text">
          <span className="val" style={{ color }}>
            {score}
          </span>
          <span className="lbl">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="md-container">
      {/* HEADER */}
      <header className="md-header">
        <button className="md-icon-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} />
        </button>
        <div className="md-title-block">
          <div className="name-row">
            <div className={`status-dot ${monitor.status?.toLowerCase()}`} />
            <h1>{monitor.name}</h1>
            <span className={`status-badge ${monitor.status?.toLowerCase()}`}>
              {monitor.status?.toUpperCase()}
            </span>
          </div>
          <a href={monitor.url} target="_blank" className="url-link">
            <Globe size={14} /> {monitor.url}
          </a>
        </div>
        <button className="md-icon-btn" onClick={fetchDetails}>
          <RefreshCw size={18} />
        </button>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="md-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <Activity size={16} /> Telemetry
        </button>
        <button
          className={activeTab === "seo" ? "active" : ""}
          onClick={() => setActiveTab("seo")}
        >
          <Search size={16} /> SEO Intelligence
        </button>
        <button
          className={activeTab === "pagespeed" ? "active" : ""}
          onClick={() => setActiveTab("pagespeed")}
        >
          <TrendingUp size={16} /> Core Web Vitals
        </button>
      </nav>

      <main className="md-body">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* TOP STATS */}
              <div className="md-stats-grid">
                <div className="stat-card">
                  <span className="label">Current Status</span>
                  <h2 className={monitor.status?.toLowerCase()}>
                    {monitor.status?.toUpperCase()}
                  </h2>
                  <span className="sub">
                    Last Checked:{" "}
                    {monitor.lastCheckedAt
                      ? formatDistanceToNow(new Date(monitor.lastCheckedAt)) +
                        " ago"
                      : "—"}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="label">Avg Latency</span>
                  <h2>
                    {avgMs}
                    <span>ms</span>
                  </h2>
                  <span className="sub">Rolling 30-check average</span>
                </div>
                <div className="stat-card">
                  <span className="label">Global Uptime</span>
                  <h2>{uptimePct}%</h2>
                  <div className="uptime-strip">
                    {logsData.slice(0, 40).map((l, i) => (
                      <div key={i} className={`node ${l.status}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="md-main-layout">
                {/* CHART & LOGS */}
                <div className="md-left-pane">
                  <div className="md-chart-card">
                    <div className="card-head">
                      <h3>
                        <BarChart3 size={16} /> Latency Response (ms)
                      </h3>
                      <div className="live-indicator">
                        <div className="pulse" /> LIVE STREAM
                      </div>
                    </div>
                    <div className="chart-wrapper">
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient
                              id="colorMs"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#fa3a3b"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#fa3a3b"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1f1f1f"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#444", fontSize: 10 }}
                            minTickGap={30}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#444", fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#0f0f0f",
                              border: "1px solid #1f1f1f",
                              borderRadius: "8px",
                            }}
                            itemStyle={{ color: "#fa3a3b" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="ms"
                            stroke="#fa3a3b"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMs)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="md-logs-card">
                    <h3>
                      <Terminal size={16} /> Raw Incident Logs
                    </h3>
                    <div className="logs-list">
                      {logsData.slice(0, 10).map((log, i) => (
                        <div key={i} className="log-row">
                          <span className="time">
                            {format(new Date(log.createdAt), "HH:mm:ss")}
                          </span>
                          <span className={`status ${log.status}`}>
                            {log.status?.toUpperCase()}
                          </span>
                          <span className="latency">{log.responseTime}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SETTINGS & AI */}
                <aside className="md-right-pane">
                  <div className="md-action-card">
                    <h3>
                      <Shield size={16} /> Smart Silence
                    </h3>
                    <p>Prevent false alerts during maintenance windows.</p>
                    <div className="btn-group">
                      <button
                        onClick={() => {
                          /* setMaintenance logic */
                        }}
                      >
                        30 Mins
                      </button>
                      <button
                        onClick={() => {
                          /* setMaintenance logic */
                        }}
                      >
                        1 Hour
                      </button>
                    </div>
                  </div>

                  <div className="md-info-card">
                    <h3>Monitor Configuration</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span>Check Interval</span>{" "}
                        <b>{monitor.interval} Min</b>
                      </div>
                      <div className="info-item">
                        <span>Protocol</span>{" "}
                        <b>{monitor.type?.toUpperCase()}</b>
                      </div>
                      <div className="info-item">
                        <span>Public Link</span>{" "}
                        <b>{monitor.isPublic ? "Enabled" : "Private"}</b>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </motion.div>
          )}

          {activeTab === "seo" && (
            <motion.div
              key="seo"
              className="md-seo-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="md-seo-header">
                <h2>
                  <Sparkles size={20} color="#fa3a3b" /> Narada SEO Intelligence
                </h2>
                <button
                  className="primary-btn"
                  onClick={() => fetchSemInsights(true)}
                  disabled={semLoading}
                >
                  {semLoading ? (
                    <RefreshCw className="spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}{" "}
                  Sync Domain Data
                </button>
              </div>
              {semData ? (
                <div className="seo-content">
                  <div className="metrics-row">
                    <div className="m-box">
                      <Shield size={20} /> <span>Authority</span>{" "}
                      <strong>{semData.authorityScore}</strong>
                    </div>
                    <div className="m-box">
                      <Zap size={20} /> <span>Traffic</span>{" "}
                      <strong>
                        {semData.organicData?.traffic?.toLocaleString()}
                      </strong>
                    </div>
                    <div className="m-box">
                      <Target size={20} /> <span>Keywords</span>{" "}
                      <strong>
                        {semData.organicData?.keywords?.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                  <div className="ai-insight-box">
                    <div className="ai-head">
                      <Cpu size={18} /> AI STRATEGIC ANALYSIS
                    </div>
                    <div className="ai-body">
                      <ReactMarkdown>{semData.aiAnalysis}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  No domain intelligence gathered yet.
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "pagespeed" && (
            <motion.div
              key="audit"
              className="md-audit-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="md-audit-header">
                <h2>
                  <TrendingUp size={20} color="#fa3a3b" /> Core Web Vitals
                </h2>
                <button
                  className="primary-btn"
                  onClick={runAudit}
                  disabled={auditLoading}
                >
                  {auditLoading ? "Analyzing Node..." : "Run Deep Audit"}
                </button>
              </div>
              {auditData ? (
                <div className="audit-content">
                  <div className="rings-grid">
                    <ScoreRing
                      score={auditData.perfScore}
                      label="Performance"
                    />
                    <ScoreRing
                      score={auditData.accessScore}
                      label="Accessibility"
                    />
                    <ScoreRing
                      score={auditData.bestPracticesScore}
                      label="Security"
                    />
                    <ScoreRing score={auditData.seoScore} label="SEO" />
                  </div>
                  <div className="ai-insight-box gold">
                    <div className="ai-head">
                      <Bot size={18} /> OPTIMIZATION GUIDE
                    </div>
                    <div className="ai-body">
                      <ReactMarkdown>{auditData.aiAnalysis}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  Lighthouse report pending. Initialize audit to see scores.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MonitorDetail;
