import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Globe,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Navigation,
  Phone,
  PhoneCall,
  Plus,
  Power,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  UserCheck,
  Users,
  UtensilsCrossed,
  Wifi,
  X,
  XCircle,
  Coffee,
  CreditCard,
  DollarSign,
  Printer,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  authenticateAdmin,
  createSpecialDirectSession,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  evaluatePasswordStrength,
  getAdminSession,
  getLockoutStatus,
  getStoredCredentials,
  logoutAdmin,
  updateAdminCredentials,
  type AdminSession,
} from "@/lib/admin-auth";
import {
  clearAllAdminStoreData,
  deleteCafeOrder,
  getCafeOrders,
  getCafeSettings,
  saveCafeOrder,
  updateCafeOrderStatus,
  updateCafeSettings,
  type CafeOrder,
  type CafeSettings,
  type OrderItem,
  type OrderStatus,
  type OrderType,
  type PaymentStatus,
} from "@/lib/admin-store";
import {
  clearAllAnalyticsData,
  deleteBooking,
  deleteForm,
  exportDataAsCSV,
  getAnalyticsOverview,
  getChannelClickMetrics,
  getConversionFunnelReport,
  getDailyActivityChart,
  getDateRangeTimestamps,
  getRecentActivityFeed,
  getStoredBookings,
  getStoredEvents,
  getStoredForms,
  getTrafficSourcesReport,
  isTrackingEnabled,
  seedRealisticDemoData,
  setTrackingEnabled,
  trackBooking,
  updateBookingStatus,
  updateFormStatus,
  type AnalyticsOverviewMetrics,
  type BookingRecord,
  type BookingStatus,
  type ClickMetrics,
  type DailyChartPoint,
  type DateFilterType,
  type DateRange,
  type DeviceType,
  type FormStatus,
  type FormSubmissionRecord,
  type FunnelStage,
  type RecentActivityItem,
  type TrafficSourceMetric,
} from "@/lib/tracker";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard & Real Analytics | Boreal Café" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

export function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user opened the special direct login link
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isSpecialAccess =
        params.get("key") === "boreal2026" ||
        params.get("auth") === "special" ||
        params.get("magic") === "true" ||
        params.get("token") === "special_access" ||
        params.get("login") === "direct";

      const shouldClear =
        params.get("clear") === "true" ||
        params.get("clear") === "all" ||
        params.get("action") === "clear";

      if (shouldClear) {
        clearAllAnalyticsData();
        clearAllAdminStoreData();
        toast.success("Admin Data Cleared!", {
          description: "All tracking events, bookings, and forms have been reset to 0.",
        });
      }

      if (isSpecialAccess) {
        const specialSession = createSpecialDirectSession();
        setSession(specialSession);
        setLoading(false);
        toast.success("Signed in via Special Direct Link!", {
          description: `Authorized session active as @${specialSession.username}`,
        });
        // Clean search params from address bar without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    }

    const s = getAdminSession();
    setSession(s);
    setLoading(false);
  }, []);

  const handleLoginSuccess = (newSession: AdminSession) => {
    setSession(newSession);
    toast.success("Authentication successful! Welcome to Admin Command Center.", {
      description: `Logged in as @${newSession.username}`,
    });
  };

  const handleLogout = () => {
    logoutAdmin();
    setSession(null);
    toast.info("You have securely logged out.");
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading Boreal Café Real-Time Operations...</p>
      </div>
    );
  }

  if (!session) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard session={session} onLogout={handleLogout} />;
}

