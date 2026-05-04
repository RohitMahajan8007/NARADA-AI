import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../api/client";
import {
  User as UserIcon,
  Mail,
  Shield,
  Bell,
  Send,
  CheckCircle,
  AlertCircle,
  LogOut,
  Terminal,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "../assets/styles/pages/profile.scss";

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State
  const [telegramId, setTelegramId] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyTelegram, setNotifyTelegram] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/auth/me");
      if (res?.user) {
        const u = res.user;
        setProfile(u);
        setTelegramId(u.telegramId || "");
        setNotifyEmail(u.notificationPreferences?.email ?? true);
        setNotifyTelegram(u.notificationPreferences?.telegram ?? false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to synchronize user data." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await apiClient.put("/auth/update-profile", {
        telegramId,
        notificationPreferences: {
          email: notifyEmail,
          telegram: notifyTelegram,
        },
      });
      if (res?.success) {
        setMessage({
          type: "success",
          text: "Profile configurations updated.",
        });
        setProfile(res.user);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Update operation failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="md-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Cpu size={40} color="#fa3a3b" />
        </motion.div>
        <p>Accessing Profile Data...</p>
      </div>
    );
  }

  return (
    <div className="narada-profile-container">
      {/* HEADER */}
      <header className="profile-header">
        <div className="title-area">
          <h1>Identity & Access</h1>
          <p>Manage your telemetry credentials and notification channels.</p>
        </div>
      </header>

      {/* ALERT MESSAGE */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`status-alert ${message.type}`}
          >
            {message.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="profile-grid">
        {/* LEFT COL: USER IDENTITY */}
        <aside className="identity-pane">
          <div className="id-card">
            <div className="avatar-shield">
              <div className="avatar-inner">
                {profile?.fullname?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="glow-ring"></div>
            </div>

            <h2 className="user-name">{profile?.fullname}</h2>
            <p className="user-email">{profile?.email}</p>

            <div className="badge-row">
              <span className="node-badge role">{profile?.role}</span>
              <span className="node-badge plan">
                {profile?.plan?.toUpperCase()} PLAN
              </span>
            </div>

            <div className="metadata">
              <div className="meta-item">
                <Shield
                  size={14}
                  className={
                    profile?.isVerified ? "text-success" : "text-danger"
                  }
                />
                <span>
                  Status:{" "}
                  <strong>
                    {profile?.isVerified ? "Verified" : "Unverified"}
                  </strong>
                </span>
              </div>
              <div className="meta-item">
                <Terminal size={14} />
                <span>
                  Joined: {new Date(profile?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button onClick={logout} className="terminate-btn">
              <LogOut size={16} /> <span>Terminate Session</span>
            </button>
          </div>
        </aside>

        {/* RIGHT COL: CONFIGURATIONS */}
        <main className="settings-pane">
          <section className="settings-card">
            <h3 className="section-title">
              <Bell size={20} color="#fa3a3b" />
              Alert Protocols
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-content">
                {/* TELEGRAM CONFIG */}
                <div className="field-group">
                  <label>
                    <Send size={14} /> Telegram Uplink (Chat ID)
                  </label>
                  <div className="input-with-hint">
                    <input
                      type="text"
                      placeholder="e.g. 123456789"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                    />
                    <p className="hint">
                      Connect with <strong>@NaradaAIBot</strong> and send{" "}
                      <code>/start</code> to receive your Chat ID.
                    </p>
                  </div>
                </div>

                <div className="divider"></div>

                {/* NOTIFICATION PREFERENCES */}
                <div className="field-group">
                  <label className="sub-label">
                    Active Surveillance Channels
                  </label>

                  <div className="toggle-list">
                    <label
                      className={`toggle-card ${notifyEmail ? "active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.checked)}
                      />
                      <div className="toggle-content">
                        <Mail size={18} />
                        <div>
                          <span className="t-title">Email Dispatch</span>
                          <span className="t-desc">
                            Primary: {profile?.email}
                          </span>
                        </div>
                      </div>
                      <div className="custom-checkbox"></div>
                    </label>

                    <label
                      className={`toggle-card ${notifyTelegram ? "active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={notifyTelegram}
                        onChange={(e) => setNotifyTelegram(e.target.checked)}
                      />
                      <div className="toggle-content">
                        <Send size={18} />
                        <div>
                          <span className="t-title">Telegram Push</span>
                          <span className="t-desc">
                            Instant mobile telemetry
                          </span>
                        </div>
                      </div>
                      <div className="custom-checkbox"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={saving} className="primary-btn">
                  {saving ? (
                    <>
                      <span className="spinner" /> Synchronizing...
                    </>
                  ) : (
                    "Update Configurations"
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* TELEGRAM COMMAND GUIDE */}
          <section className="terminal-guide">
            <h3 className="guide-title">
              <Terminal size={18} color="#fa3a3b" />
              Bot Command Reference
            </h3>
            <div className="command-grid">
              <div className="cmd-item">
                <code>/status</code>
                <p>Live node health</p>
              </div>
              <div className="cmd-item">
                <code>/stats</code>
                <p>Global uptime %</p>
              </div>
              <div className="cmd-item">
                <code>/audit_ID</code>
                <p>Execute SEO audit</p>
              </div>
              <div className="cmd-item">
                <code>/help</code>
                <p>System manifest</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Profile;
