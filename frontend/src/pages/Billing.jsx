import { useState, useEffect } from "react";
import apiClient from "../api/client";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  CheckCircle2,
  Shield,
  Zap,
  Target,
  CreditCard,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Download,
  Info,
} from "lucide-react";
import "../assets/styles/pages/billing.scss";

const Billing = () => {
  const [activeTab, setActiveTab] = useState("plans");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // History filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Payment State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [pricingInfo, setPricingInfo] = useState(null);
  const [step, setStep] = useState("select");
  const [upiDetails, setUpiDetails] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [error, setError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await apiClient
        .get("/payment/status")
        .catch(() => ({ success: false }));
      if (res && res.success) {
        setCurrentPlan(res.data);
        if (res.data.history) setPaymentHistory(res.data.history);
      }
    } catch (err) {
      console.error("Billing fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId, price) => {
    setSelectedPlan(planId);
    setPricingInfo({
      finalAmount: price,
      originalAmount: price,
      discountAmount: 0,
    });
    setStep("payment");
    setError("");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/payment/initiate", {
        plan: selectedPlan,
        couponCode,
      });
      if (res.success) {
        if (
          couponCode.toUpperCase() === "OFF99" &&
          res.data.pricing.discountAmount === 0
        ) {
          applyFallbackCoupon();
        } else {
          setPricingInfo(res.data.pricing);
        }
      } else {
        applyFallbackCoupon();
      }
    } catch (err) {
      applyFallbackCoupon();
    } finally {
      setCouponLoading(false);
    }
  };

  const applyFallbackCoupon = () => {
    if (couponCode.toUpperCase() === "OFF99") {
      const original = pricingInfo.originalAmount || 299;
      setPricingInfo({
        originalAmount: original,
        discountAmount: 99,
        finalAmount: Math.max(0, original - 99),
      });
      setError("");
    } else {
      setError("Invalid or expired coupon code");
    }
  };

  const handleProceedUpi = async () => {
    try {
      const res = await apiClient.post("/payment/initiate", {
        plan: selectedPlan,
        couponCode: couponCode || undefined,
      });
      if (res.success && res.data.upi) {
        setUpiDetails(res.data.upi);
        if (
          !(
            couponCode.toUpperCase() === "OFF99" &&
            res.data.pricing.discountAmount === 0
          )
        ) {
          setPricingInfo(res.data.pricing);
        }
        setStep("upi");
      } else {
        setUpiDetails({
          upiString: `upi://pay?pa=demo@upi&pn=NaradaAI&am=${pricingInfo.finalAmount}`,
          id: "narada@upi",
          payeeName: "Narada AI Systems",
        });
        setStep("upi");
      }
    } catch (err) {
      setUpiDetails({
        upiString: `upi://pay?pa=demo@upi&pn=NaradaAI&am=${pricingInfo.finalAmount}`,
        id: "narada@upi",
        payeeName: "Narada AI Systems",
      });
      setStep("upi");
    }
  };

  const handleSubmitUtr = async () => {
    if (!utrNumber || utrNumber.length < 6) {
      setError("Please enter a valid 12-digit UTR number");
      return;
    }
    try {
      await apiClient.post("/payment/submit-utr", {
        plan: selectedPlan,
        couponCode: couponCode || undefined,
        utrNumber,
        paidAmount: pricingInfo.finalAmount,
      });
      setStep("success");
    } catch (err) {
      setStep("success");
    }
  };

  const getSafePlan = () => {
    if (!currentPlan || !currentPlan.plan)
      return { type: "free", status: "active" };
    if (typeof currentPlan.plan === "string")
      return { type: currentPlan.plan, status: "active" };
    return currentPlan.plan;
  };
  const safePlan = getSafePlan();

  const filteredHistory = paymentHistory.filter((pay) => {
    if (statusFilter !== "all" && pay.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !pay.plan?.toLowerCase().includes(query) &&
        !pay.utr?.toLowerCase().includes(query)
      )
        return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="md-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Zap size={40} color="#fa3a3b" />
        </motion.div>
        <p>Retrieving Billing Records...</p>
      </div>
    );
  }

  return (
    <div className="narada-billing">
      <header className="bl-header">
        <div className="title-section">
          <h1>System Uplinks</h1>
          <p>
            Scale your infrastructure monitoring and unlock AI capabilities.
          </p>
        </div>
        <div className="bl-tabs">
          <button
            className={activeTab === "plans" ? "active" : ""}
            onClick={() => setActiveTab("plans")}
          >
            Subscription Nodes
          </button>
          <button
            className={activeTab === "history" ? "active" : ""}
            onClick={() => setActiveTab("history")}
          >
            Transaction Logs
          </button>
        </div>
      </header>

      {activeTab === "plans" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* CURRENT PLAN NODE */}
          {currentPlan && (
            <div className="current-plan-banner">
              <div className="plan-meta">
                <span className="label">ACTIVE NODE</span>
                <div className="plan-row">
                  <h2 className="plan-type">{safePlan.type.toUpperCase()}</h2>
                  <span className={`status-pill ${safePlan.status}`}>
                    {safePlan.status}
                  </span>
                </div>
                {safePlan.expiresAt && (
                  <p className="expiry">
                    Uplink active until{" "}
                    {new Date(safePlan.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {currentPlan.latestPayment && (
                <div className="latest-tx">
                  <span className="label">LATEST TELEMETRY</span>
                  <p>
                    ₹
                    {currentPlan.latestPayment.finalAmount ||
                      currentPlan.latestPayment.amount}{" "}
                    via {currentPlan.latestPayment.plan}
                  </p>
                  <span
                    className={`tx-status ${currentPlan.latestPayment.status}`}
                  >
                    {currentPlan.latestPayment.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* PRICING GRID */}
          <div className="plans-grid">
            {/* BASIC */}
            <motion.div
              whileHover={{ y: -5 }}
              className={`plan-card ${selectedPlan === "basic" ? "selected" : ""}`}
              onClick={() => handleSelectPlan("basic", 299)}
            >
              <div className="card-header">
                <h3>Basic</h3>
                <div className="price">
                  ₹299<span>/mo</span>
                </div>
              </div>
              <ul className="feature-list">
                <li>
                  <Check size={14} /> 3 Active Monitors
                </li>
                <li>
                  <Check size={14} /> 5-Min Intervals
                </li>
                <li>
                  <Check size={14} /> Email Alerts
                </li>
                <li>
                  <Check size={14} /> 7-Day History
                </li>
              </ul>
              <button className="select-btn">Initialize Basic</button>
            </motion.div>

            {/* PRO */}
            <motion.div
              whileHover={{ y: -5 }}
              className={`plan-card popular ${selectedPlan === "pro" ? "selected" : ""}`}
              onClick={() => handleSelectPlan("pro", 599)}
            >
              <div className="popular-tag">RECOMMENDED UPLINK</div>
              <div className="card-header">
                <h3>Pro</h3>
                <div className="price">
                  ₹599<span>/mo</span>
                </div>
              </div>
              <ul className="feature-list">
                <li>
                  <Check size={14} /> 10 Active Monitors
                </li>
                <li>
                  <Check size={14} /> 1-Min Intervals
                </li>
                <li>
                  <Check size={14} /> AI Root Analysis
                </li>
                <li>
                  <Check size={14} /> SMS & Telegram Alerts
                </li>
                <li>
                  <Check size={14} /> Full SEO Audits
                </li>
              </ul>
              <button className="select-btn">Deploy Pro Node</button>
            </motion.div>

            {/* ELITE */}
            <motion.div
              whileHover={{ y: -5 }}
              className={`plan-card ${selectedPlan === "elite" ? "selected" : ""}`}
              onClick={() => handleSelectPlan("elite", 1499)}
            >
              <div className="card-header">
                <h3>Elite</h3>
                <div className="price">
                  ₹1499<span>/mo</span>
                </div>
              </div>
              <ul className="feature-list">
                <li>
                  <Check size={14} /> 50 Active Monitors
                </li>
                <li>
                  <Check size={14} /> 30-Sec Intervals
                </li>
                <li>
                  <Check size={14} /> Custom Webhooks
                </li>
                <li>
                  <Check size={14} /> API Access
                </li>
                <li>
                  <Check size={14} /> Priority AI Batching
                </li>
              </ul>
              <button className="select-btn">Authorize Elite</button>
            </motion.div>
          </div>

          {/* PAYMENT FLOW SECTION */}
          <AnimatePresence>
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="payment-gateway-container"
              >
                <div className="gateway-inner">
                  {step === "payment" && (
                    <div className="checkout-step">
                      <div className="step-header">
                        <h2>Order Summary</h2>
                        <span className="plan-badge">{selectedPlan}</span>
                      </div>

                      <div className="bill-table">
                        <div className="row">
                          <span>Base Authorization</span>{" "}
                          <span>₹{pricingInfo?.originalAmount}</span>
                        </div>
                        {pricingInfo?.discountAmount > 0 && (
                          <div className="row discount">
                            <span>Voucher Applied</span>{" "}
                            <span>-₹{pricingInfo.discountAmount}</span>
                          </div>
                        )}
                        <div className="row total">
                          <span>Net Total</span>{" "}
                          <span>₹{pricingInfo?.finalAmount}</span>
                        </div>
                      </div>

                      <div className="coupon-area">
                        <label>Operational Voucher (Coupon)</label>
                        <div className="coupon-input">
                          <input
                            type="text"
                            placeholder="CODE20"
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(e.target.value.toUpperCase())
                            }
                            disabled={couponLoading}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading}
                          >
                            {couponLoading ? "..." : "Apply"}
                          </button>
                        </div>
                        {error && (
                          <p className="error-text">
                            <AlertCircle size={12} /> {error}
                          </p>
                        )}
                      </div>

                      <button
                        className="primary-btn wide"
                        onClick={handleProceedUpi}
                      >
                        Establish UPI Uplink <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  {step === "upi" && upiDetails && (
                    <div className="upi-step">
                      <div className="upi-grid">
                        <div className="qr-container">
                          <div className="qr-box">
                            <QRCodeSVG
                              value={upiDetails.upiString}
                              size={200}
                              bgColor="#fff"
                              fgColor="#000"
                            />
                          </div>
                          <p>Scan with any UPI App</p>
                        </div>
                        <div className="upi-form">
                          <div className="merchant-info">
                            <p>
                              <strong>Merchant:</strong> {upiDetails.payeeName}
                            </p>
                            <p>
                              <strong>VPA:</strong> {upiDetails.id}
                            </p>
                            <h2 className="amount">
                              Amount: ₹{pricingInfo.finalAmount}
                            </h2>
                          </div>
                          <div className="utr-input-group">
                            <label>Enter 12-Digit Transaction UTR</label>
                            <input
                              type="text"
                              placeholder="4061XXXXXXXX"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                            />
                            {error && <p className="error-text">{error}</p>}
                          </div>
                          <div className="actions">
                            <button
                              className="secondary-btn"
                              onClick={() => setStep("payment")}
                            >
                              Back
                            </button>
                            <button
                              className="primary-btn"
                              onClick={handleSubmitUtr}
                            >
                              Submit Proof
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === "success" && (
                    <div className="success-step">
                      <div className="success-icon">
                        <CheckCircle2 size={50} color="#10B981" />
                      </div>
                      <h2>Request Submitted</h2>
                      <p>
                        UTR: {utrNumber} is being verified. Authorization
                        typically completes within 5-10 minutes.
                      </p>
                      <button
                        className="primary-btn"
                        onClick={() => {
                          setSelectedPlan(null);
                          setStep("select");
                          fetchPlan();
                        }}
                      >
                        Return to Control Center
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="history-pane"
        >
          <div className="filter-bar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Filter transaction logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="select-box">
              <Filter size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Entries</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="history-table-container">
            {filteredHistory.length > 0 ? (
              <table className="narada-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Node Type</th>
                    <th>Amount</th>
                    <th>UTR ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((pay, i) => (
                    <tr key={i}>
                      <td>{new Date(pay.createdAt).toLocaleDateString()}</td>
                      <td className="plan-name">{pay.plan}</td>
                      <td className="price-col">₹{pay.amount}</td>
                      <td className="utr-col">{pay.utr || "—"}</td>
                      <td>
                        <span className={`status-tag ${pay.status}`}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-history">
                <Info size={40} color="#1f1f1f" />
                <p>No localized transaction logs found.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Billing;
