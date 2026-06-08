import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import apiClient, { API_URL } from "../api/client";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  ExternalLink,
  Trash2,
  Play,
  Pause,
  Activity,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  X,
  Server,
  Type,
  BarChart3,
  CreditCard,
  ArrowUpRight,
  Download,
  Bot,
  ChevronDown,
} from "lucide-react";
import Chatbot from "../components/Chatbot";
import "../assets/styles/pages/dashboard.scss";

const Dashboard = () => {
  const navigate = useNavigate();

  // --- ALL ORIGINAL STATES RESTORED ---
  const [monitors, setMonitors] = useState([]);
  const [stats, setStats] = useState({ total: 0, up: 0, down: 0, unknown: 0 });
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newMonitor, setNewMonitor] = useState({
    name: "",
    url: "",
    type: "https",
    port: "",
    keyword: "",
    isPublic: false,
    interval: 5,
    isMaintenance: false,
    maintenanceDuration: 0,
  });

  const [modalLoad, setModalLoad] = useState(false);
  const [modalError, setModalError] = useState("");

  // --- FETCH LOGIC (POLLING 60S) ---
  const fetchMonitors = async () => {
    try {
      const [monRes, planRes] = await Promise.all([
        apiClient.get("/monitors"),
        apiClient.get("/payment/status").catch(() => null),
      ]);
      const monData = monRes.data || monRes.monitors || [];
      setMonitors(monData);
      setStats({
        total: monData.length,
        up: monData.filter((m) => m.status === "up").length,
        down: monData.filter((m) => m.status === "down").length,
        unknown: monData.filter((m) => !m.status || m.status === "pending")
          .length,
      });
      if (planRes?.success)
        setPlan(planRes.data?.plan?.type || planRes.data?.plan || "free");
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLER: ADD MONITOR (FULL PAYLOAD) ---
  const handleAddMonitor = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalLoad(true);
    try {
      const payload = {
        name: newMonitor.name,
        url: newMonitor.url,
        type: newMonitor.type,
        isPublic: newMonitor.isPublic,
        interval: parseInt(newMonitor.interval) || 5,
        isMaintenance: newMonitor.isMaintenance,
      };

      if (newMonitor.isMaintenance && newMonitor.maintenanceDuration > 0) {
        payload.maintenanceUntil = new Date(
          Date.now() + newMonitor.maintenanceDuration * 60 * 1000,
        );
      }
      if (newMonitor.type === "keyword" && newMonitor.keyword)
        payload.keyword = newMonitor.keyword;

      const res = await apiClient.post("/monitors", payload);
      setIsModalOpen(false);

      // Reset Form
      setNewMonitor({
        name: "",
        url: "",
        type: "https",
        port: "",
        keyword: "",
        isPublic: false,
        interval: 5,
        isMaintenance: false,
        maintenanceDuration: 0,
      });

      const id = res.data?.monitor?._id || res.monitor?._id;
      if (id) navigate(`/monitor/${id}`);
      else fetchMonitors();
    } catch (err) {
      setModalError(err.message || "Failed to add monitor");
    } finally {
      setModalLoad(false);
    }
  };

  // --- HANDLER: TOGGLE & DELETE ---
  const toggleMonitor = async (id) => {
    try {
      await apiClient.patch(`/monitors/${id}/toggle`);
      fetchMonitors();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMonitor = async (id) => {
    if (!window.confirm("Permanently delete this monitor and all history?"))
      return;
    try {
      await apiClient.delete(`/monitors/${id}`);
      fetchMonitors();
    } catch (err) {
      console.error(err);
    }
  };

  // --- HANDLER: PDF DOWNLOAD ---
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("wm_token");
      const response = await axios({
        url: `${API_URL}/api/monitors/reports/download`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Web-Monitor-Report-${new Date().toISOString().split("T")[0]}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download report.");
    }
  };

  const typeIcon = (type) => {
    if (type === "PORT") return <Server size={14} />;
    if (type === "KEYWORD") return <Type size={14} />;
    return <Globe size={14} />;
  };

  const statCards = [
    {
      label: "Total Assets",
      value: stats.total,
      icon: BarChart3,
      color: "#fafafa",
      trend: "Active Endpoints",
    },
    {
      label: "Uptime Nodes",
      value: stats.up,
      icon: CheckCircle,
      color: "#10B981",
      trend: `${Math.round((stats.up / (stats.total || 1)) * 100)}% Global`,
    },
    {
      label: "Critical Incidents",
      value: stats.down,
      icon: AlertCircle,
      color: "#fa3a3b",
      trend: stats.down > 0 ? "Action Required" : "System Healthy",
    },
    {
      label: "Uplink Plan",
      value: plan.toUpperCase(),
      icon: CreditCard,
      color: "#fa3a3b",
      isText: true,
      trend: "Enterprise Grade",
    },
  ];

  return (
    <div className="narada-dashboard">
      <header className="db-top">
        <div className="title-area">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Command Center
          </motion.h1>
          <p>Real-time telemetry from your global infrastructure.</p>
        </div>
        <div className="action-area">
          <button className="secondary-btn" onClick={handleDownload}>
            <Download size={18} /> Export PDF
          </button>
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> New Uplink
          </button>
        </div>
      </header>

      {/* STATS SECTION */}
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-header">
              <div className="icon-box" style={{ color: stat.color }}>
                <stat.icon size={20} />
              </div>
              {stat.label === "Uplink Plan" && (
                <Link to="/billing" className="upgrade-link">
                  Upgrade
                </Link>
              )}
            </div>
            <div className="stat-main">
              <h2 className={stat.isText ? "text-val" : ""}>{stat.value}</h2>
              <span className="label">{stat.label}</span>
            </div>
            <div className="stat-footer">{stat.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* MAIN MONITOR LIST */}
      <section className="monitor-section">
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : monitors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Bot size={40} />
            </div>
            <h3>No Active Uplinks</h3>
            <p>
              Initialize your first monitor to start real-time surveillance.
            </p>
            <button
              className="primary-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Establish First Connection
            </button>
          </div>
        ) : (
          <div className="monitor-grid">
            {monitors.map((m, i) => {
              const status = (m.status || "pending").toLowerCase();
              return (
                <motion.div
                  key={m._id}
                  className={`monitor-card ${status}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="card-top">
                    <div className="name-group">
                      <div className={`status-dot ${status}`} />
                      <span className="monitor-name">{m.name}</span>
                    </div>
                    <span className={`status-badge ${status}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>

                  <a href={m.url} target="_blank" className="monitor-url">
                    {m.url}
                  </a>

                  <div className="monitor-metrics">
                    <div className="metric">
                      <Zap size={14} />{" "}
                      <span>
                        {m.lastResponseTime ? `${m.lastResponseTime}ms` : "—"}
                      </span>
                    </div>
                    <div className="metric">
                      <Clock size={14} />{" "}
                      <span>
                        {m.lastCheckedAt
                          ? formatDistanceToNow(new Date(m.lastCheckedAt)) +
                            " ago"
                          : "Pending"}
                      </span>
                    </div>
                    <div className="metric type-tag">
                      {typeIcon(m.type)} <span>{m.type}</span>
                    </div>
                  </div>

                  {m.lastAiAnalysis && status === "down" && (
                    <div className="ai-report-box">
                      <Bot size={14} />
                      <p>{m.lastAiAnalysis}</p>
                    </div>
                  )}

                  <div className="card-footer">
                    <button
                      className="analyze-btn"
                      onClick={() => navigate(`/monitor/${m._id}`)}
                    >
                      Analyze <ArrowUpRight size={14} />
                    </button>
                    <div className="action-btns">
                      <button
                        className="tool-btn"
                        onClick={() => toggleMonitor(m._id)}
                      >
                        {m.isActive ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        className="tool-btn delete"
                        onClick={() => deleteMonitor(m._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* FULL ADD MONITOR MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="modal-header">
                <h2>Initialize Uplink</h2>
                <button
                  className="close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {modalError && (
                <div className="modal-error">
                  <AlertCircle size={16} /> {modalError}
                </div>
              )}

              <form onSubmit={handleAddMonitor} className="modal-form">
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    required
                    placeholder="Production API, Portfolio..."
                    value={newMonitor.name}
                    onChange={(e) =>
                      setNewMonitor({ ...newMonitor, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Protocol Type</label>
                  <div className="select-wrapper">
                    <select
                      value={newMonitor.type}
                      onChange={(e) =>
                        setNewMonitor({ ...newMonitor, type: e.target.value })
                      }
                    >
                      <option value="https">🌐 HTTP(s) Website</option>
                      <option value="keyword">📝 Keyword Search</option>
                      <option value="ping">🔍 Ping Reachability</option>
                    </select>
                    <ChevronDown size={16} className="select-icon" />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    {newMonitor.type === "ping"
                      ? "Target IP / Domain"
                      : "Endpoint URL"}
                  </label>
                  <input
                    required
                    type={newMonitor.type === "ping" ? "text" : "url"}
                    placeholder="https://example.com"
                    value={newMonitor.url}
                    onChange={(e) =>
                      setNewMonitor({ ...newMonitor, url: e.target.value })
                    }
                  />
                </div>

                {newMonitor.type === "keyword" && (
                  <div className="form-group">
                    <label>Search Keyword</label>
                    <input
                      required
                      placeholder="e.g. 'Out of Stock' or 'Success'"
                      value={newMonitor.keyword}
                      onChange={(e) =>
                        setNewMonitor({
                          ...newMonitor,
                          keyword: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Interval (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={newMonitor.interval}
                      onChange={(e) =>
                        setNewMonitor({
                          ...newMonitor,
                          interval: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>Public Page</label>
                    <input
                      type="checkbox"
                      checked={newMonitor.isPublic}
                      onChange={(e) =>
                        setNewMonitor({
                          ...newMonitor,
                          isPublic: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="maintenance-section">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="maint"
                      checked={newMonitor.isMaintenance}
                      onChange={(e) =>
                        setNewMonitor({
                          ...newMonitor,
                          isMaintenance: e.target.checked,
                        })
                      }
                    />
                    <label htmlFor="maint">Start in Maintenance Mode</label>
                  </div>
                  {newMonitor.isMaintenance && (
                    <select
                      className="mt-2"
                      value={newMonitor.maintenanceDuration}
                      onChange={(e) =>
                        setNewMonitor({
                          ...newMonitor,
                          maintenanceDuration: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value="0">Indefinite</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="120">2 Hours</option>
                    </select>
                  )}
                </div>

                <button
                  type="submit"
                  className="primary-btn submit-btn"
                  disabled={modalLoad}
                >
                  {modalLoad ? "Establishing Uplink..." : "Authorize Monitor"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
};

export default Dashboard;
