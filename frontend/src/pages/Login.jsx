import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Activity,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import "../assets/styles/pages/login.scss";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Core UI States
  const [loginMethod, setLoginMethod] = useState("password");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form States
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginOtp, setLoginOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoad, setOtpLoad] = useState(false);

  // Modal States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetData, setResetData] = useState({ otp: "", newPassword: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // --- EFFECT: Check for Google OAuth Token in URL ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      const handleGoogleLogin = async () => {
        setLoading(true);
        try {
          const { default: api } = await import("../api/client");
          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.success) {
            localStorage.setItem("wm_token", token);
            localStorage.setItem("wm_user", JSON.stringify(res.user));
            window.location.href = "/dashboard";
          }
        } catch (err) {
          setError("Google authentication failed.");
        } finally {
          setLoading(false);
        }
      };
      handleGoogleLogin();
    }
  }, [location, navigate]);

  const handleGoogleRedirect = () => {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  // --- HANDLER: Password Login ---
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res) navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or access key.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: Request Login OTP ---
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setOtpLoad(true);
    try {
      const { default: api } = await import("../api/client");
      await api.post("/auth/login-otp/request", { email: form.email });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send uplink code.");
    } finally {
      setOtpLoad(false);
    }
  };

  // --- HANDLER: Verify Login OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setOtpLoad(true);
    try {
      const { default: api } = await import("../api/client");
      const res = await api.post("/auth/login-otp/verify", {
        email: form.email,
        otp: loginOtp,
      });

      // Manual Auth Set (Mirroring your original logic)
      localStorage.setItem("wm_token", res.token);
      localStorage.setItem("wm_user", JSON.stringify(res.user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setOtpLoad(false);
    }
  };

  // --- HANDLER: Forgot Password flow ---
  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);
    try {
      const { default: api } = await import("../api/client");
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotStep(2);
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to initiate reset.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);
    try {
      const { default: api } = await import("../api/client");
      await api.post("/auth/reset-password", {
        email: forgotEmail,
        otp: resetData.otp,
        newPassword: resetData.newPassword,
      });
      setModalSuccess("Access Key Updated.");
      setTimeout(() => {
        setShowForgot(false);
        setModalSuccess("");
      }, 2000);
    } catch (err) {
      setModalError(err.message || "Reset failed.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="narada-signup-root">
      <section className="side-form">
        <motion.div
          className="content-limit"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/" className="brand-header">
            <Activity className="brand-logo" size={28} />
            <span>
              Web <span className="red-text">Monitor</span>
            </span>
          </Link>

          <div className="text-group">
            <h1>Login</h1>
            <p>Secure uplink to your monitoring headquarters.</p>
          </div>

          {/* Alerts */}
          {location.state?.message && (
            <div
              className="alert-error"
              style={{
                borderColor: "#10B981",
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.1)",
              }}
            >
              <CheckCircle size={16} /> {location.state.message}
            </div>
          )}
          {error && (
            <div className="alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="login-tabs">
            <button
              className={loginMethod === "password" ? "active" : ""}
              onClick={() => {
                setLoginMethod("password");
                setOtpSent(false);
              }}
            >
              Password
            </button>
            <button
              className={loginMethod === "otp" ? "active" : ""}
              onClick={() => setLoginMethod("otp")}
            >
              Email OTP
            </button>
          </div>

          {loginMethod === "password" ? (
            <form onSubmit={handlePasswordLogin}>
              <div className="input-field">
                <label>Email Address</label>
                <div className="input-control">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="commander@site.com"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="input-field">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label>Password</label>
                  <button
                    type="button"
                    className="text-link-sm"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-control">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowPwd(!showPwd)}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submit-action-btn"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    Authenticate <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* --- RE-ADDED OTP LOGIN FLOW --- */
            <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}>
              <div className="input-field">
                <label>Email Address</label>
                <div className="input-control">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="commander@site.com"
                    disabled={otpSent}
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {otpSent && (
                <motion.div
                  className="input-field"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <label>6-Digit Code</label>
                    <button
                      type="button"
                      className="text-link-sm"
                      onClick={() => setOtpSent(false)}
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="input-control">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      style={{
                        textAlign: "center",
                        letterSpacing: "10px",
                        fontSize: "1.4rem",
                      }}
                      required
                      value={loginOtp}
                      onChange={(e) =>
                        setLoginOtp(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                className="submit-action-btn"
                disabled={otpLoad || (otpSent && loginOtp.length < 6)}
              >
                {otpLoad ? (
                  <div className="spinner"></div>
                ) : otpSent ? (
                  "Verify & Enter"
                ) : (
                  "Request Login Code"
                )}
              </button>
            </form>
          )}

          <div className="divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleRedirect}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 18.013c-1.09.503-2.303.887-4.04.887a7.077 7.077 0 0 1-6.734-4.856l-4.026 3.115C3.198 21.302 7.27 24 12 24c3.11 0 5.928-1.033 8.127-2.758l-4.087-3.229Z"
                />
                <path
                  fill="#4285F4"
                  d="M23.832 12.218c0-.796-.076-1.562-.218-2.3H12v4.69h6.605a5.645 5.645 0 0 1-2.454 3.705l4.087 3.229c2.39-2.222 3.775-5.495 3.775-9.324Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.266 14.235 1.24 17.35A11.947 11.947 0 0 1 0 12c0-1.92.445-3.733 1.24-5.35l4.026 3.115a7.03 7.03 0 0 0 0 4.47Z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="auth-redirect">
            Don't have an account? <Link to="/signup">Create One Free</Link>
          </div>
        </motion.div>
      </section>

      {/* --- RIGHT: VISUAL --- */}
      <section className="side-visual">
        <div className="grid-overlay"></div>
        <div className="visual-core">
          <div className="node-center">
            <motion.div
              className="pulse-ring"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.05, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="core-icon">
              <Cpu size={42} color="#fa3a3b" />
            </div>
          </div>
          <div className="visual-text">
            <h2>
              Continuous <br />
              <span>Surveillance.</span>
            </h2>
            <p>Real-time telemetry and AI diagnostics.</p>
          </div>
        </div>
      </section>

      {/* --- FORGOT PASSWORD MODAL (From previous step) --- */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {/* ... (Forgot Modal Content) ... */}
              <div className="modal-header-icon">
                {forgotStep === 1 ? (
                  <KeyRound size={32} color="#fa3a3b" />
                ) : (
                  <ShieldCheck size={32} color="#10B981" />
                )}
              </div>
              <h2>
                {forgotStep === 1 ? "Reset Access Key" : "New Security Key"}
              </h2>
              <p>
                {forgotStep === 1
                  ? "Enter email to receive reset credentials."
                  : "Enter the code and your new password."}
              </p>

              {modalError && (
                <div className="alert-error" style={{ marginBottom: "1rem" }}>
                  <AlertCircle size={14} /> {modalError}
                </div>
              )}
              {modalSuccess && (
                <div
                  className="alert-error"
                  style={{
                    marginBottom: "1rem",
                    borderColor: "#10B981",
                    color: "#10B981",
                    background: "rgba(16, 185, 129, 0.1)",
                  }}
                >
                  <CheckCircle size={14} /> {modalSuccess}
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequest}>
                  <div className="input-field">
                    <div className="input-control">
                      <Mail size={18} className="field-icon" />
                      <input
                        type="email"
                        placeholder="commander@site.com"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="submit-action-btn"
                    disabled={modalLoading}
                  >
                    {modalLoading ? "Sending..." : "Request Reset Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit}>
                  <div className="input-field">
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="000000"
                      className="otp-input-area"
                      style={{
                        fontSize: "1.5rem",
                        letterSpacing: "8px",
                        padding: "15px",
                      }}
                      required
                      value={resetData.otp}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          otp: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>
                  <div className="input-field">
                    <div className="input-control">
                      <Lock size={18} className="field-icon" />
                      <input
                        type="password"
                        placeholder="New Password"
                        required
                        value={resetData.newPassword}
                        onChange={(e) =>
                          setResetData({
                            ...resetData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="submit-action-btn"
                    disabled={modalLoading}
                  >
                    Update Password
                  </button>
                </form>
              )}
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowForgot(false);
                  setForgotStep(1);
                }}
              >
                Abort Operation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
