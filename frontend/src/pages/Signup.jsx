import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  Activity,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Check,
  X,
  Shield,
  Globe,
  Cpu,
  Zap,
} from "lucide-react";
import "../assets/styles/pages/signup.scss";

const strengthLabels = ["Empty", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["#1f1f1f", "#fa3a3b", "#f59e0b", "#10B981", "#fa3a3b"];

const Signup = () => {
  const navigate = useNavigate();

  const handleGoogleRedirect = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3500";
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  // Form & UI State
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP State
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoad, setOtpLoad] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Password Strength Logic (Synced with your 4-bar UI)
  const getScore = (pwd) => {
    let s = 0;
    if (pwd.length >= 6) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const score = getScore(form.password);

  // Phase 1: Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Front-end Validations
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      // Dynamic import of your API client
      const { default: api } = await import('../api/client');
      await api.post('/auth/register', {
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setShowOTP(true);
    } catch (err) {
      setError(err.message || "Uplink failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoad(true);
    try {
      const { default: api } = await import('../api/client');
      await api.post('/auth/verify-email', {
        email: form.email,
        otp
      });
      // Redirect to login on success
      navigate('/login', { state: { message: 'Email verified! Please log in.' } });
    } catch (err) {
      setOtpError(err.message || "Invalid or expired OTP.");
    } finally {
      setOtpLoad(false);
    }
  };

  return (
    <div className="narada-signup-root">
      {/* --- LEFT: FORM PANEL --- */}
      <section className="side-form">
        <motion.div
          className="content-limit"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Link to="/" className="brand-header">
            <Activity className="brand-logo" size={28} />
            <span>
              Web <span className="red-text">Monitor</span>
            </span>
          </Link>

          <div className="text-group">
            <h1>Create Your Account</h1>
            <p>Deploy your intelligent monitoring nodes in 60 seconds.</p>
          </div>

          {error && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="alert-error"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <label>Full Name</label>
              <div className="input-control">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={form.fullname}
                  onChange={(e) =>
                    setForm({ ...form, fullname: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="input-field">
              <label>Email Address</label>
              <div className="input-control">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  placeholder="commander@site.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="input-field">
              <label>Password</label>
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
              <div className="password-strength">
                <div className="strength-bar-bg">
                  <motion.div
                    className="strength-fill"
                    animate={{
                      width: `${(score / 4) * 100}%`,
                      backgroundColor: strengthColors[score],
                    }}
                  />
                </div>
                <span>{strengthLabels[score]}</span>
              </div>
            </div>

            <div className="input-field">
              <label>Confirm Password</label>
              <div className="input-control">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Confirm Your Password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
                {form.confirmPassword && (
                  <div className="match-status">
                    {form.password === form.confirmPassword ? (
                      <Check size={16} color="#10B981" />
                    ) : (
                      <X size={16} color="#fa3a3b" />
                    )}
                  </div>
                )}
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
                  Generate Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

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
            Already registered? <Link to="/login">Sign In</Link>
          </div>
        </motion.div>
      </section>

      {/* --- RIGHT: VISUAL PANEL --- */}
      <section className="side-visual">
        <div className="grid-overlay"></div>
        <div className="glow-orb"></div>

        <div className="visual-core">
          <div className="node-center">
            <motion.div
              className="pulse-ring"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.05, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="core-icon">
              <Cpu size={42} color="#fa3a3b" />
            </div>
          </div>

          <div className="floating-data">
            <motion.div
              className="f-tag tag-1"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap size={14} color="#fa3a3b" /> <span>Real-time Alerts</span>
            </motion.div>
            <motion.div
              className="f-tag tag-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Shield size={14} color="#fa3a3b" /> <span>Root Cause Analysis</span>
            </motion.div>
            <motion.div
              className="f-tag tag-3"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Globe size={14} color="#fa3a3b" /> <span>Global Uptime</span>
            </motion.div>
          </div>

          <div className="visual-text">
            <h2>
              Stop Reacting. <br />
              <span>Start Predicting.</span>
            </h2>
            <p>
              The only monitoring platform that explains the "Why" behind every
              "Down".
            </p>
          </div>
        </div>
      </section>

      {/* --- OTP MODAL --- */}
      <AnimatePresence>
        {showOTP && (
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
              <div className="modal-header-icon">
                <Mail size={32} color="#fa3a3b" />
              </div>
              <h2>Verify Identity</h2>
              <p>
                A digital key has been sent to <b>{form.email}</b>
              </p>

              {otpError && (
                <div className="alert-error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} /> {otpError}
                </div>
              )}

              <form onSubmit={handleVerifyOTP}>
                <div className="otp-input-area">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="submit-action-btn"
                  disabled={otpLoad || otp.length !== 6}
                >
                  {otpLoad ? <div className="spinner"></div> : "Verify & Launch"}
                </button>
              </form>

              <button className="cancel-btn" onClick={() => setShowOTP(false)}>
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Signup;