// ==========================================
// 1. ADMIN LOGIN & CREDENTIALS SHOWCASE
// ==========================================
function AdminLoginForm({ onLoginSuccess }: { onLoginSuccess: (s: AdminSession) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutSecs, setLockoutSecs] = useState(0);

  useEffect(() => {
    const checkLockout = () => {
      const status = getLockoutStatus();
      if (status.isLocked) {
        setLockoutSecs(status.remainingSeconds);
      } else {
        setLockoutSecs(0);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentCreds = useMemo(() => getStoredCredentials(), []);

  const handleFillDemo = () => {
    setUsername(currentCreds.username);
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setErrorMsg("");
    toast.info("Admin credentials pre-filled", {
      description: "Default secure credentials loaded into form.",
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      const res = authenticateAdmin(username, password, rememberMe);
      setIsSubmitting(false);

      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMsg(res.message);
        toast.error("Access Denied", { description: res.message });
      }
    }, 400);
  };

  const handleInstantMagicLogin = () => {
    const specialSession = createSpecialDirectSession();
    toast.success("1-Click Instant Login Authorized!", {
      description: `Welcome back, @${specialSession.username}`,
    });
    onLoginSuccess(specialSession);
  };

  const handleCopyMagicLink = () => {
    const magicUrl = `${window.location.origin}/admin?auth=special`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(magicUrl);
      toast.success("Special Direct Login link copied to clipboard!", {
        description: magicUrl,
      });
    }
  };

  return (
    <div className="admin-portal-wrap">
      <div className="admin-bg-glow glow-1" />
      <div className="admin-bg-glow glow-2" />

      <div className="admin-login-card">
        <div className="admin-card-header">
          <div className="admin-brand-icon">
            <span className="brand-letter">B</span>
          </div>
          <span className="admin-security-tag">
            <ShieldCheck size={13} /> Protected Admin Access
          </span>
          <h1>Admin Dashboard</h1>
          <p>Real-time website analytics, bookings, leads, and operational command.</p>
        </div>

        {lockoutSecs > 0 && (
          <div className="admin-alert-banner destructive">
            <ShieldAlert size={16} />
            <div>
              <strong>Security Lockout Active</strong>
              <p>Too many failed attempts. Try again in {lockoutSecs} seconds.</p>
            </div>
          </div>
        )}

        {errorMsg && lockoutSecs === 0 && (
          <div className="admin-alert-banner destructive">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="admin-input-group">
            <label htmlFor="admin-username">
              <User size={14} /> Admin Username
            </label>
            <div className="input-with-icon">
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. 10100"
                autoComplete="username"
                disabled={lockoutSecs > 0 || isSubmitting}
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">
              <Lock size={14} /> Password
            </label>
            <div className="input-with-icon">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. gagan)"
                autoComplete="current-password"
                disabled={lockoutSecs > 0 || isSubmitting}
                required
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="admin-form-meta">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me (7 days)</span>
            </label>
          </div>

          <button
            type="submit"
            className="admin-submit-btn"
            disabled={lockoutSecs > 0 || isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-loading">
                <span className="spinner-sm" /> Verifying...
              </span>
            ) : (
              <span className="btn-content">
                <KeyRound size={16} /> Login to Dashboard
              </span>
            )}
          </button>
        </form>

        {/* SPECIAL DIRECT MAGIC LOGIN CARD */}
        <div className="special-magic-card">
          <div className="magic-header">
            <Sparkles size={15} className="magic-sparkle-icon" />
            <div>
              <span className="magic-badge">Instant 1-Click Access</span>
              <span className="magic-title">Special Direct Login Link</span>
            </div>
          </div>
          <p className="magic-desc">
            Bypass typing your credentials with this pre-authorized instant login link:
          </p>
          <div className="magic-actions">
            <button type="button" className="magic-enter-btn" onClick={handleInstantMagicLogin}>
              <KeyRound size={14} /> Direct 1-Click Login
            </button>
            <button
              type="button"
              className="magic-copy-btn"
              onClick={handleCopyMagicLink}
              title="Copy Special Login URL"
            >
              <Copy size={13} /> Copy Link
            </button>
          </div>
          <div className="magic-url-preview">
            <code>http://localhost:8080/admin?auth=special</code>
          </div>
        </div>

        <div className="credentials-callout">
          <div className="callout-header">
            <KeyRound size={14} className="accent-icon" />
            <span className="callout-title">Standard Credentials</span>
            <button
              type="button"
              className="quick-fill-btn"
              onClick={handleFillDemo}
              title="Auto-fill credentials"
            >
              <Sparkles size={12} /> Auto-fill
            </button>
          </div>
          <div className="cred-fields">
            <div className="cred-item">
              <span className="cred-label">Username:</span>
              <code className="cred-code">{currentCreds.username}</code>
              <button
                type="button"
                className="copy-btn"
                onClick={() => handleCopy(currentCreds.username, "Username")}
                title="Copy username"
              >
                <Copy size={13} />
              </button>
            </div>
            <div className="cred-item">
              <span className="cred-label">Password:</span>
              <code className="cred-code">{DEFAULT_ADMIN_PASSWORD}</code>
              <button
                type="button"
                className="copy-btn"
                onClick={() => handleCopy(DEFAULT_ADMIN_PASSWORD, "Password")}
                title="Copy password"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>
          <p className="callout-note">
            Administrator credentials for Boreal Café management portal.
          </p>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button
              type="button"
              className="action-btn-danger"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => {
                clearAllAnalyticsData();
                clearAllAdminStoreData();
                toast.success("All data in admin panel has been cleared to 0!");
              }}
              title="Clear all stored data to 0"
            >
              <Trash2 size={13} /> Clear All Admin Panel Data (Reset to 0)
            </button>
          </div>
        </div>

        <div className="admin-footer-links">
          <Link to="/" className="back-link">
            <ArrowLeft size={14} /> Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. MAIN ADMIN DASHBOARD WITH TABS
// ==========================================
type AdminDashboardTab =
  | "overview"
  | "orders"
  | "bookings"
  | "forms"
  | "whatsapp"
  | "phone"
  | "directions"
  | "traffic"
  | "funnel"
  | "security";

function AdminDashboard({ session, onLogout }: { session: AdminSession; onLogout: () => void }) {
  const [currentTab, setCurrentTab] = useState<AdminDashboardTab>("overview");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("last30");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });

  const [tick, setTick] = useState(0);

  // Compute active date range timestamps
  const activeDateRange: DateRange = useMemo(() => {
    return getDateRangeTimestamps(dateFilter, customRange);
  }, [dateFilter, customRange]);

  const [allBookings, setAllBookings] = useState(getStoredBookings);
  const [allForms, setAllForms] = useState(getStoredForms);
  const [allOrders, setAllOrders] = useState<CafeOrder[]>(getCafeOrders);
  const [isGlobalAddOrderOpen, setIsGlobalAddOrderOpen] = useState(false);

  // Reactive listeners for live analytics events
  useEffect(() => {
    const handleEvent = () => {
      setTick((t) => t + 1);
      setAllBookings(getStoredBookings());
      setAllForms(getStoredForms());
      setAllOrders(getCafeOrders());
    };
    window.addEventListener("boreal-analytics-event", handleEvent);
    return () => window.removeEventListener("boreal-analytics-event", handleEvent);
  }, []);

  // Overview metrics
  const overviewMetrics: AnalyticsOverviewMetrics = useMemo(() => {
    void tick;
    return getAnalyticsOverview(activeDateRange);
  }, [activeDateRange, tick]);

  const newBookingsCount = useMemo(
    () => allBookings.filter((b) => b.status === "New").length,
    [allBookings],
  );
  const newFormsCount = useMemo(
    () => allForms.filter((f) => f.status === "New").length,
    [allForms],
  );
  const newOrdersCount = useMemo(
    () => allOrders.filter((o) => o.orderStatus === "New").length,
    [allOrders],
  );

  const handleExportCSV = (type: "bookings" | "forms" | "events" | "all") => {
    exportDataAsCSV(type, activeDateRange);
    toast.success(`Exported ${type.toUpperCase()} to CSV!`);
  };

  const [cafeSettings, setCafeSettings] = useState<CafeSettings>(getCafeSettings);
  const [trackingActive, setTrackingActive] = useState<boolean>(isTrackingEnabled);

  useEffect(() => {
    const handleStoreUpdate = () => {
      setCafeSettings(getCafeSettings());
      setAllOrders(getCafeOrders());
    };
    const handleTrackUpdate = () => setTrackingActive(isTrackingEnabled());
    window.addEventListener("boreal-store-updated", handleStoreUpdate);
    window.addEventListener("boreal-tracking-toggled", handleTrackUpdate);
    return () => {
      window.removeEventListener("boreal-store-updated", handleStoreUpdate);
      window.removeEventListener("boreal-tracking-toggled", handleTrackUpdate);
    };
  }, []);

  const handleToggleCafeStatus = () => {
    const nextStatus = !cafeSettings.isOpen;
    updateCafeSettings({ isOpen: nextStatus });
    setCafeSettings((prev) => ({ ...prev, isOpen: nextStatus }));
    if (nextStatus) {
      toast.success("Café Status: DIRECT ON (OPEN)", {
        description: "Public website reflects OPEN and accepts customer reservations.",
      });
    } else {
      toast.warning("Café Status: DIRECT OFF (CLOSED)", {
        description: "Public website reflects CLOSED / OFFLINE mode.",
      });
    }
  };

  const handleToggleTracking = () => {
    const nextState = !trackingActive;
    setTrackingEnabled(nextState);
    setTrackingActive(nextState);
    if (nextState) {
      toast.success("Live Event Tracker: ON", {
        description: "Recording clicks, visits, calls, and forms in real time.",
      });
    } else {
      toast.info("Live Event Tracker: OFF (PAUSED)", {
        description: "Analytics tracking is temporarily paused.",
      });
    }
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL data in the admin panel? All visitors, bookings, forms, and tracking will be reset to 0.",
      )
    ) {
      clearAllAnalyticsData();
      clearAllAdminStoreData();
      setAllBookings([]);
      setAllForms([]);
      setTick((t) => t + 1);
      toast.success("All data in admin panel has been completely cleared!", {
        description: "All statistics, bookings, and forms have been reset to 0.",
      });
    }
  };

  return (
    <div className="admin-layout">
      {/* Top Application Bar */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <Link to="/" className="topbar-brand" title="View Customer Website">
            <span className="brand-badge">B</span>
            <div className="brand-text">
              <span className="name">BOREAL CAFÉ</span>
              <span className="sub">ADMIN DASHBOARD</span>
            </div>
          </Link>
          <div className="topbar-divider" />
          <span className="live-data-badge">
            <span className="pulse-dot" /> REAL-TIME DATA TRACKING
          </span>
        </div>

        <div className="topbar-right">
          {/* PRIMARY ORDER BUTTON */}
          <button
            type="button"
            className={`topbar-order-nav-btn ${currentTab === "orders" ? "active" : ""}`}
            onClick={() => setCurrentTab("orders")}
            title="View & Manage Customer Orders"
            aria-label="Customer Orders"
          >
            <ShoppingBag size={15} />
            <span>Orders</span>
            {newOrdersCount > 0 ? (
              <span className="topbar-order-badge badge-new">{newOrdersCount} New</span>
            ) : (
              <span className="topbar-order-badge badge-total">{allOrders.length}</span>
            )}
          </button>

          {/* QUICK CREATE ORDER BUTTON */}
          <button
            type="button"
            className="topbar-create-order-btn"
            onClick={() => {
              setCurrentTab("orders");
              setIsGlobalAddOrderOpen(true);
            }}
            title="Create a new counter or table order"
            aria-label="Create New Order"
          >
            <Plus size={14} />
            <span>+ Create Order</span>
          </button>

          {/* DIRECT ON / OFF MASTER BUTTON */}
          <button
            type="button"
            className={`direct-master-btn ${cafeSettings.isOpen ? "state-on" : "state-off"}`}
            onClick={handleToggleCafeStatus}
            title={
              cafeSettings.isOpen
                ? "Status: ON (OPEN). Click to switch DIRECT OFF (Close Café)"
                : "Status: OFF (CLOSED). Click to switch DIRECT ON (Open Café)"
            }
            aria-label="Direct ON/OFF Master Switch"
          >
            <Power size={14} className="power-icon" />
            <span className="direct-btn-label">
              <span className="direct-prefix">DIRECT:</span>
              <strong className="direct-status">
                {cafeSettings.isOpen ? "ON (OPEN)" : "OFF (CLOSED)"}
              </strong>
            </span>
            <span className="toggle-switch-ui">
              <span className="switch-thumb" />
            </span>
          </button>

          {/* TRACKING ON / OFF BUTTON */}
          <button
            type="button"
            className={`tracking-pill-btn ${trackingActive ? "track-on" : "track-off"}`}
            onClick={handleToggleTracking}
            title={
              trackingActive
                ? "Tracker: ON. Click to pause tracking"
                : "Tracker: OFF. Click to resume tracking"
            }
          >
            <Activity size={12} />
            <span>
              TRACK: <strong>{trackingActive ? "ON" : "OFF"}</strong>
            </span>
          </button>

          <button
            type="button"
            className="topbar-clear-btn"
            onClick={handleClearAllData}
            title="Clear all stored data to 0"
          >
            <Trash2 size={13} />
            <span>Clear All Data</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="topbar-link-btn"
            title="Open customer storefront in a new tab"
          >
            <span>Live Website</span>
            <ExternalLink size={13} />
          </a>

          <div className="user-profile-menu">
            <div className="avatar-chip">
              <UserCheck size={14} />
              <span className="username">{session.username}</span>
              <span className="role-tag">Admin</span>
            </div>
            <button type="button" className="logout-btn" onClick={onLogout} title="Secure Logout">
              <LogOut size={15} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="admin-body">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <div className="sidebar-section-title">CAFE OPERATIONS</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-item ${currentTab === "orders" ? "active" : ""}`}
              onClick={() => setCurrentTab("orders")}
            >
              <ShoppingBag size={16} />
              <span>Customer Orders</span>
              {newOrdersCount > 0 ? (
                <span className="nav-badge pending">{newOrdersCount} new</span>
              ) : (
                <span className="badge-count-dim">{allOrders.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`nav-item ${currentTab === "bookings" ? "active" : ""}`}
              onClick={() => setCurrentTab("bookings")}
            >
              <Calendar size={16} />
              <span>Table Bookings</span>
              {newBookingsCount > 0 && (
                <span className="nav-badge pending">{newBookingsCount} new</span>
              )}
            </button>
          </nav>

          <div className="sidebar-section-title">ANALYTICS & METRICS</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-item ${currentTab === "overview" ? "active" : ""}`}
              onClick={() => setCurrentTab("overview")}
            >
              <BarChart3 size={16} />
              <span>Website Overview</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentTab === "forms" ? "active" : ""}`}
              onClick={() => setCurrentTab("forms")}
            >
              <FileText size={16} />
              <span>Form Data</span>
              {newFormsCount > 0 && <span className="nav-badge new">{newFormsCount} new</span>}
            </button>

            <button
              type="button"
              className={`nav-item ${currentTab === "whatsapp" ? "active" : ""}`}
              onClick={() => setCurrentTab("whatsapp")}
            >
              <MessageCircle size={16} />
              <span>WhatsApp Tracking</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentTab === "phone" ? "active" : ""}`}
              onClick={() => setCurrentTab("phone")}
            >
              <PhoneCall size={16} />
              <span>Phone Click Tracking</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentTab === "directions" ? "active" : ""}`}
              onClick={() => setCurrentTab("directions")}
            >
              <Navigation size={16} />
              <span>Direction / Map Tracking</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentTab === "traffic" ? "active" : ""}`}
              onClick={() => setCurrentTab("traffic")}
            >
              <Globe size={16} />
              <span>Traffic Sources</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentTab === "funnel" ? "active" : ""}`}
              onClick={() => setCurrentTab("funnel")}
            >
              <TrendingUp size={16} />
              <span>Conversion Funnel</span>
            </button>
          </nav>

          <div className="sidebar-section-title">ADMIN & SECURITY</div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-item ${currentTab === "security" ? "active" : ""}`}
              onClick={() => setCurrentTab("security")}
            >
              <Settings size={16} />
              <span>Password & Security</span>
            </button>
          </nav>

          {/* Quick Export Panel in Sidebar */}
          <div className="sidebar-export-card">
            <div className="export-title">
              <Download size={13} />
              <span>Quick Export</span>
            </div>
            <div className="export-buttons-mini">
              <button
                type="button"
                className="btn-export-mini"
                onClick={() => exportOrdersCSV(allOrders)}
              >
                Orders CSV
              </button>
              <button
                type="button"
                className="btn-export-mini"
                onClick={() => handleExportCSV("bookings")}
              >
                Bookings CSV
              </button>
              <button
                type="button"
                className="btn-export-mini"
                onClick={() => handleExportCSV("forms")}
              >
                Forms CSV
              </button>
              <button
                type="button"
                className="btn-export-mini"
                onClick={() => handleExportCSV("all")}
              >
                All Data CSV
              </button>
            </div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="admin-content-pane">
          {/* Global Date Filter Strip */}
          <div className="date-filter-container">
            <div className="date-filter-left">
              <Filter size={15} />
              <span className="filter-label">DATE FILTER:</span>
              <div className="filter-pills">
                {[
                  { id: "today", label: "Today" },
                  { id: "yesterday", label: "Yesterday" },
                  { id: "last7", label: "Last 7 Days" },
                  { id: "last30", label: "Last 30 Days" },
                  { id: "thisMonth", label: "This Month" },
                  { id: "prevMonth", label: "Previous Month" },
                  { id: "custom", label: "Custom Date Range" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`date-pill-btn ${dateFilter === item.id ? "active" : ""}`}
                    onClick={() => setDateFilter(item.id as DateFilterType)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {dateFilter === "custom" && (
              <div className="custom-range-inputs">
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
                />
                <span>to</span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* TAB 1: WEBSITE OVERVIEW */}
          {currentTab === "overview" && (
            <OverviewSection
              metrics={overviewMetrics}
              range={activeDateRange}
              tick={tick}
              cafeSettings={cafeSettings}
              onToggleCafeStatus={handleToggleCafeStatus}
              onNavigate={(tab) => setCurrentTab(tab)}
              onExport={handleExportCSV}
              onClearAllData={handleClearAllData}
              ordersCount={allOrders.length}
              newOrdersCount={newOrdersCount}
              onOpenCreateOrder={() => setIsGlobalAddOrderOpen(true)}
            />
          )}

          {/* TAB: CUSTOMER ORDERS */}
          {currentTab === "orders" && (
            <OrdersSection range={activeDateRange} />
          )}

          {/* TAB 2: BOOKINGS */}
          {currentTab === "bookings" && (
            <BookingsSection range={activeDateRange} onExport={handleExportCSV} />
          )}

          {/* TAB 3: FORM DATA */}
          {currentTab === "forms" && (
            <FormsSection range={activeDateRange} onExport={handleExportCSV} />
          )}

          {/* TAB 4: WHATSAPP TRACKING */}
          {currentTab === "whatsapp" && <WhatsAppSection />}

          {/* TAB 5: PHONE TRACKING */}
          {currentTab === "phone" && <PhoneTrackingSection />}

          {/* TAB 6: DIRECTION / MAP TRACKING */}
          {currentTab === "directions" && <DirectionsTrackingSection />}

          {/* TAB 7: TRAFFIC SOURCES */}
          {currentTab === "traffic" && <TrafficSourcesSection range={activeDateRange} />}

          {/* TAB 8: CONVERSION FUNNEL */}
          {currentTab === "funnel" && <ConversionFunnelSection range={activeDateRange} />}

          {/* TAB 9: SECURITY & SETTINGS */}
          {currentTab === "security" && <SecuritySection session={session} />}
        </main>
      </div>

      {/* Global Quick Add Order Modal (Accessible from anywhere in admin) */}
      {isGlobalAddOrderOpen && (
        <AddOrderModal
          onClose={() => {
            setIsGlobalAddOrderOpen(false);
            setAllOrders(getCafeOrders());
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// 3. OVERVIEW SECTION (REQUESTED LAYOUT)
// ==========================================
function OverviewSection({
  metrics,
  range,
  tick,
  cafeSettings,
  onToggleCafeStatus,
  onNavigate,
  onExport,
  onClearAllData,
  ordersCount,
  newOrdersCount,
  onOpenCreateOrder,
}: {
  metrics: AnalyticsOverviewMetrics;
  range: DateRange;
  tick: number;
  cafeSettings: CafeSettings;
  onToggleCafeStatus: () => void;
  onNavigate: (tab: AdminDashboardTab) => void;
  onExport: (type: "bookings" | "forms" | "events" | "all") => void;
  onClearAllData: () => void;
  ordersCount?: number | undefined;
  newOrdersCount?: number | undefined;
  onOpenCreateOrder?: (() => void) | undefined;
}) {
  const chartData: DailyChartPoint[] = useMemo(() => {
    void tick;
    return getDailyActivityChart(range);
  }, [range, tick]);

  const recentFeed: RecentActivityItem[] = useMemo(() => {
    void tick;
    return getRecentActivityFeed(15);
  }, [tick]);

  const [activeChartMetric, setActiveChartMetric] = useState<
    "all" | "visitors" | "bookings" | "leads"
  >("all");

  return (
    <div className="admin-view-section">
      {/* DIRECT ON / OFF MASTER CONTROL BANNER */}
      <div className="direct-control-banner">
        <div className="control-banner-left">
          <div className="status-pulse-wrapper">
            <span
              className={`status-glow-dot ${cafeSettings.isOpen ? "dot-online" : "dot-offline"}`}
            />
          </div>
          <div className="control-banner-text">
            <div className="banner-title-row">
              <span className="banner-title">Direct Master Control:</span>
              <span
                className={`banner-status-badge ${cafeSettings.isOpen ? "badge-on" : "badge-off"}`}
              >
                {cafeSettings.isOpen ? "🟢 ONLINE / OPEN (ON)" : "🔴 OFFLINE / CLOSED (OFF)"}
              </span>
            </div>
            <p className="banner-subtitle">
              {cafeSettings.isOpen
                ? "Café is online and welcoming guests. Public website displays OPEN status and accepts reservations."
                : "Café is currently marked OFFLINE / CLOSED. Public website displays closed notice and reservation warnings."}
            </p>
          </div>
        </div>

        <div className="control-banner-actions">
          <button
            type="button"
            className={`direct-action-toggle-btn ${cafeSettings.isOpen ? "btn-turn-off" : "btn-turn-on"}`}
            onClick={onToggleCafeStatus}
            title={cafeSettings.isOpen ? "Click to switch DIRECT OFF" : "Click to switch DIRECT ON"}
          >
            <Power size={15} />
            <span>{cafeSettings.isOpen ? "Direct Turn OFF" : "Direct Turn ON"}</span>
          </button>
        </div>
      </div>

      {/* Header & Export Actions */}
      <div className="view-header">
        <div>
          <h2>WEBSITE OVERVIEW</h2>
          <p>Real-time tracked analytics, visitor volume, interactions, and table bookings.</p>
        </div>
        <div className="header-actions-group">
          {/* HIGH-VISIBILITY ORDER BUTTON */}
          <button
            type="button"
            className="action-btn-primary overview-orders-btn"
            onClick={() => onNavigate("orders")}
            title="Inspect incoming customer orders, kitchen ticket pipeline and receipts"
          >
            <ShoppingBag size={15} />
            <span>Customer Orders ({ordersCount ?? 0})</span>
            {newOrdersCount && newOrdersCount > 0 ? (
              <span className="overview-order-pill-new">{newOrdersCount} New</span>
            ) : null}
          </button>

          {onOpenCreateOrder && (
            <button
              type="button"
              className="action-btn-secondary"
              onClick={onOpenCreateOrder}
              title="Take a counter or table order right now"
            >
              <Plus size={14} />
              <span>+ Create Order</span>
            </button>
          )}

          <button
            type="button"
            className="action-btn-danger"
            onClick={onClearAllData}
            title="Clear all stored data to 0"
          >
            <Trash2 size={14} /> Clear All Data
          </button>
          <button type="button" className="action-btn-secondary" onClick={() => onExport("all")}>
            <Download size={14} /> CSV Export
          </button>
          <button type="button" className="action-btn-secondary" onClick={() => onExport("all")}>
            <FileSpreadsheet size={14} /> Excel Export
          </button>
        </div>
      </div>

      {/* 6 PRIMARY METRIC CARDS (EXACT SPECIFICATION) */}
      <div className="overview-spec-grid">
        {/* Visitors */}
        <div className="spec-metric-card" onClick={() => onNavigate("traffic")}>
          <div className="card-sub-header">
            <span className="metric-title">Visitors</span>
            <Users size={16} className="text-muted" />
          </div>
          <div className="metric-large-number">{metrics.visitors.toLocaleString()}</div>
          <div className="metric-pct positive">
            <TrendingUp size={13} /> +{metrics.visitorsChangePct}%
          </div>
          <div className="metric-meta-row">
            <span>{metrics.uniqueVisitors.toLocaleString()} unique visitors</span>
            <span>·</span>
            <span>{metrics.pageViews.toLocaleString()} page views</span>
          </div>
        </div>

        {/* Table Bookings */}
        <div className="spec-metric-card" onClick={() => onNavigate("bookings")}>
          <div className="card-sub-header">
            <span className="metric-title">Table Bookings</span>
            <Calendar size={16} className="text-muted" />
          </div>
          <div className="metric-large-number">{metrics.bookings}</div>
          <div className="metric-pct positive">
            <TrendingUp size={13} /> +{metrics.bookingsChangePct}%
          </div>
          <div className="metric-meta-row">
            <span>Conv. Rate: {metrics.conversionRate}%</span>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="spec-metric-card" onClick={() => onNavigate("whatsapp")}>
          <div className="card-sub-header">
            <span className="metric-title">WhatsApp</span>
            <MessageCircle size={16} className="text-muted" />
          </div>
          <div className="metric-large-number">{metrics.whatsapp}</div>
          <div className="metric-pct positive">
            <TrendingUp size={13} /> +{metrics.whatsappChangePct}%
          </div>
          <div className="metric-meta-row">
            <span>Direct chat inquiries</span>
          </div>
        </div>

        {/* Forms */}
        <div className="spec-metric-card" onClick={() => onNavigate("forms")}>
          <div className="card-sub-header">
            <span className="metric-title">Forms</span>
            <FileText size={16} className="text-muted" />
          </div>
          <div className="metric-large-number">{metrics.forms}</div>
          <div className="metric-pct positive">
            <TrendingUp size={13} /> +{metrics.formsChangePct}%
          </div>
          <div className="metric-meta-row">
            <span>Inquiries & contact submissions</span>
          </div>
        </div>

        {/* Phone Clicks */}
        <div className="spec-metric-card" onClick={() => onNavigate("phone")}>
          <div className="card-sub-header">
            <span className="metric-title">Phone Clicks</span>
            <PhoneCall size={16} className="text-muted" />
          </div>
          <div className="metric-large-number">{metrics.phone}</div>
          <div className="metric-pct positive">
            <TrendingUp size={13} /> +{metrics.phoneChangePct}%
          </div>
          <div className="metric-meta-row">
            <span>Calls initiated from website</span>
          </div>
        </div>

        {/* Directions */}
        <div className="spec-metric-card" onClick={() => onNavigate("directions")}>
          <div className="card-sub-header">
            <span className="metric-title">Directions</span>
            <Navigation size={16} className="text-muted" />
          </div>
          <div className="metric-large-number">{metrics.directions}</div>
          <div className="metric-pct positive">
            <TrendingUp size={13} /> +{metrics.directionsChangePct}%
          </div>
          <div className="metric-meta-row">
            <span>Google Maps navigation clicks</span>
          </div>
        </div>
      </div>

      {/* ORDERS & KITCHEN FAST TRACK BANNER */}
      <div
        className="orders-overview-banner"
        onClick={() => onNavigate("orders")}
        style={{ cursor: "pointer" }}
      >
        <div className="banner-icon-side">
          <ShoppingBag size={24} />
        </div>
        <div className="banner-content-side">
          <div className="banner-top-line">
            <span className="banner-kicker">CUSTOMER ORDERS & KITCHEN FULFILLMENT</span>
            <span className="live-dot-tag">
              <span className="pulse-dot" /> Live Pipeline
            </span>
          </div>
          <h4>Real-Time Customer Orders & Itemized Receipts</h4>
          <p>
            Inspect incoming orders, advance kitchen prep status, receipt breakdowns, and customer
            notes.
          </p>
        </div>
        <button
          type="button"
          className="btn-banner-action"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("orders");
          }}
        >
          <span>View Orders & Receipts</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* WEBSITE ACTIVITY — LAST 30 DAYS (CHART AREA) */}
      <div className="dash-card activity-chart-card">
        <div className="card-heading">
          <div>
            <h3>WEBSITE ACTIVITY — LAST 30 DAYS</h3>
            <p>Daily visitors, daily bookings, and daily leads</p>
          </div>
          <div className="chart-legend-pills">
            <button
              type="button"
              className={`legend-pill ${activeChartMetric === "all" ? "active" : ""}`}
              onClick={() => setActiveChartMetric("all")}
            >
              All Metrics
            </button>
            <button
              type="button"
              className={`legend-pill visitors ${activeChartMetric === "visitors" ? "active" : ""}`}
              onClick={() => setActiveChartMetric("visitors")}
            >
              <span className="dot visitors-dot" /> Daily Visitors
            </button>
            <button
              type="button"
              className={`legend-pill bookings ${activeChartMetric === "bookings" ? "active" : ""}`}
              onClick={() => setActiveChartMetric("bookings")}
            >
              <span className="dot bookings-dot" /> Daily Bookings
            </button>
            <button
              type="button"
              className={`legend-pill leads ${activeChartMetric === "leads" ? "active" : ""}`}
              onClick={() => setActiveChartMetric("leads")}
            >
              <span className="dot leads-dot" /> Daily Leads
            </button>
          </div>
        </div>

        {/* Visual Bar / Trend Chart Area */}
        <div className="activity-chart-container">
          <div className="chart-bars-wrap">
            {chartData.map((pt, idx) => {
              const maxVisitors = Math.max(1, ...chartData.map((c) => c.visitors));
              const heightPct = Math.min(100, Math.max(8, (pt.visitors / maxVisitors) * 100));

              return (
                <div
                  key={pt.date}
                  className="chart-bar-column"
                  title={`${pt.dayLabel}: ${pt.visitors} visitors, ${pt.bookings} bookings, ${pt.leads} leads`}
                >
                  <div className="column-bar-group">
                    {(activeChartMetric === "all" || activeChartMetric === "visitors") && (
                      <div className="bar-segment visitors" style={{ height: `${heightPct}%` }} />
                    )}
                    {(activeChartMetric === "all" || activeChartMetric === "bookings") && (
                      <div
                        className="bar-segment bookings"
                        style={{ height: `${Math.min(100, pt.bookings * 15 + 10)}%` }}
                      />
                    )}
                    {(activeChartMetric === "all" || activeChartMetric === "leads") && (
                      <div
                        className="bar-segment leads"
                        style={{ height: `${Math.min(100, pt.leads * 8 + 8)}%` }}
                      />
                    )}
                  </div>
                  {idx % 4 === 0 && <span className="bar-date-label">{pt.dayLabel}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY (EXACT SPECIFICATION) */}
      <div className="dash-card recent-activity-card">
        <div className="card-heading">
          <div>
            <h3>RECENT ACTIVITY</h3>
            <p>Live stream of visitors, WhatsApp clicks, bookings, forms, and phone clicks.</p>
          </div>
          <span className="live-status-tag">
            <span className="pulse-dot" /> Live
          </span>
        </div>

        <div className="table-responsive-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: "130px" }}>Time</th>
                <th style={{ width: "200px" }}>Activity</th>
                <th>Details</th>
                <th style={{ width: "140px" }}>Device</th>
                <th style={{ width: "160px" }}>Traffic Source</th>
              </tr>
            </thead>
            <tbody>
              {recentFeed.map((item) => (
                <tr key={item.id} className="recent-activity-row">
                  <td className="time-cell">
                    <Clock size={12} className="inline-icon" />
                    <strong>{item.time}</strong>
                  </td>
                  <td>
                    <span className={`activity-pill ${item.type}`}>
                      {item.type === "whatsapp_click" && <MessageCircle size={12} />}
                      {item.type === "booking_submitted" && <Calendar size={12} />}
                      {item.type === "form_submitted" && <FileText size={12} />}
                      {item.type === "page_view" && <Globe size={12} />}
                      {item.type === "phone_click" && <PhoneCall size={12} />}
                      {item.type === "direction_click" && <Navigation size={12} />}
                      <span>{item.activity}</span>
                    </span>
                  </td>
                  <td className="details-cell">
                    <span>{item.details}</span>
                  </td>
                  <td>
                    <span className="device-chip">
                      {item.device === "Mobile" ? <Smartphone size={11} /> : <Users size={11} />}
                      {item.device}
                    </span>
                  </td>
                  <td>
                    <span className="source-tag">{item.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. CUSTOMER ORDERS & ORDER DETAILS INSPECTION
// ==========================================
function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function exportOrdersCSV(ordersList: CafeOrder[]) {
  const headers = [
    "Order ID",
    "Customer Name",
    "Phone",
    "Email",
    "Order Type",
    "Table",
    "Items Summary",
    "Subtotal ($)",
    "Tax ($)",
    "Tip ($)",
    "Total ($)",
    "Payment Status",
    "Payment Method",
    "Order Status",
    "Special Instructions",
    "Created Date/Time",
  ];
  const rows = ordersList.map((o) => [
    o.id,
    `"${o.customerName.replace(/"/g, '""')}"`,
    `"${o.customerPhone}"`,
    `"${o.customerEmail}"`,
    `"${o.orderType}"`,
    `"${o.tableNumber || "N/A"}"`,
    `"${o.items.map((i) => `${i.quantity}x ${i.name}`).join("; ").replace(/"/g, '""')}"`,
    o.subtotal.toFixed(2),
    o.tax.toFixed(2),
    (o.tip || 0).toFixed(2),
    o.total.toFixed(2),
    o.paymentStatus,
    `"${o.paymentMethod}"`,
    o.orderStatus,
    `"${(o.specialInstructions || "").replace(/"/g, '""')}"`,
    new Date(o.createdAt).toISOString(),
  ]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `boreal-orders-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("Exported Orders to CSV!");
}

function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  onDelete,
}: {
  order: CafeOrder;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [currentOrder, setCurrentOrder] = useState<CafeOrder>(order);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const handleStatusSelect = (st: OrderStatus) => {
    updateCafeOrderStatus(currentOrder.id, st);
    setCurrentOrder((prev) => ({ ...prev, orderStatus: st }));
    onUpdateStatus(currentOrder.id, st);
    toast.success(`Order #${currentOrder.id} status updated to: ${st}`);
  };

  const handleAdvanceStatus = () => {
    let nextStatus: OrderStatus = currentOrder.orderStatus;
    if (currentOrder.orderStatus === "New") nextStatus = "Preparing";
    else if (currentOrder.orderStatus === "Preparing") nextStatus = "Ready for Pickup";
    else if (currentOrder.orderStatus === "Ready for Pickup") nextStatus = "Completed";

    if (nextStatus !== currentOrder.orderStatus) {
      handleStatusSelect(nextStatus);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentOrder.id);
    toast.success(`Order ID #${currentOrder.id} copied to clipboard!`);
  };

  const pipelineStages: { id: OrderStatus; label: string; icon: typeof Clock }[] = [
    { id: "New", label: "Order Received", icon: Clock },
    { id: "Preparing", label: "In Kitchen", icon: Coffee },
    { id: "Ready for Pickup", label: "Ready for Pickup", icon: CheckCircle2 },
    { id: "Completed", label: "Completed / Fulfilled", icon: Check },
  ];

  const getStepState = (stageId: OrderStatus) => {
    const orderIndex = pipelineStages.findIndex((s) => s.id === currentOrder.orderStatus);
    const thisIndex = pipelineStages.findIndex((s) => s.id === stageId);
    if (currentOrder.orderStatus === "Cancelled") return "cancelled";
    if (thisIndex < orderIndex) return "completed";
    if (thisIndex === orderIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal-dialog order-details-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="modal-top">
          <div className="order-modal-title-group">
            <div className="order-id-badge-row">
              <span className="order-tag-label">ORDER DETAILS</span>
              <span className="order-id-code">#{currentOrder.id}</span>
              <button
                type="button"
                className="copy-btn-mini"
                onClick={handleCopyId}
                title="Copy Order ID"
              >
                <Copy size={13} />
              </button>
            </div>
            <div className="order-meta-subtext">
              <span>Placed {formatRelativeTime(currentOrder.createdAt)}</span>
              <span>·</span>
              <span>
                {new Date(currentOrder.createdAt).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="order-modal-top-actions">
            <button
              type="button"
              className="action-btn-secondary print-ticket-btn"
              onClick={handlePrint}
              title="Print Order Receipt / Kitchen Ticket"
            >
              <Printer size={14} />
              <span>Print Ticket</span>
            </button>
            <button type="button" className="close-btn" onClick={onClose} title="Close Order Details">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Pipeline Lifecycle Progress */}
        <div className="order-pipeline-container">
          <div className="pipeline-steps-row">
            {pipelineStages.map((stage, idx) => {
              const state = getStepState(stage.id);
              const StageIcon = stage.icon;
              return (
                <div key={stage.id} className={`pipeline-step-item state-${state}`}>
                  <div className="step-circle">
                    <StageIcon size={14} />
                  </div>
                  <span className="step-label">{stage.label}</span>
                  {idx < pipelineStages.length - 1 && <div className="step-connector" />}
                </div>
              );
            })}
          </div>

          {currentOrder.orderStatus !== "Completed" && currentOrder.orderStatus !== "Cancelled" && (
            <div className="pipeline-action-bar">
              <span className="pipeline-hint">
                Current State: <strong>{currentOrder.orderStatus}</strong>
              </span>
              <button
                type="button"
                className="btn-advance-pipeline"
                onClick={handleAdvanceStatus}
              >
                {currentOrder.orderStatus === "New" && (
                  <>
                    <Coffee size={14} /> Send to Kitchen (Mark Preparing)
                  </>
                )}
                {currentOrder.orderStatus === "Preparing" && (
                  <>
                    <CheckCircle2 size={14} /> Mark Ready for Customer / Table
                  </>
                )}
                {currentOrder.orderStatus === "Ready for Pickup" && (
                  <>
                    <Check size={14} /> Mark Order Fulfilled / Handed Over
                  </>
                )}
              </button>
            </div>
          )}

          {currentOrder.orderStatus === "Cancelled" && (
            <div className="order-cancelled-admin-banner">
              <div className="cancelled-banner-icon">
                <AlertCircle size={20} />
              </div>
              <div className="cancelled-banner-content">
                <div className="cancelled-banner-title">
                  ORDER CANCELLED {currentOrder.cancelledReason?.includes("1-minute") ? "— CUSTOMER 1-MIN WINDOW" : ""}
                </div>
                <div className="cancelled-banner-sub">
                  Reason: <strong>{currentOrder.cancelledReason || "Cancelled by customer within 1-minute window."}</strong>
                  {currentOrder.cancelledAt && (
                    <span> • Cancelled {formatRelativeTime(currentOrder.cancelledAt)}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Dossier & Receipt Content */}
        <div className="order-details-grid">
          {/* Left Column: Customer & Service Profile */}
          <div className="order-info-column">
            {/* Customer Details Box */}
            <div className="detail-card">
              <div className="detail-card-header">
                <User size={15} />
                <h4>Customer Profile</h4>
              </div>
              <div className="detail-info-list">
                <div className="info-row">
                  <span className="label">Customer Name:</span>
                  <strong className="value highlighted-name">{currentOrder.customerName}</strong>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <a href={`tel:${currentOrder.customerPhone}`} className="value link-val">
                    <Phone size={13} /> {currentOrder.customerPhone}
                  </a>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <a href={`mailto:${currentOrder.customerEmail}`} className="value link-val">
                    <Mail size={13} /> {currentOrder.customerEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Service & Fulfillment Box */}
            <div className="detail-card">
              <div className="detail-card-header">
                <UtensilsCrossed size={15} />
                <h4>Fulfillment & Service</h4>
              </div>
              <div className="detail-info-list">
                <div className="info-row">
                  <span className="label">Order Type:</span>
                  <span className={`order-type-chip type-${currentOrder.orderType.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
                    {currentOrder.orderType}
                  </span>
                </div>
                {currentOrder.tableNumber && (
                  <div className="info-row">
                    <span className="label">Table Assigned:</span>
                    <strong className="value table-tag">{currentOrder.tableNumber}</strong>
                  </div>
                )}
                {currentOrder.estimatedReadyMinutes && (
                  <div className="info-row">
                    <span className="label">Est. Preparation Time:</span>
                    <span className="value">~{currentOrder.estimatedReadyMinutes} minutes</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Kitchen Ticket Status:</span>
                  <select
                    className={`status-select order-status-select status-${currentOrder.orderStatus.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    value={currentOrder.orderStatus}
                    onChange={(e) => handleStatusSelect(e.target.value as OrderStatus)}
                  >
                    <option value="New">New</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kitchen Instructions & Special Requests */}
            <div className="detail-card instructions-card">
              <div className="detail-card-header">
                <MessageSquare size={15} />
                <h4>Kitchen Notes & Special Instructions</h4>
              </div>
              <div className="instructions-body">
                {currentOrder.specialInstructions ? (
                  <blockquote className="special-instructions-quote">
                    "{currentOrder.specialInstructions}"
                  </blockquote>
                ) : (
                  <span className="empty-instructions-text">No special instructions entered for this order.</span>
                )}
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="detail-card payment-summary-card">
              <div className="detail-card-header">
                <CreditCard size={15} />
                <h4>Payment Dossier</h4>
              </div>
              <div className="detail-info-list">
                <div className="info-row">
                  <span className="label">Payment Status:</span>
                  <span className={`payment-status-tag ${currentOrder.paymentStatus.toLowerCase()}`}>
                    {currentOrder.paymentStatus === "Paid" && <CheckCircle2 size={12} />}
                    {currentOrder.paymentStatus}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Payment Method:</span>
                  <strong className="value">{currentOrder.paymentMethod}</strong>
                </div>
                <div className="info-row">
                  <span className="label">Total Charged:</span>
                  <strong className="value font-price">${currentOrder.total.toFixed(2)} CAD</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Artisanal Receipt Ticket */}
          <div className="order-receipt-column">
            <div className="order-receipt-card printable-ticket">
              {/* Receipt Header */}
              <div className="receipt-header">
                <div className="receipt-brand-badge">B</div>
                <h3 className="receipt-cafe-name">BOREAL CAFÉ</h3>
                <p className="receipt-tagline">ARTISANAL COFFEE & BAKEHOUSE</p>
                <div className="receipt-address">
                  <span>351 Water St, St. John's, NL A1C 1C2</span>
                  <span>Tel: +1 709-552-4809 • contact@borealcafe.ca</span>
                </div>
                <div className="receipt-divider-dashed" />
                <div className="receipt-meta-grid">
                  <div>
                    <span className="rm-label">TICKET:</span>
                    <strong className="rm-val">#{currentOrder.id}</strong>
                  </div>
                  <div>
                    <span className="rm-label">SERVER:</span>
                    <strong className="rm-val">Counter POS</strong>
                  </div>
                  <div>
                    <span className="rm-label">TYPE:</span>
                    <strong className="rm-val">{currentOrder.orderType}</strong>
                  </div>
                  {currentOrder.tableNumber && (
                    <div>
                      <span className="rm-label">TABLE:</span>
                      <strong className="rm-val">{currentOrder.tableNumber}</strong>
                    </div>
                  )}
                </div>
                <div className="receipt-divider-dashed" />
              </div>

              {/* Line Items Table */}
              <div className="receipt-items-container">
                <table className="receipt-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: "45px" }}>QTY</th>
                      <th>ITEM & MODIFIERS</th>
                      <th style={{ textAlign: "right", width: "65px" }}>EACH</th>
                      <th style={{ textAlign: "right", width: "75px" }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrder.items.map((item) => (
                      <tr key={item.id} className="receipt-item-row">
                        <td className="receipt-qty-cell">{item.quantity}x</td>
                        <td className="receipt-name-cell">
                          <span className="item-name">{item.name}</span>
                          {item.customization && (
                            <span className="item-modifier">▸ {item.customization}</span>
                          )}
                        </td>
                        <td className="receipt-unit-cell">${item.unitPrice.toFixed(2)}</td>
                        <td className="receipt-total-cell">${item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="receipt-divider-dashed" />

              {/* Financial Calculations Breakdown */}
              <div className="receipt-totals-section">
                <div className="receipt-calc-row">
                  <span>Subtotal:</span>
                  <strong>${currentOrder.subtotal.toFixed(2)}</strong>
                </div>
                <div className="receipt-calc-row">
                  <span>NL Harmonized Sales Tax (HST 15%):</span>
                  <strong>${currentOrder.tax.toFixed(2)}</strong>
                </div>
                {currentOrder.tip !== undefined && currentOrder.tip > 0 && (
                  <div className="receipt-calc-row">
                    <span>Staff Gratuity / Tip:</span>
                    <strong>${currentOrder.tip.toFixed(2)}</strong>
                  </div>
                )}
                <div className="receipt-divider-double" />
                <div className="receipt-grand-total-row">
                  <span className="grand-label">TOTAL CAD</span>
                  <span className="grand-amount">${currentOrder.total.toFixed(2)}</span>
                </div>
                <div className="receipt-payment-verified">
                  <span>PAID VIA {currentOrder.paymentMethod.toUpperCase()}</span>
                  <span className="auth-code">AUTH: APPROVED • THANK YOU!</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="receipt-footer-strip">
                <div className="receipt-fake-barcode">
                  || | ||| | |||| | || | ||| || |||| | |||
                </div>
                <p className="receipt-footer-quote">
                  "Freshly roasted on the edge of the Atlantic."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="modal-actions order-modal-footer">
          <button
            type="button"
            className="action-btn-danger"
            onClick={() => {
              if (confirm(`Delete Order #${currentOrder.id}? This cannot be undone.`)) {
                onDelete(currentOrder.id);
                onClose();
              }
            }}
            title="Delete this order"
          >
            <Trash2 size={14} /> Delete Order
          </button>

          <div style={{ flex: 1 }} />

          <button type="button" className="btn-cancel" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}

function AddOrderModal({ onClose }: { onClose: () => void }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Dine-in");
  const [tableNumber, setTableNumber] = useState("Table 1");
  const [paymentMethod, setPaymentMethod] = useState<CafeOrder["paymentMethod"]>(
    "Credit / Debit (Square)",
  );
  const [specialInstructions, setSpecialInstructions] = useState("");

  const menuOptions = [
    { name: "Harbour Fog Tea Latte", price: 5.95 },
    { name: "Caffè Latte", price: 5.25 },
    { name: "Cappuccino", price: 4.95 },
    { name: "Iced Latte", price: 5.75 },
    { name: "Nordic Pour-Over Single Origin", price: 6.0 },
    { name: "Butter Pecan Scone", price: 4.5 },
    { name: "Wild Blueberry Streusel Scone", price: 4.5 },
    { name: "Traditional Date Square", price: 4.75 },
    { name: "Partridgeberry Tart", price: 5.25 },
  ];

  const [selectedItems, setSelectedItems] = useState<
    { name: string; price: number; quantity: number; customization?: string }[]
  >([
    {
      name: "Harbour Fog Tea Latte",
      price: 5.95,
      quantity: 1,
      customization: "Steamed oat milk",
    },
  ]);

  const handleAddItem = (item: { name: string; price: number }) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setSelectedItems((prev) => {
      return prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const handleUpdateCustomization = (index: number, val: string) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, customization: val } : item)),
    );
  };

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [selectedItems]);

  const tax = Number((subtotal * 0.15).toFixed(2));
  const [tipAmount, setTipAmount] = useState<number>(2.0);
  const total = Number((subtotal + tax + tipAmount).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      toast.error("Please enter customer name and phone.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item to the order.");
      return;
    }

    const orderItems: OrderItem[] = selectedItems.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: Number((item.price * item.quantity).toFixed(2)),
      customization: item.customization,
    }));

    saveCafeOrder({
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || "guest@borealcafe.ca",
      orderType,
      tableNumber: orderType === "Dine-in" ? tableNumber : undefined,
      items: orderItems,
      subtotal,
      tax,
      tip: tipAmount,
      total,
      paymentStatus: "Paid",
      paymentMethod,
      orderStatus: "New",
      specialInstructions: specialInstructions.trim() || undefined,
      estimatedReadyMinutes: 10,
    });

    toast.success("Order Created Successfully!", {
      description: `New order for ${customerName} added to kitchen pipeline.`,
    });
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "620px" }}
      >
        <div className="modal-top">
          <h3>Create New Customer Order</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="field">
              <label>Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Guest name"
                required
              />
            </div>
            <div className="field">
              <label>Contact Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 709-..."
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@example.com"
              />
            </div>
            <div className="field">
              <label>Service Type</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
              >
                <option value="Dine-in">Dine-in</option>
                <option value="Takeout / Counter">Takeout / Counter</option>
                <option value="Advance Pickup">Advance Pickup</option>
                <option value="Curbside">Curbside</option>
              </select>
            </div>
          </div>

          {orderType === "Dine-in" && (
            <div className="field">
              <label>Table Assignment</label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. Table 4 (Window)"
              />
            </div>
          )}

          {/* Quick Menu Picker */}
          <div className="field">
            <label>Add Menu Items</label>
            <div className="quick-item-picker-wrap">
              {menuOptions.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  className="quick-item-chip"
                  onClick={() => handleAddItem(opt)}
                >
                  <span>{opt.name}</span>
                  <span className="chip-price">${opt.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Items List */}
          <div className="field">
            <label>Selected Line Items ({selectedItems.length})</label>
            <div className="selected-items-box">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="selected-item-row">
                  <div className="item-qty-controls">
                    <button type="button" onClick={() => handleUpdateQty(idx, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => handleUpdateQty(idx, 1)}>
                      +
                    </button>
                  </div>
                  <div className="item-info">
                    <strong>{item.name}</strong>
                    <input
                      type="text"
                      placeholder="Customization (e.g. Oat milk, extra hot)"
                      value={item.customization || ""}
                      onChange={(e) => handleUpdateCustomization(idx, e.target.value)}
                      className="customization-mini-input"
                    />
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Kitchen Instructions */}
          <div className="field">
            <label>Kitchen Notes / Special Request</label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra hot, package securely, allergy note"
            />
          </div>

          {/* Financial summary */}
          <div className="order-create-summary-bar">
            <div className="summary-left">
              <span>Subtotal: ${subtotal.toFixed(2)}</span>
              <span>HST (15%): ${tax.toFixed(2)}</span>
              <span>
                Tip: $
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  style={{ width: "60px", padding: "2px 4px", marginLeft: "4px" }}
                />
              </span>
            </div>
            <div className="summary-right">
              <strong>Grand Total: ${total.toFixed(2)} CAD</strong>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <ShoppingBag size={14} /> Place & Save Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrdersSection({ range }: { range: DateRange }) {
  const [orders, setOrders] = useState<CafeOrder[]>(getCafeOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<CafeOrder | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setOrders(getCafeOrders());
    window.addEventListener("boreal-store-updated", handleUpdate);
    return () => window.removeEventListener("boreal-store-updated", handleUpdate);
  }, []);

  // Filter orders by date range, status, type, and search query
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Date filter check
      const inRange = o.createdAt >= range.start && o.createdAt <= range.end;
      // Status filter check
      const matchStatus = statusFilter === "all" || o.orderStatus === statusFilter;
      // Type filter check
      const matchType = typeFilter === "all" || o.orderType === typeFilter;
      // Search check
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
        o.items.some((item) => item.name.toLowerCase().includes(q));

      return inRange && matchStatus && matchType && matchSearch;
    });
  }, [orders, range, statusFilter, typeFilter, search]);

  // Status counters
  const countNew = useMemo(() => orders.filter((o) => o.orderStatus === "New").length, [orders]);
  const countPreparing = useMemo(
    () => orders.filter((o) => o.orderStatus === "Preparing").length,
    [orders],
  );
  const countReady = useMemo(
    () => orders.filter((o) => o.orderStatus === "Ready for Pickup").length,
    [orders],
  );
  const countCompleted = useMemo(
    () => orders.filter((o) => o.orderStatus === "Completed").length,
    [orders],
  );
  const countCancelled = useMemo(
    () => orders.filter((o) => o.orderStatus === "Cancelled").length,
    [orders],
  );

  // Revenue computations
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Completed")
      .reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  const avgTicket = useMemo(() => {
    return filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
  }, [filteredOrders, totalRevenue]);

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    const updated = updateCafeOrderStatus(id, newStatus);
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
    }
  };

  const handleDelete = (id: string) => {
    const updated = deleteCafeOrder(id);
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(null);
    }
    toast.info(`Order #${id} has been removed.`);
  };

  const handleQuickAdvance = (o: CafeOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    let next: OrderStatus = o.orderStatus;
    if (o.orderStatus === "New") next = "Preparing";
    else if (o.orderStatus === "Preparing") next = "Ready for Pickup";
    else if (o.orderStatus === "Ready for Pickup") next = "Completed";

    if (next !== o.orderStatus) {
      handleStatusChange(o.id, next);
      toast.success(`Order #${o.id} advanced to: ${next}`);
    }
  };

  return (
    <div className="admin-view-section">
      {/* View Header */}
      <div className="view-header">
        <div>
          <h2>CUSTOMER ORDERS</h2>
          <p>Real-time order pipeline, itemized receipt tickets, and kitchen fulfillment details.</p>
        </div>
        <div className="header-actions-group">
          <button type="button" className="action-btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={15} /> + Create New Order
          </button>
          <button
            type="button"
            className="action-btn-secondary"
            onClick={() => exportOrdersCSV(filteredOrders)}
          >
            <Download size={14} /> Export Orders CSV
          </button>
        </div>
      </div>

      {/* 5 Order KPI Summary Cards */}
      <div className="orders-kpi-grid">
        <div className="orders-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Orders</span>
            <ShoppingBag size={16} className="text-muted" />
          </div>
          <div className="kpi-number">{filteredOrders.length}</div>
          <div className="kpi-sub">In selected date filter</div>
        </div>

        <div className="orders-kpi-card highlight-amber">
          <div className="kpi-top">
            <span className="kpi-title">In Kitchen Pipeline</span>
            <Coffee size={16} className="text-amber" />
          </div>
          <div className="kpi-number">{countNew + countPreparing}</div>
          <div className="kpi-sub">{countNew} New · {countPreparing} In Prep</div>
        </div>

        <div className="orders-kpi-card highlight-green">
          <div className="kpi-top">
            <span className="kpi-title">Ready for Pickup / Table</span>
            <CheckCircle2 size={16} className="text-green" />
          </div>
          <div className="kpi-number">{countReady}</div>
          <div className="kpi-sub">Awaiting customer collection</div>
        </div>

        <div className="orders-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Gross Order Revenue</span>
            <DollarSign size={16} className="text-muted" />
          </div>
          <div className="kpi-number">${totalRevenue.toFixed(2)}</div>
          <div className="kpi-sub">CAD incl. 15% HST & tips</div>
        </div>

        <div className="orders-kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Average Ticket Size</span>
            <Receipt size={16} className="text-muted" />
          </div>
          <div className="kpi-number">${avgTicket.toFixed(2)}</div>
          <div className="kpi-sub">Per order average</div>
        </div>
      </div>

      {/* Filter and Search Strip */}
      <div className="filter-search-strip">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID (ORD-9422), customer name, phone, item, table..."
          />
        </div>

        <div className="status-tabs-row">
          {[
            { id: "all", label: "All Orders", count: orders.length },
            { id: "New", label: "New", count: countNew },
            { id: "Preparing", label: "In Kitchen", count: countPreparing },
            { id: "Ready for Pickup", label: "Ready", count: countReady },
            { id: "Completed", label: "Completed", count: countCompleted },
            { id: "Cancelled", label: "Cancelled", count: countCancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`status-filter-btn ${statusFilter === tab.id ? "active" : ""}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="badge-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Order Type Selector */}
        <div className="type-filter-wrapper">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="type-filter-select"
          >
            <option value="all">All Service Types</option>
            <option value="Dine-in">Dine-in</option>
            <option value="Takeout / Counter">Takeout / Counter</option>
            <option value="Advance Pickup">Advance Pickup</option>
            <option value="Curbside">Curbside</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="table-responsive-container">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} />
            <p>No orders found matching this filter or date range.</p>
            <button
              type="button"
              className="action-btn-primary"
              style={{ marginTop: "0.5rem" }}
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={14} /> Create Order
            </button>
          </div>
        ) : (
          <table className="admin-data-table orders-data-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Order ID</th>
                <th>Customer</th>
                <th style={{ width: "160px" }}>Service / Table</th>
                <th>Items Ordered</th>
                <th style={{ width: "130px" }}>Total</th>
                <th style={{ width: "160px" }}>Status</th>
                <th style={{ width: "130px" }}>Placed</th>
                <th style={{ textAlign: "right", width: "170px" }}>Order Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  className={`order-table-row status-${o.orderStatus.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  onClick={() => setSelectedOrder(o)}
                  style={{ cursor: "pointer" }}
                  title="Click to view full Order Details & Receipt"
                >
                  <td>
                    <div className="order-id-cell">
                      <code className="id-code font-bold">#{o.id}</code>
                    </div>
                  </td>
                  <td>
                    <div className="order-customer-cell">
                      <strong className="customer-name">{o.customerName}</strong>
                      <span className="customer-phone-sub">{o.customerPhone}</span>
                      {o.orderStatus === "Cancelled" && (
                        <span className="order-cancelled-mini-badge">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="order-type-cell">
                      <span className={`order-type-badge type-${o.orderType.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
                        {o.orderType}
                      </span>
                      {o.tableNumber && (
                        <span className="order-table-tag">{o.tableNumber}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="order-items-snippet">
                      <span className="items-text">
                        {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </span>
                      {o.specialInstructions && (
                        <span className="order-note-indicator" title={o.specialInstructions}>
                          📝 Note: {o.specialInstructions}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="order-total-cell">
                      <strong className="order-price-bold">${o.total.toFixed(2)}</strong>
                      <span className={`payment-mini-tag ${o.paymentStatus.toLowerCase()}`}>
                        {o.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`status-select order-status-select status-${o.orderStatus.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                    >
                      <option value="New">New</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="order-time-cell">
                      <span className="relative-time">{formatRelativeTime(o.createdAt)}</span>
                      <span className="clock-time">
                        {new Date(o.createdAt).toLocaleTimeString("en-CA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <div className="order-actions-cell">
                      <button
                        type="button"
                        className="btn-view-details-primary"
                        onClick={() => setSelectedOrder(o)}
                        title="View Full Order Details & Receipt"
                      >
                        <Receipt size={13} />
                        <span>Details</span>
                      </button>

                      {o.orderStatus !== "Completed" && o.orderStatus !== "Cancelled" && (
                        <button
                          type="button"
                          className="btn-quick-next"
                          onClick={(e) => handleQuickAdvance(o, e)}
                          title={`Advance to ${o.orderStatus === "New" ? "Preparing" : o.orderStatus === "Preparing" ? "Ready" : "Completed"}`}
                        >
                          {o.orderStatus === "New" && "Prep ➔"}
                          {o.orderStatus === "Preparing" && "Ready ➔"}
                          {o.orderStatus === "Ready for Pickup" && "Done ✔"}
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => {
                          if (confirm(`Delete Order #${o.id}?`)) {
                            handleDelete(o.id);
                          }
                        }}
                        title="Delete Order"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Inspector Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      {/* Add Order Modal */}
      {isAddOpen && <AddOrderModal onClose={() => setIsAddOpen(false)} />}
    </div>
  );
}

// ==========================================
// 5. BOOKINGS SECTION (EXACT SPECIFICATION)
// ==========================================
function BookingsSection({
  range,
  onExport,
}: {
  range: DateRange;
  onExport: (type: "bookings" | "forms" | "events" | "all") => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const bookings = useMemo(() => {
    return getStoredBookings().filter(
      (b) => b.createdAt >= range.start && b.createdAt <= range.end,
    );
  }, [range]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.customerName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, search]);

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    updateBookingStatus(id, newStatus);
    toast.success(`Booking ${id} status set to: ${newStatus}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete booking for ${name}?`)) {
      deleteBooking(id);
      toast.info(`Booking deleted.`);
    }
  };

  return (
    <div className="admin-view-section">
      <div className="view-header">
        <div>
          <h2>BOOKING DATA</h2>
          <p>Real customer table reservations submitted via website and phone.</p>
        </div>
        <div className="header-actions-group">
          <button type="button" className="action-btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={15} /> + Add New Booking
          </button>
          <button
            type="button"
            className="action-btn-secondary"
            onClick={() => onExport("bookings")}
          >
            <Download size={14} /> Export Bookings CSV
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="filter-search-strip">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, email, booking ID..."
          />
        </div>

        <div className="status-tabs-row">
          {["all", "New", "Confirmed", "Completed", "Cancelled", "No Show"].map((st) => (
            <button
              key={st}
              type="button"
              className={`status-filter-btn ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === "all" ? "All Bookings" : st}
              {st !== "all" && (
                <span className="badge-count">
                  {bookings.filter((b) => b.status === st).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-responsive-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Calendar size={36} />
            <p>No bookings matching this filter in selected date range.</p>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Date & Time</th>
                <th>Guests</th>
                <th>Special Request</th>
                <th>Source</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className={`booking-row status-${b.status.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <td>
                    <code className="id-code">{b.id}</code>
                  </td>
                  <td>
                    <strong>{b.customerName}</strong>
                  </td>
                  <td>
                    <div className="contact-col">
                      <span>{b.phone}</span>
                      <a href={`mailto:${b.email}`} className="email-sub">
                        {b.email}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="timing-col">
                      <span className="date-tag">{b.date}</span>
                      <span className="time-tag">{b.time}</span>
                    </div>
                  </td>
                  <td>
                    <span className="guests-pill">{b.partySize}</span>
                  </td>
                  <td>
                    <span className="req-text">
                      {b.specialRequest ? `"${b.specialRequest}"` : "None"}
                    </span>
                  </td>
                  <td>
                    <span className="source-chip">{b.source}</span>
                  </td>
                  <td>
                    <select
                      className={`status-select ${b.status.toLowerCase().replace(/\s/g, "-")}`}
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                    >
                      <option value="New">New</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No Show">No Show</option>
                    </select>
                  </td>
                  <td>
                    <span className="created-text">
                      {new Date(b.createdAt).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => handleDelete(b.id, b.customerName)}
                      title="Delete Booking"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAddOpen && <AddBookingModal onClose={() => setIsAddOpen(false)} />}
    </div>
  );
}

function AddBookingModal({ onClose }: { onClose: () => void }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("10:30 AM");
  const [partySize, setPartySize] = useState("2 Guests");
  const [specialRequest, setSpecialRequest] = useState("");
  const [source, setSource] = useState("Walk-in / Phone");
  const [status, setStatus] = useState<BookingStatus>("Confirmed");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      toast.error("Please enter guest name and contact phone.");
      return;
    }

    trackBooking({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim() || "guest@borealcafe.ca",
      date,
      time,
      partySize,
      specialRequest: specialRequest.trim(),
      source,
      status,
    });

    toast.success("New table booking added successfully!");
    onClose();
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <h3>+ Add Table Booking</h3>
          <button type="button" onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="field">
              <label>Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>
            <div className="field">
              <label>Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 709-555-0123"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@example.com"
              />
            </div>
            <div className="field">
              <label>Party Size (Number of Guests)</label>
              <select value={partySize} onChange={(e) => setPartySize(e.target.value)}>
                <option value="1 Guest">1 Guest</option>
                <option value="2 Guests">2 Guests</option>
                <option value="3-4 Guests">3-4 Guests</option>
                <option value="5+ Group">5+ Group</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Today / YYYY-MM-DD"
              />
            </div>
            <div className="field">
              <label>Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Booking Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="Website Modal">Website Modal</option>
                <option value="Mobile Website">Mobile Website</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>
            <div className="field">
              <label>Initial Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
                <option value="New">New</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No Show">No Show</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Special Request</label>
            <textarea
              rows={2}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Window seating, power outlet, birthday, etc."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 5. FORM DATA SECTION (EXACT SPECIFICATION)
// ==========================================
function FormsSection({
  range,
  onExport,
}: {
  range: DateRange;
  onExport: (type: "bookings" | "forms" | "events" | "all") => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const forms = useMemo(() => {
    return getStoredForms().filter((f) => f.createdAt >= range.start && f.createdAt <= range.end);
  }, [range]);

  const filtered = useMemo(() => {
    return forms.filter((f) => {
      const matchStatus = statusFilter === "all" || f.status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.message.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [forms, statusFilter, search]);

  const handleStatusChange = (id: string, newStatus: FormStatus) => {
    updateFormStatus(id, newStatus);
    toast.success(`Form status updated to: ${newStatus}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this form record?")) {
      deleteForm(id);
      toast.info("Form record deleted.");
    }
  };

  return (
    <div className="admin-view-section">
      <div className="view-header">
        <div>
          <h2>FORM DATA</h2>
          <p>Real customer contact submissions, catering inquiries, and message leads.</p>
        </div>
        <div className="header-actions-group">
          <button type="button" className="action-btn-secondary" onClick={() => onExport("forms")}>
            <Download size={14} /> Export Forms CSV
          </button>
        </div>
      </div>

      <div className="filter-search-strip">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, message..."
          />
        </div>

        <div className="status-tabs-row">
          {["all", "New", "Contacted", "Converted", "Closed"].map((st) => (
            <button
              key={st}
              type="button"
              className={`status-filter-btn ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === "all" ? "All Forms" : st}
              {st !== "all" && (
                <span className="badge-count">{forms.filter((f) => f.status === st).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="table-responsive-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={36} />
            <p>No form submissions under this filter in selected date range.</p>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Message</th>
                <th>Form Name</th>
                <th>Page</th>
                <th>Date / Time</th>
                <th>Source</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const replySubject = `Re: ${f.formName} - Boreal Café Water St`;
                const replyBody = `Hello ${f.name},\n\nThank you for reaching out to Boreal Café.\n\nRegarding your message:\n"${f.message}"\n\nWarm regards,\nBoreal Café Team\n351 Water St, St. John's, NL`;
                const mailto = `mailto:${f.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
                const waUrl = f.phone
                  ? `https://wa.me/${f.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${f.name}, following up from Boreal Café regarding your message!`)}`
                  : null;

                return (
                  <tr key={f.id} className={`form-row status-${f.status.toLowerCase()}`}>
                    <td>
                      <strong>{f.name}</strong>
                    </td>
                    <td>
                      <div className="contact-col">
                        <span>{f.phone || "No phone"}</span>
                        <a href={`mailto:${f.email}`} className="email-sub">
                          {f.email}
                        </a>
                      </div>
                    </td>
                    <td style={{ maxWidth: "260px" }}>
                      <p className="form-msg-text">"{f.message}"</p>
                    </td>
                    <td>
                      <span className="form-name-badge">{f.formName}</span>
                    </td>
                    <td>
                      <code className="page-code">{f.page}</code>
                    </td>
                    <td>
                      <span className="created-text">
                        {new Date(f.createdAt).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td>
                      <span className="source-chip">{f.source}</span>
                    </td>
                    <td>
                      <select
                        className={`status-select ${f.status.toLowerCase()}`}
                        value={f.status}
                        onChange={(e) => handleStatusChange(f.id, e.target.value as FormStatus)}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="action-buttons-cell">
                        <a
                          href={mailto}
                          className="btn-tiny save"
                          title="Reply via Email"
                          onClick={() => handleStatusChange(f.id, "Contacted")}
                        >
                          <Mail size={12} />
                        </a>
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-tiny save"
                            style={{ background: "#25D366" }}
                            title="Chat on WhatsApp"
                            onClick={() => handleStatusChange(f.id, "Contacted")}
                          >
                            <MessageCircle size={12} />
                          </a>
                        )}
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => handleDelete(f.id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 6. WHATSAPP TRACKING SECTION
// ==========================================
function WhatsAppSection() {
  const metrics: ClickMetrics = useMemo(() => {
    return getChannelClickMetrics("whatsapp_click");
  }, []);

  return (
    <div className="admin-view-section">
      <div className="view-header">
        <div>
          <h2>WHATSAPP TRACKING</h2>
          <p>Real-time tracked clicks on all WhatsApp buttons and floating actions.</p>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total WhatsApp Clicks</span>
            <div className="kpi-icon-wrap emerald">
              <MessageCircle size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.total}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks Today</span>
            <div className="kpi-icon-wrap warm">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.today}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks This Week</span>
            <div className="kpi-icon-wrap blue">
              <Calendar size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.thisWeek}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks This Month</span>
            <div className="kpi-icon-wrap purple">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.thisMonth}</div>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="breakdowns-three-grid">
        {/* Clicks By Page */}
        <div className="dash-card">
          <div className="card-heading">
            <h4>Clicks By Page</h4>
          </div>
          <div className="breakdown-list">
            {metrics.byPage.map((p) => (
              <div key={p.page} className="breakdown-item">
                <span className="breakdown-name">{p.page || "/"}</span>
                <span className="breakdown-count">{p.count} clicks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clicks By Device */}
        <div className="dash-card">
          <div className="card-heading">
            <h4>Clicks By Device</h4>
          </div>
          <div className="breakdown-list">
            {metrics.byDevice.map((d) => (
              <div key={d.device} className="breakdown-item">
                <span className="breakdown-name">{d.device}</span>
                <span className="breakdown-count">{d.count} clicks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clicks By Traffic Source */}
        <div className="dash-card">
          <div className="card-heading">
            <h4>Clicks By Traffic Source</h4>
          </div>
          <div className="breakdown-list">
            {metrics.bySource.map((s) => (
              <div key={s.source} className="breakdown-item">
                <span className="breakdown-name">{s.source}</span>
                <span className="breakdown-count">{s.count} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WhatsApp Click Log */}
      <div className="dash-card">
        <div className="card-heading">
          <h4>Recent WhatsApp Click Logs</h4>
          <span className="badge-soft">{metrics.logs.length} logged events</span>
        </div>
        <div className="table-responsive-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Page</th>
                <th>Device</th>
                <th>Traffic Source</th>
              </tr>
            </thead>
            <tbody>
              {metrics.logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(log.timestamp).toLocaleTimeString("en-CA", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td>
                    <code>{log.page}</code>
                  </td>
                  <td>
                    <span className="device-chip">{log.device}</span>
                  </td>
                  <td>
                    <span className="source-tag">{log.trafficSource}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. PHONE CLICK TRACKING SECTION
// ==========================================
function PhoneTrackingSection() {
  const metrics: ClickMetrics = useMemo(() => {
    return getChannelClickMetrics("phone_click");
  }, []);

  return (
    <div className="admin-view-section">
      <div className="view-header">
        <div>
          <h2>PHONE CLICK TRACKING</h2>
          <p>Real-time tracked calls initiated from phone numbers on the website.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Phone Clicks</span>
            <div className="kpi-icon-wrap warm">
              <PhoneCall size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.total}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks Today</span>
            <div className="kpi-icon-wrap emerald">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.today}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks This Week</span>
            <div className="kpi-icon-wrap blue">
              <Calendar size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.thisWeek}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks This Month</span>
            <div className="kpi-icon-wrap purple">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.thisMonth}</div>
        </div>
      </div>

      <div className="dash-card">
        <div className="card-heading">
          <h4>Phone Clicks Log Table</h4>
          <span className="badge-soft">Date / Time • Page • Device • Traffic Source</span>
        </div>
        <div className="table-responsive-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Page</th>
                <th>Device</th>
                <th>Traffic Source</th>
              </tr>
            </thead>
            <tbody>
              {metrics.logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(log.timestamp).toLocaleTimeString("en-CA", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td>
                    <code>{log.page}</code>
                  </td>
                  <td>
                    <span className="device-chip">{log.device}</span>
                  </td>
                  <td>
                    <span className="source-tag">{log.trafficSource}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. DIRECTION / MAP TRACKING SECTION
// ==========================================
function DirectionsTrackingSection() {
  const metrics: ClickMetrics = useMemo(() => {
    return getChannelClickMetrics("direction_click");
  }, []);

  return (
    <div className="admin-view-section">
      <div className="view-header">
        <div>
          <h2>DIRECTION / MAP TRACKING</h2>
          <p>Real-time tracked Google Maps and navigation directions requests.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Direction Clicks</span>
            <div className="kpi-icon-wrap blue">
              <Navigation size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.total}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks Today</span>
            <div className="kpi-icon-wrap emerald">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.today}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks This Week</span>
            <div className="kpi-icon-wrap warm">
              <Calendar size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.thisWeek}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Clicks This Month</span>
            <div className="kpi-icon-wrap purple">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics.thisMonth}</div>
        </div>
      </div>

      <div className="dash-card">
        <div className="card-heading">
          <h4>Direction Clicks Log Table</h4>
          <span className="badge-soft">Date / Time • Page • Device • Traffic Source</span>
        </div>
        <div className="table-responsive-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Page</th>
                <th>Device</th>
                <th>Traffic Source</th>
              </tr>
            </thead>
            <tbody>
              {metrics.logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(log.timestamp).toLocaleTimeString("en-CA", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td>
                    <code>{log.page}</code>
                  </td>
                  <td>
                    <span className="device-chip">{log.device}</span>
                  </td>
                  <td>
                    <span className="source-tag">{log.trafficSource}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. TRAFFIC SOURCES SECTION
// ==========================================
function TrafficSourcesSection({ range }: { range: DateRange }) {
  const sources: TrafficSourceMetric[] = useMemo(() => {
    return getTrafficSourcesReport(range);
  }, [range]);

  return (
    <div className="admin-view-section">
      <div className="view-header">
        <div>
          <h2>TRAFFIC SOURCES</h2>
          <p>
            Visitor acquisition channels: Google, Direct, Instagram, Facebook, WhatsApp, Other
            Websites, and UTM Campaigns.
          </p>
        </div>
      </div>

      <div className="dash-card">
        <div className="table-responsive-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Channel / Source</th>
                <th>Visits</th>
                <th>Traffic Share</th>
                <th>Table Bookings</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.source}>
                  <td>
                    <strong>{s.source}</strong>
                  </td>
                  <td>{s.visits.toLocaleString()}</td>
                  <td>
                    <div className="share-bar-cell">
                      <div className="share-track">
                        <div className="share-fill" style={{ width: `${s.percentage}%` }} />
                      </div>
                      <span>{s.percentage}%</span>
                    </div>
                  </td>
                  <td>{s.bookings}</td>
                  <td>
                    <span className="conv-badge">{s.conversionRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. CONVERSION FUNNEL SECTION
// ==========================================
function ConversionFunnelSection({ range }: { range: DateRange }) {
  const stages: FunnelStage[] = useMemo(() => {
    return getConversionFunnelReport(range);
  }, [range]);

  return (
    <div className="admin-view-section">
      <div className="view-header">
        <div>
          <h2>CONVERSION FUNNEL</h2>
          <p>
            Track progression: Website Visitors &rarr; Engaged Visitors &rarr; WhatsApp / Phone /
            Form Click &rarr; Leads &rarr; Table Booking &rarr; Completed Booking.
          </p>
        </div>
      </div>

      <div className="funnel-container">
        {stages.map((stage, idx) => (
          <div key={stage.name} className="funnel-stage-card">
            <div className="funnel-header">
              <span className="step-num">Step {stage.step}</span>
              <span className="funnel-name">{stage.name}</span>
            </div>
            <div className="funnel-count">{stage.count.toLocaleString()}</div>
            <div className="funnel-rates">
              <span>{stage.overallRate}% of all visitors</span>
              {idx > 0 && (
                <span className="prev-rate">{stage.rateFromPrevious}% retention from previous</span>
              )}
            </div>
            {idx < stages.length - 1 && <div className="funnel-arrow">&darr;</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 11. SECURITY & PASSWORD MANAGEMENT SECTION
// ==========================================
function SecuritySection({ session }: { session: AdminSession }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(session.username);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");

  const strength = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password to authorize changes.");
      return;
    }

    const res = updateAdminCredentials(currentPassword, newUsername, newPassword || undefined);
    if (res.success) {
      toast.success(res.message);
      setMsg(res.message);
      setCurrentPassword("");
      setNewPassword("");
    } else {
      toast.error(res.message);
      setMsg(`Error: ${res.message}`);
    }
  };

  const handleGen = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
    let gen = "Boreal_";
    for (let i = 0; i < 14; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    gen += "!";
    setNewPassword(gen);
    setShowPassword(true);
    toast.info("Generated high-entropy secure password!");
  };

  return (
    <div className="admin-view-section">
      <div className="view-header">
        <div>
          <h2>ADMIN & SECURITY SETTINGS</h2>
          <p>Manage administrator credentials, password strength, and dashboard access.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card security-highlight">
          <div className="card-top">
            <div className="title-with-icon">
              <ShieldCheck className="accent-icon" size={20} />
              <div>
                <h3>Admin Credentials & Password</h3>
                <p>Enforce strong passwords for admin dashboard access</p>
              </div>
            </div>
          </div>

          {msg && (
            <div
              className={`admin-alert-banner ${msg.startsWith("Error") ? "destructive" : "success"}`}
            >
              <span>{msg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="settings-form">
            <div className="field">
              <label>Current Admin Password *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="field">
              <label>Admin Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <div className="label-with-action">
                <label>New Strong Password</label>
                <button type="button" className="quick-gen-btn" onClick={handleGen}>
                  <Sparkles size={11} /> Generate Strong
                </button>
              </div>

              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty to keep unchanged"
                />
                <button
                  type="button"
                  className="pwd-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {newPassword && (
                <div className="strength-meter-container">
                  <div className="strength-label-row">
                    <span>Password Strength:</span>
                    <strong style={{ color: strength.color }}>{strength.label}</strong>
                  </div>
                  <div className="strength-bar-track">
                    <div
                      className="strength-bar-fill"
                      style={{
                        width: `${(strength.score / 4) * 100}%`,
                        backgroundColor: strength.color,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="action-btn-primary">
              <KeyRound size={15} /> Update Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
