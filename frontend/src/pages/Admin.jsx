import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  CreditCard,
  Ticket,
  Mail,
  Settings,
  LayoutDashboard,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  IndianRupee,
  BarChart3,
  Shield,
  RefreshCw,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Terminal,
  Cpu,
  ChevronDown,
  Sparkles,
  Send,
  Eye,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import apiClient from "../api/client";
import "../assets/styles/pages/admin.scss";

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [data, setData] = useState(null);
  const [summary, setSummary] = useState({
    userCount: 0,
    monitorCount: 0,
    paymentCount: 0,
    pendingPayments: 0,
  });
  const [overviewPending, setOverviewPending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: "",
    payment: null,
    note: "",
  });
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: "",
    maxUses: 0,
    validUntil: "",
  });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    planType: "FREE",
  });
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Email Templates
  const [emailTemplatesData, setEmailTemplatesData] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateFormData, setTemplateFormData] = useState({
    subject: "",
    html: "",
  });
  const [templatePreview, setTemplatePreview] = useState(null);
  const [testEmail, setTestEmail] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/admin/stats");
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case "overview":
          res = await apiClient.get("/admin/payments/pending");
          setOverviewPending(res.data || []);
          break;
        case "pending":
          res = await apiClient.get("/admin/payments/pending");
          break;
        case "payments":
          res = await apiClient.get("/admin/payments");
          break;
        case "users":
          res = await apiClient.get("/admin/users");
          break;
        case "coupons":
          res = await apiClient.get("/admin/coupons");
          break;
        case "email-templates":
          res = await apiClient.get("/admin/email-templates");
          const templates = res.data || [];
          const grouped = {};
          templates.forEach((t) => {
            const cat = t.category || "other";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(t);
          });
          setEmailTemplatesData({
            total: templates.length,
            grouped,
            flat: templates,
          });
          break;
        case "settings":
          res = await apiClient.get("/admin/settings");
          setData(res.data?.[0] || {});
          break;
        default:
          break;
      }
      if (
        activeTab !== "email-templates" &&
        activeTab !== "settings" &&
        activeTab !== "overview"
      ) {
        setData(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [activeTab]);

  /* ── HANDLERS ── */
  const handleSaveSettings = async (updates) => {
    try {
      await apiClient.put("/admin/settings", updates);
      fetchData();
    } catch (err) {
      alert("Failed to update config.");
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(
        `/admin/payments/${actionModal.payment._id}/${actionModal.type}`,
        { adminNote: actionModal.note },
      );
      setActionModal({ isOpen: false, type: "", payment: null, note: "" });
      fetchStats();
      fetchData();
    } catch (err) {
      alert("Action failed");
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await apiClient.put(`/admin/users/${editingUser._id}`, userFormData);
        setIsUserModalOpen(false);
      } else {
        const res = await apiClient.post("/admin/users", userFormData);
        setGeneratedPassword(res.data.generatedPassword);
      }
      fetchStats();
      fetchData();
    } catch (err) {
      alert("User save failed");
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateFormData({
      subject: template.subject,
      html: template.html || template.body || "",
    });
    setTemplatePreview(null);
  };

  const filteredData = Array.isArray(data)
    ? data.filter((item) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = (
          item.fullname ||
          item.name ||
          item.code ||
          item.email ||
          item.utrNumber ||
          ""
        )
          .toLowerCase()
          .includes(q);
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="narada-admin">
      {/* HEADER */}
      <header className="adm-header">
        <div className="title-area">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            System Terminal /{" "}
            <span className="tab-name">{activeTab.replace("-", " ")}</span>
          </motion.h1>
          <p>Global platform governance and infrastructure control.</p>
        </div>
        <div className="action-area">
          <button
            className="icon-btn"
            onClick={() => {
              fetchStats();
              fetchData();
            }}
          >
            <RefreshCw size={18} />
          </button>
          {activeTab === "users" && (
            <button
              className="primary-btn"
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
            >
              <Plus size={18} /> New User
            </button>
          )}
          {activeTab === "coupons" && (
            <button
              className="primary-btn"
              onClick={() => {
                setEditingCoupon(null);
                setIsCouponModalOpen(true);
              }}
            >
              <Plus size={18} /> Create Voucher
            </button>
          )}
        </div>
      </header>

      {/* OVERVIEW CARDS */}
      {activeTab === "overview" && (
        <div className="overview-pane">
          <div className="stats-grid">
            <motion.div
              className="stat-card urgent"
              onClick={() => navigate("/admin?tab=pending")}
            >
              <div className="icon-box">
                <Clock size={24} />
              </div>
              <div className="val">{summary.pendingPayments}</div>
              <div className="lbl">Pending Reviews</div>
              <ChevronDown
                className="arrow"
                size={16}
                style={{ transform: "rotate(-90deg)" }}
              />
            </motion.div>
            <motion.div
              className="stat-card"
              onClick={() => navigate("/admin?tab=users")}
            >
              <div className="icon-box">
                <Users size={24} />
              </div>
              <div className="val">{summary.userCount}</div>
              <div className="lbl">Total Commanders</div>
            </motion.div>
            <motion.div
              className="stat-card"
              onClick={() => navigate("/admin?tab=payments")}
            >
              <div className="icon-box">
                <CheckCircle size={24} />
              </div>
              <div className="val">{summary.paymentCount}</div>
              <div className="lbl">Successful Uplinks</div>
            </motion.div>
          </div>

          {overviewPending.length > 0 && (
            <div className="adm-table-container mt-8">
              <div className="table-header">
                <h3>
                  <AlertCircle size={18} color="#fa3a3b" /> Priority Approvals
                </h3>
                <Link to="/admin?tab=pending" className="link">
                  View Console <ArrowRight size={14} />
                </Link>
              </div>
              <table className="narada-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>UTR</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewPending.slice(0, 5).map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="u-info">
                          <b>{p.user?.fullname || "N/A"}</b>
                          <span>{p.user?.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${p.plan}`}>{p.plan}</span>
                      </td>
                      <td>₹{p.finalAmount || p.amount}</td>
                      <td className="font-mono">{p.utrNumber}</td>
                      <td>
                        <button
                          className="approve-link"
                          onClick={() => navigate("/admin?tab=pending")}
                        >
                          RESOLVE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DATA VIEWS (Payments, Users, Coupons) */}
      {activeTab !== "overview" &&
        activeTab !== "email-templates" &&
        activeTab !== "settings" && (
          <div className="data-pane">
            <div className="filter-row">
              <div className="search-bar">
                <Search size={18} />
                <input
                  placeholder={`Filter ${activeTab} records...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {(activeTab === "payments" || activeTab === "pending") && (
                <select
                  className="status-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              )}
            </div>

            <div className="adm-table-container">
              <table className="narada-table">
                <thead>
                  {activeTab === "pending" && (
                    <tr>
                      <th>User</th>
                      <th>Node</th>
                      <th>Amount</th>
                      <th>UTR</th>
                      <th>Date</th>
                      <th>Execute</th>
                    </tr>
                  )}
                  {activeTab === "users" && (
                    <tr>
                      <th>Identity</th>
                      <th>Email</th>
                      <th>Node Plan</th>
                      <th>Joined</th>
                      <th>Tools</th>
                    </tr>
                  )}
                  {activeTab === "coupons" && (
                    <tr>
                      <th>Voucher</th>
                      <th>Value</th>
                      <th>Usage</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Tools</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item._id}>
                      {activeTab === "pending" && (
                        <>
                          <td>
                            <div className="u-info">
                              <b>{item.user?.fullname}</b>
                              <span>{item.user?.email}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${item.plan}`}>
                              {item.plan}
                            </span>
                          </td>
                          <td className="price">
                            ₹{item.finalAmount || item.amount}
                          </td>
                          <td className="font-mono text-xs">
                            {item.utrNumber}
                          </td>
                          <td>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn-approve"
                                onClick={() =>
                                  setActionModal({
                                    isOpen: true,
                                    type: "approve",
                                    payment: item,
                                    note: "",
                                  })
                                }
                              >
                                APPROVE
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() =>
                                  setActionModal({
                                    isOpen: true,
                                    type: "reject",
                                    payment: item,
                                    note: "",
                                  })
                                }
                              >
                                REJECT
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                      {activeTab === "users" && (
                        <>
                          <td className="font-bold">
                            {item.fullname || item.name}
                          </td>
                          <td className="text-secondary">{item.email}</td>
                          <td>
                            <span
                              className={`badge ${item.plan?.type || item.plan}`}
                            >
                              {item.plan?.type || item.plan}
                            </span>
                          </td>
                          <td>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="flex gap-3 text-secondary">
                              <Edit2
                                size={14}
                                className="hover-white"
                                onClick={() => {
                                  setEditingUser(item);
                                  setIsUserModalOpen(true);
                                }}
                              />
                              <Trash2
                                size={14}
                                className="hover-red"
                                onClick={() => {
                                  /* delete */
                                }}
                              />
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* SETTINGS VIEW */}
      {activeTab === "settings" && (
        <div className="settings-pane">
          <div className="settings-grid">
            <section className="settings-card">
              <h3>
                <Cpu size={18} color="#fa3a3b" /> Core Intelligence
              </h3>
              <div className="input-group">
                <label>Gemini API Key</label>
                <input
                  type="password"
                  defaultValue={data?.geminiApiKey}
                  id="s-gemini"
                />
              </div>
              <div className="input-group">
                <label>PageSpeed API Key</label>
                <input
                  type="password"
                  defaultValue={data?.pagespeedApiKey}
                  id="s-pagespeed"
                />
              </div>
              <button
                className="primary-btn"
                onClick={() =>
                  handleSaveSettings({
                    geminiApiKey: document.getElementById("s-gemini").value,
                    pagespeedApiKey: document.getElementById("s-pagespeed").value,
                  })
                }
              >
                Update Keys
              </button>
            </section>

            <section className="settings-card">
              <h3>
                <IndianRupee size={18} color="#fa3a3b" /> Financial Uplink
              </h3>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="s-upienabled"
                  defaultChecked={data?.upiEnabled !== false}
                />
                <label htmlFor="s-upienabled">Enable Global UPI Payments</label>
              </div>
              <div className="input-group">
                <label>Merchant VPA</label>
                <input defaultValue={data?.upiId} id="s-upi" placeholder="e.g. user@vpa" />
              </div>
              <div className="input-group">
                <label>Payee Name</label>
                <input defaultValue={data?.upiPayeeName} id="s-payee" placeholder="Account Name" />
              </div>
              <button
                className="primary-btn"
                onClick={() =>
                  handleSaveSettings({
                    upiEnabled: document.getElementById("s-upienabled").checked,
                    upiId: document.getElementById("s-upi").value,
                    upiPayeeName: document.getElementById("s-payee").value,
                  })
                }
              >
                Save Config
              </button>
            </section>

            <section className="settings-card">
              <h3>
                <Mail size={18} color="#fa3a3b" /> SMTP Protocol
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label>Host</label>
                  <input defaultValue={data?.smtpHost} id="s-smtp-host" placeholder="smtp.gmail.com" />
                </div>
                <div className="input-group">
                  <label>Port</label>
                  <input type="number" defaultValue={data?.smtpPort} id="s-smtp-port" />
                </div>
              </div>
              <div className="input-group">
                <label>Username</label>
                <input defaultValue={data?.smtpUser} id="s-smtp-user" />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" defaultValue={data?.smtpPass} id="s-smtp-pass" placeholder="••••••••" />
              </div>
              <button
                className="primary-btn"
                onClick={() =>
                  handleSaveSettings({
                    smtpHost: document.getElementById("s-smtp-host").value,
                    smtpPort: document.getElementById("s-smtp-port").value,
                    smtpUser: document.getElementById("s-smtp-user").value,
                    smtpPass: document.getElementById("s-smtp-pass").value,
                  })
                }
              >
                Update SMTP
              </button>
            </section>

            <section className="settings-card">
              <h3>
                <Shield size={18} color="#fa3a3b" /> Notification Bot
              </h3>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="s-tg-enabled"
                  defaultChecked={data?.telegramEnabled}
                />
                <label htmlFor="s-tg-enabled">Enable Telegram Alerts</label>
              </div>
              <div className="input-group">
                <label>Bot Token</label>
                <input type="password" defaultValue={data?.telegramBotToken} id="s-tg-token" />
              </div>
              <div className="input-group">
                <label>Bot Username</label>
                <input defaultValue={data?.telegramBotUsername} id="s-tg-user" placeholder="@YourBot" />
              </div>
              <button
                className="primary-btn"
                onClick={() =>
                  handleSaveSettings({
                    telegramEnabled: document.getElementById("s-tg-enabled").checked,
                    telegramBotToken: document.getElementById("s-tg-token").value,
                    telegramBotUsername: document.getElementById("s-tg-user").value,
                  })
                }
              >
                Save Bot
              </button>
            </section>
          </div>
        </div>
      )}

      {/* TEMPLATE EDITOR MODAL */}
      <AnimatePresence>
        {editingTemplate && (
          <motion.div
            className="editor-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="editor-card"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="editor-head">
                <h2>
                  Template Protocol: <span>{editingTemplate.key}</span>
                </h2>
                <button
                  className="close-btn"
                  onClick={() => setEditingTemplate(null)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="editor-body">
                <div className="code-area">
                  <div className="input-group">
                    <label>Email Subject</label>
                    <input
                      value={templateFormData.subject}
                      onChange={(e) =>
                        setTemplateFormData({
                          ...templateFormData,
                          subject: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>HTML Content</label>
                    <textarea
                      className="font-mono"
                      value={templateFormData.html}
                      onChange={(e) =>
                        setTemplateFormData({
                          ...templateFormData,
                          html: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="preview-area">
                  <div className="variables-box">
                    <span className="lbl">Available Hooks:</span>
                    <div className="hook-list">
                      {editingTemplate.variables?.map((v) => (
                        <code key={v}>{`{{${v}}}`}</code>
                      ))}
                    </div>
                  </div>
                  <div className="live-preview-box">
                    <div className="p-head">Telemetry Preview</div>
                    {templatePreview ? (
                      <div
                        className="p-frame"
                        dangerouslySetInnerHTML={{
                          __html: templatePreview.data.html,
                        }}
                      />
                    ) : (
                      <div className="p-empty">Initialize Preview...</div>
                    )}
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        /* preview logic */
                      }}
                    >
                      Compile Preview
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTION MODAL (APPROVE/REJECT) */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <div className="modal-overlay">
            <motion.div
              className="modal-card mini"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h2 className="capitalize">
                {actionModal.type} Telemetry Uplink
              </h2>
              <p>
                Authorize transaction for {actionModal.payment.user?.fullname}?
              </p>
              <textarea
                placeholder="Administrator Note..."
                value={actionModal.note}
                onChange={(e) =>
                  setActionModal({ ...actionModal, note: e.target.value })
                }
              />
              <div className="flex gap-3">
                <button
                  className="secondary-btn"
                  onClick={() => setActionModal({ isOpen: false })}
                >
                  Abort
                </button>
                <button className="primary-btn" onClick={handleAction}>
                  Confirm Deployment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
