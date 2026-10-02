import { Link, useRouterState } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Facebook,
  Instagram,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  ShoppingBag,
  User,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCafeSettings, saveReservation } from "@/lib/admin-store";
import { trackBooking } from "@/lib/tracker";
import { CartDrawer } from "./cart-drawer";
import { TrackOrderModal } from "./track-order-modal";
import { getCartTotals } from "@/lib/cart-store";

export const ADDRESS = "351 Water St, St. John's, NL A1C 1C2, Canada";
export const PHONE = "+1 709-552-4809";
export const EMAIL = "contact@borealcafe.ca";
export const DIRECTIONS_URL = "https://maps.app.goo.gl/Dy7x8SU218Y81TqQ8";

// Automatically open WhatsApp with pre-filled message ready to send from user
const WHATSAPP_MSG =
  "Hello Boreal Café! I would like to inquire about visiting / a table reservation.";
export const WHATSAPP_URL = `https://wa.me/17095524809?text=${encodeURIComponent(WHATSAPP_MSG)}`;

// Automatically open Email client with pre-filled subject and body
const EMAIL_SUBJECT = "Inquiry - Boreal Café (351 Water Street)";
const EMAIL_BODY =
  "Hello Boreal Café team,\n\nI would like to inquire about:\n- Date & Time:\n- Party Size:\n- Questions / Requests:\n\nThank you!";
export const EMAIL_URL = `mailto:${EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(EMAIL_BODY)}`;

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.04C9.36 7.04 9.09 7.1 8.87 7.34C8.64 7.58 8 8.18 8 9.4C8 10.62 8.89 11.79 9.01 11.96C9.14 12.12 10.73 14.58 13.18 15.64C13.76 15.89 14.21 16.04 14.57 16.15C15.16 16.34 15.69 16.31 16.12 16.25C16.6 16.18 17.59 15.65 17.8 15.06C18.01 14.47 18.01 13.97 17.94 13.86C17.88 13.75 17.72 13.69 17.47 13.56C17.22 13.44 16.01 12.84 15.79 12.76C15.56 12.68 15.4 12.64 15.23 12.88C15.06 13.13 14.58 13.69 14.44 13.86C14.29 14.02 14.15 14.04 13.9 13.92C13.65 13.79 12.6 13.45 11.36 12.35C10.4 11.49 9.75 10.43 9.62 10.21C9.5 9.99 9.61 9.87 9.73 9.75C9.84 9.64 9.98 9.46 10.1 9.32C10.22 9.18 10.26 9.08 10.34 8.92C10.42 8.76 10.38 8.62 10.32 8.5C10.26 8.38 9.76 7.17 9.53 7.04Z" />
    </svg>
  );
}

interface ReservationContextType {
  isOpen: boolean;
  openReservation: () => void;
  closeReservation: () => void;
}

const ReservationContext = createContext<ReservationContextType>({
  isOpen: false,
  openReservation: () => {},
  closeReservation: () => {},
});

export const useReservation = () => useContext(ReservationContext);

interface CartContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType>({
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  cartCount: 0,
});

export const useCart = () => useContext(CartContext);

interface TrackOrderContextType {
  isTrackOrderOpen: boolean;
  openTrackOrder: (initialOrderId?: string | undefined) => void;
  closeTrackOrder: () => void;
  trackedOrderId?: string | undefined;
}

const TrackOrderContext = createContext<TrackOrderContextType>({
  isTrackOrderOpen: false,
  openTrackOrder: () => {},
  closeTrackOrder: () => {},
  trackedOrderId: undefined,
});

export const useTrackOrder = () => useContext(TrackOrderContext);

const nav = [
  { label: "Home", to: "/" as const },
  { label: "Menu", to: "/menu" as const },
  { label: "About", to: "/about" as const },
  { label: "Gallery", to: "/gallery" as const },
  { label: "Visit Us", to: "/visit" as const },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { openReservation } = useReservation();
  const { openCart, cartCount } = useCart();
  const { openTrackOrder } = useTrackOrder();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [settings, setSettings] = useState(getCafeSettings);

  useEffect(() => {
    const handleUpdate = () => setSettings(getCafeSettings());
    window.addEventListener("boreal-store-updated", handleUpdate);
    return () => window.removeEventListener("boreal-store-updated", handleUpdate);
  }, []);

  return (
    <>
      {!settings.isOpen ? (
        <aside className="site-closed-strip" aria-label="Café Status">
          <div className="shell closed-inner">
            <span className="closed-status-pill">OFFLINE</span>
            <span className="closed-copy">
              Notice: Café is currently marked <strong>CLOSED / OFFLINE</strong> by staff. Advance
              reservation requests are recorded.
            </span>
          </div>
        </aside>
      ) : settings.specialNoticeEnabled && settings.specialNoticeText ? (
        <aside className="site-announcement-strip" aria-label="Café Announcement">
          <div className="shell announcement-inner">
            <span className="announcement-pill">{settings.announcementBadge || "Fresh Today"}</span>
            <span className="announcement-copy">{settings.specialNoticeText}</span>
            <Link to="/menu" className="announcement-link">
              Explore menu &rarr;
            </Link>
          </div>
        </aside>
      ) : null}
      <header className="site-header">
        <div className="shell header-inner">
          <Link to="/" className="brand" aria-label="Boreal Café home">
            <span className="brand-mark">B</span>
            <span>BOREAL CAFÉ</span>
            <span
              className={`storefront-status-dot ${settings.isOpen ? "is-open" : "is-closed"}`}
              title={settings.isOpen ? "Café is Open" : "Café is Closed"}
            >
              {settings.isOpen ? "OPEN" : "CLOSED"}
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={pathname === item.to ? "nav-link active" : "nav-link"}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {/* TRACK ORDER BUTTON (RIGHT SIDE ON TOP) */}
            <button
              type="button"
              onClick={() => openTrackOrder()}
              className="button button-track-header"
              title="Track order status or cancel within 1 minute"
              aria-label="Track Order"
            >
              <Compass size={14} />
              <span>Track Order</span>
            </button>
            <button
              type="button"
              onClick={openCart}
              className="button button-order-header"
              title="Open your café order bag"
              aria-label="Order Now"
            >
              <ShoppingBag size={15} />
              <span>Order Now</span>
              {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
            </button>
            <Link to="/menu" className="text-action">
              View menu
            </Link>
            <button
              type="button"
              onClick={openReservation}
              className="button button-secondary"
              style={{ padding: "0.6rem 0.95rem" }}
            >
              <Calendar size={14} /> Reserve
            </button>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-primary"
            >
              Get directions <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openTrackOrder();
              }}
              style={{
                textAlign: "left",
                background: "none",
                border: "none",
                padding: "0.85rem 0",
                font: "inherit",
                cursor: "pointer",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Compass size={18} /> Track or Cancel Order
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openReservation();
              }}
              style={{
                textAlign: "left",
                background: "none",
                border: "none",
                padding: "0.85rem 0",
                font: "inherit",
                cursor: "pointer",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Calendar size={18} /> Table Reservation
            </button>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>Call {PHONE}</a>
          </nav>
        )}
      </header>
    </>
  );
}

export function SiteFooter() {
  const { openReservation } = useReservation();

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">B</span>
            <span>BOREAL CAFÉ</span>
          </div>
          <p className="footer-note">Coffee, comfort, and good things on Water Street.</p>
        </div>
        <div>
          <p className="eyebrow">Find us</p>
          <address>
            351 Water St
            <br />
            St. John's, NL A1C 1C2
            <br />
            Canada
          </address>
          <a className="footer-link" href={`tel:${PHONE.replace(/\s/g, "")}`}>
            {PHONE}
          </a>
          <a className="footer-link" href={EMAIL_URL}>
            {EMAIL}
          </a>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <div className="footer-links">
            {nav.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">Come by & Contact</p>
          <div className="footer-actions">
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-light"
            >
              Get directions <ArrowUpRight size={16} />
            </a>
            <button type="button" onClick={openReservation} className="button button-reserve">
              <Calendar size={16} /> Table reservation
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-whatsapp"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon size={16} /> WhatsApp Us
            </a>
            <a href={EMAIL_URL} className="button button-email" aria-label="Send an Email">
              <Mail size={16} /> Email Us
            </a>
          </div>
          <div className="footer-social-wrap">
            <p className="eyebrow" style={{ marginTop: "1.75rem", marginBottom: "0.65rem" }}>
              Follow Us
            </p>
            <div className="footer-social-links">
              <a
                href="https://www.instagram.com/sidhu_moosewala/"
                target="_blank"
                rel="noreferrer"
                className="social-btn instagram"
                aria-label="Instagram @sidhu_moosewala"
              >
                <Instagram size={15} />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.youtube.com/@SidhuMooseWalaOfficial"
                target="_blank"
                rel="noreferrer"
                className="social-btn youtube"
                aria-label="YouTube @SidhuMooseWalaOfficial"
              >
                <Youtube size={15} />
                <span>YouTube</span>
              </a>
              <a
                href="https://www.facebook.com/SidhuMooseWala"
                target="_blank"
                rel="noreferrer"
                className="social-btn facebook"
                aria-label="Facebook @SidhuMooseWala"
              >
                <Facebook size={15} />
                <span>Facebook</span>
              </a>
            </div>
            <p className="social-handle-note">@sidhu moosewala</p>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <div className="footer-copyright">
          <span>© {new Date().getFullYear()} Boreal Café</span>
          <span>351 Water St, St. John's, NL</span>
          <span>Dine-in · Takeaway</span>
        </div>
        <nav className="footer-policy-links" aria-label="Policies and legal information">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/accessibility">Accessibility</Link>
          <Link
            to="/admin"
            className="staff-portal-link"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", opacity: 0.85 }}
          >
            <Lock size={12} /> Staff Portal
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function ReservationModal({ onClose }: { onClose: () => void }) {
  const [partySize, setPartySize] = useState("2 Guests");
  const [dateOption, setDateOption] = useState("Today");
  const [timeSlot, setTimeSlot] = useState("Morning Coffee (8am - 11am)");
  const [preference, setPreference] = useState("Cozy Window Table");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({});
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Strict validation rules
  const validateName = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return "Full name is required.";
    if (trimmed.length < 2) return "Name must be at least 2 characters.";
    if (!/^[a-zA-Z\s'.-]+$/.test(trimmed)) return "Please enter letters and spaces only.";
    return "";
  };

  const validateEmail = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return "Email address is required to receive confirmation.";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed))
      return "Please enter a valid email address (e.g. name@domain.com).";
    return "";
  };

  const validatePhone = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) return "Contact phone number is required.";
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 10) return "Please enter a valid phone number (at least 10 digits).";
    if (digits.length > 15) return "Phone number cannot exceed 15 digits.";
    return "";
  };

  const nameError = touched.name || submittedAttempt ? validateName(name) : "";
  const emailError = touched.email || submittedAttempt ? validateEmail(email) : "";
  const phoneError = touched.phone || submittedAttempt ? validatePhone(phone) : "";

  const isNameValid = name.trim().length >= 2 && !validateName(name);
  const isEmailValid = email.trim().length > 0 && !validateEmail(email);
  const isPhoneValid = phone.trim().length > 0 && !validatePhone(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAttempt(true);
    setTouched({ name: true, email: true, phone: true });

    const errName = validateName(name);
    const errEmail = validateEmail(email);
    const errPhone = validatePhone(phone);

    if (errName) {
      document.getElementById("res-name")?.focus();
      return;
    }
    if (errEmail) {
      document.getElementById("res-email")?.focus();
      return;
    }
    if (errPhone) {
      document.getElementById("res-phone")?.focus();
      return;
    }

    // Persist to Admin Operations Store
    saveReservation({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      partySize,
      dateOption,
      timeSlot,
      preference,
      notes: notes.trim(),
    });

    // Track real booking event in analytics engine
    trackBooking({
      customerName: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      partySize,
      date: dateOption,
      time: timeSlot,
      specialRequest: notes.trim(),
      source: "Website Modal",
      status: "New",
    });

    setConfirmed(true);
  };

  const prefilledWhatsApp = `Hello Boreal Café! I have submitted a table reservation:\n• Name: ${name.trim()}\n• Email: ${email.trim()}\n• Phone: ${phone.trim()}\n• Party Size: ${partySize}\n• Date: ${dateOption}\n• Time: ${timeSlot}\n• Seating: ${preference}${notes.trim() ? `\n• Special Requests: ${notes.trim()}` : ""}\n\nPlease confirm my reservation. Looking forward to visiting!`;

  const prefilledEmailBody = `Hello Boreal Café team,\n\nI have requested a table reservation with these verified details:\n\n- Full Name: ${name.trim()}\n- Email Address: ${email.trim()}\n- Contact Phone: ${phone.trim()}\n- Party Size: ${partySize}\n- Date: ${dateOption}\n- Preferred Time: ${timeSlot}\n- Seating Preference: ${preference}\n- Special Requests: ${notes.trim() || "None"}\n\nThank you!\n${name.trim()}`;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="reservation-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {!confirmed ? (
          <>
            <div className="reservation-header">
              <span
                className="eyebrow"
                style={{ color: "var(--accent)", marginBottom: "0.25rem", display: "inline-block" }}
              >
                Boreal Café · 351 Water Street
              </span>
              <h2 id="modal-title">Reserve a Table</h2>
              <p>
                Reserve a cozy spot for coffee, fresh daily pastries, and relaxed time in downtown
                St. John's.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="reservation-form" noValidate>
              <div className="form-group">
                <label className="form-label">
                  <span className="form-label-left">
                    <Users size={14} /> Party Size
                  </span>
                </label>
                <div className="option-chips-grid">
                  {["1 Guest", "2 Guests", "3-4 Guests", "5+ Group"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`option-chip ${partySize === size ? "selected" : ""}`}
                      onClick={() => setPartySize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="form-label-left">
                    <Calendar size={14} /> Date
                  </span>
                </label>
                <div className="option-chips-grid">
                  {["Today", "Tomorrow", "This Weekend", "Next Week"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`option-chip ${dateOption === d ? "selected" : ""}`}
                      onClick={() => setDateOption(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="form-label-left">
                    <Clock size={14} /> Preferred Time
                  </span>
                </label>
                <div className="option-chips-grid">
                  {[
                    "Morning Coffee (8am - 11am)",
                    "Midday Lunch (11am - 2pm)",
                    "Afternoon Pause (2pm - 4pm)",
                    "Late Afternoon (4pm - 5:30pm)",
                  ].map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`option-chip ${timeSlot === time ? "selected" : ""}`}
                      onClick={() => setTimeSlot(time)}
                      style={{ fontSize: "0.78rem" }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="form-label-left">
                    <Sparkles size={14} /> Seating Preference
                  </span>
                </label>
                <div className="option-chips-grid">
                  {[
                    "Cozy Window Table",
                    "Quiet Reading Nook",
                    "Board Game Table",
                    "Any Available Table",
                  ].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      className={`option-chip ${preference === pref ? "selected" : ""}`}
                      onClick={() => setPreference(pref)}
                      style={{ fontSize: "0.78rem" }}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="res-name">
                  <span className="form-label-left">
                    <User size={14} /> Full Name
                  </span>
                  <span className="required-badge">Required</span>
                </label>
                <div className="input-container">
                  <span className="input-icon-left">
                    <User size={16} />
                  </span>
                  <input
                    id="res-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (touched.name || submittedAttempt)
                        setTouched((prev) => ({ ...prev, name: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                    className={`form-input ${nameError ? "has-error" : isNameValid ? "is-valid" : ""}`}
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? "name-error" : undefined}
                  />
                  {isNameValid && (
                    <span className="input-icon-right" style={{ color: "oklch(0.65 0.18 145)" }}>
                      <Check size={16} />
                    </span>
                  )}
                  {nameError && (
                    <span className="input-icon-right" style={{ color: "oklch(0.62 0.22 25)" }}>
                      <AlertCircle size={16} />
                    </span>
                  )}
                </div>
                {nameError && (
                  <div id="name-error" className="field-error-msg" role="alert">
                    <AlertCircle size={13} /> {nameError}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="res-email">
                  <span className="form-label-left">
                    <Mail size={14} /> Email Address
                  </span>
                  <span className="required-badge">Required</span>
                </label>
                <div className="input-container">
                  <span className="input-icon-left">
                    <Mail size={16} />
                  </span>
                  <input
                    id="res-email"
                    type="email"
                    required
                    placeholder="e.g. alex.morgan@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email || submittedAttempt)
                        setTouched((prev) => ({ ...prev, email: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    className={`form-input ${emailError ? "has-error" : isEmailValid ? "is-valid" : ""}`}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : "email-hint"}
                  />
                  {isEmailValid && (
                    <span className="input-icon-right" style={{ color: "oklch(0.65 0.18 145)" }}>
                      <Check size={16} />
                    </span>
                  )}
                  {emailError && (
                    <span className="input-icon-right" style={{ color: "oklch(0.62 0.22 25)" }}>
                      <AlertCircle size={16} />
                    </span>
                  )}
                </div>
                {emailError ? (
                  <div id="email-error" className="field-error-msg" role="alert">
                    <AlertCircle size={13} /> {emailError}
                  </div>
                ) : (
                  <p id="email-hint" className="field-hint-msg">
                    We will send reservation confirmation & booking notes to this email.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="res-phone">
                  <span className="form-label-left">
                    <Phone size={14} /> Contact Phone
                  </span>
                  <span className="required-badge">Required</span>
                </label>
                <div className="input-container">
                  <span className="input-icon-left">
                    <Phone size={16} />
                  </span>
                  <input
                    id="res-phone"
                    type="tel"
                    required
                    placeholder="e.g. +1 (709) 552-4809"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (touched.phone || submittedAttempt)
                        setTouched((prev) => ({ ...prev, phone: true }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    className={`form-input ${phoneError ? "has-error" : isPhoneValid ? "is-valid" : ""}`}
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "phone-error" : "phone-hint"}
                  />
                  {isPhoneValid && (
                    <span className="input-icon-right" style={{ color: "oklch(0.65 0.18 145)" }}>
                      <Check size={16} />
                    </span>
                  )}
                  {phoneError && (
                    <span className="input-icon-right" style={{ color: "oklch(0.62 0.22 25)" }}>
                      <AlertCircle size={16} />
                    </span>
                  )}
                </div>
                {phoneError ? (
                  <div id="phone-error" className="field-error-msg" role="alert">
                    <AlertCircle size={13} /> {phoneError}
                  </div>
                ) : (
                  <p id="phone-hint" className="field-hint-msg">
                    Used for SMS arrival reminders and WhatsApp table confirmations.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="res-notes">
                  <span className="form-label-left">
                    <MessageSquare size={14} /> Special Requests or Occasion
                  </span>
                  <span className="optional-badge">Optional</span>
                </label>
                <input
                  id="res-notes"
                  type="text"
                  placeholder="e.g. High chair needed, celebrating anniversary, quiet window table..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input no-left-icon"
                  maxLength={160}
                />
              </div>

              <div className="form-trust-banner">
                <ShieldCheck size={18} />
                <span>
                  Your contact details are protected and strictly used to coordinate your table
                  reservation.
                </span>
              </div>

              <button type="submit" className="button button-primary submit-reservation-btn">
                <Calendar size={17} /> Confirm Table Reservation
              </button>
            </form>
          </>
        ) : (
          <div className="reservation-confirmation">
            <div className="confirmation-icon">
              <CheckCircle2 size={36} />
            </div>
            <span
              className="eyebrow"
              style={{ color: "var(--accent)", marginBottom: "0.25rem", letterSpacing: "0.14em" }}
            >
              Table Reserved
            </span>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.3rem",
                margin: "0.3rem 0 0.5rem",
              }}
            >
              Reservation Confirmed!
            </h3>
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: "0.95rem",
                maxWidth: "420px",
                margin: "0 auto 1.5rem",
                lineHeight: 1.5,
              }}
            >
              We've saved a comfortable spot for you at Boreal Café on 351 Water Street. A copy of
              your details has been prepared below.
            </p>

            <div className="reservation-recap-box">
              <div className="recap-row">
                <span>Guest Name:</span>
                <span>{name.trim() || "Guest"}</span>
              </div>
              <div className="recap-row">
                <span>Email Address:</span>
                <span>{email.trim()}</span>
              </div>
              <div className="recap-row">
                <span>Contact Phone:</span>
                <span>{phone.trim()}</span>
              </div>
              <div className="recap-row">
                <span>Party Size:</span>
                <span>{partySize}</span>
              </div>
              <div className="recap-row">
                <span>Date & Time:</span>
                <span>
                  {dateOption} · {timeSlot}
                </span>
              </div>
              <div className="recap-row">
                <span>Seating:</span>
                <span>{preference}</span>
              </div>
              {notes.trim() && (
                <div className="recap-row">
                  <span>Special Notes:</span>
                  <span>{notes.trim()}</span>
                </div>
              )}
              <div className="recap-row">
                <span>Location:</span>
                <span>351 Water St, St. John's, NL</span>
              </div>
            </div>

            <div
              className="confirmation-actions"
              style={{ flexDirection: "column", gap: "0.65rem", width: "100%" }}
            >
              <a
                href={`https://wa.me/17095524809?text=${encodeURIComponent(prefilledWhatsApp)}`}
                target="_blank"
                rel="noreferrer"
                className="button button-whatsapp"
                style={{ width: "100%" }}
              >
                <WhatsAppIcon size={17} /> Send Details via WhatsApp
              </a>

              <a
                href={`mailto:contact@borealcafe.ca?subject=${encodeURIComponent(`Table Reservation - ${name.trim()} (${partySize})`)}&body=${encodeURIComponent(prefilledEmailBody)}`}
                className="button button-email"
                style={{ width: "100%" }}
              >
                <Mail size={16} /> Send Copy to Café Email
              </a>

              <div style={{ display: "flex", gap: "0.65rem", width: "100%", marginTop: "0.2rem" }}>
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-primary"
                  style={{ flex: 1 }}
                >
                  Get Directions <ArrowUpRight size={16} />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="button button-secondary"
                  style={{ flex: 1 }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | undefined>(undefined);
  const [cartCount, setCartCount] = useState<number>(() => getCartTotals().itemCount);

  useEffect(() => {
    const handleSync = () => setCartCount(getCartTotals().itemCount);
    const handleOpenTrack = (e: Event) => {
      const customEvt = e as CustomEvent<{ orderId?: string }>;
      setTrackedOrderId(customEvt.detail?.orderId);
      setIsTrackOpen(true);
    };
    window.addEventListener("boreal-cart-updated", handleSync);
    window.addEventListener("boreal-open-track", handleOpenTrack);
    return () => {
      window.removeEventListener("boreal-cart-updated", handleSync);
      window.removeEventListener("boreal-open-track", handleOpenTrack);
    };
  }, []);

  const openTrackOrder = (initialOrderId?: string | undefined) => {
    setTrackedOrderId(initialOrderId);
    setIsTrackOpen(true);
  };

  const closeTrackOrder = () => {
    setIsTrackOpen(false);
  };

  return (
    <ReservationContext.Provider
      value={{
        isOpen: isReservationOpen,
        openReservation: () => setIsReservationOpen(true),
        closeReservation: () => setIsReservationOpen(false),
      }}
    >
      <CartContext.Provider
        value={{
          isCartOpen,
          openCart: () => setIsCartOpen(true),
          closeCart: () => setIsCartOpen(false),
          cartCount,
        }}
      >
        <TrackOrderContext.Provider
          value={{
            isTrackOrderOpen: isTrackOpen,
            openTrackOrder,
            closeTrackOrder,
            trackedOrderId,
          }}
        >
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <MobileActions />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          <TrackOrderModal
            isOpen={isTrackOpen}
            onClose={closeTrackOrder}
            initialOrderId={trackedOrderId}
          />
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="floating-whatsapp-btn"
            title="Chat with Boreal Café on WhatsApp"
            aria-label="Chat with Boreal Café on WhatsApp"
          >
            <WhatsAppIcon size={26} />
          </a>
          {cartCount > 0 && !isCartOpen && (
            <button
              type="button"
              className="floating-cart-pill"
              onClick={() => setIsCartOpen(true)}
              aria-label={`View order bag with ${cartCount} items`}
            >
              <ShoppingBag size={17} />
              <span>Order Bag ({cartCount})</span>
            </button>
          )}
          {isReservationOpen && <ReservationModal onClose={() => setIsReservationOpen(false)} />}
        </TrackOrderContext.Provider>
      </CartContext.Provider>
    </ReservationContext.Provider>
  );
}

export function MobileActions() {
  const { openReservation } = useReservation();
  const { openCart, cartCount } = useCart();
  const { openTrackOrder } = useTrackOrder();

  return (
    <nav className="mobile-actions" aria-label="Quick actions">
      <button
        type="button"
        onClick={openCart}
        className="mobile-action-order-btn"
        aria-label="Order Now"
      >
        <div className="mobile-order-icon-wrap">
          <ShoppingBag size={18} />
          {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
        </div>
        <span>Order</span>
      </button>
      <button
        type="button"
        onClick={() => openTrackOrder()}
        className="mobile-action-track-btn"
        aria-label="Track Order"
      >
        <Compass size={18} />
        <span>Track</span>
      </button>
      <a href={`tel:${PHONE.replace(/\s/g, "")}`}>
        <Phone size={18} />
        <span>Call</span>
      </a>
      <a href={DIRECTIONS_URL} target="_blank" rel="noreferrer">
        <MapPin size={18} />
        <span>Directions</span>
      </a>
      <button
        type="button"
        onClick={openReservation}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: ".2rem",
          fontSize: ".58rem",
          textTransform: "uppercase",
          letterSpacing: ".08em",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <Calendar size={18} />
        <span>Reserve</span>
      </button>
      <Link to="/menu">
        <span className="menu-symbol">M</span>
        <span>Menu</span>
      </Link>
    </nav>
  );
}

export function RatingStrip() {
  return (
    <section className="rating-strip" aria-label="Boreal Café at a glance">
      <div className="shell rating-inner">
        <div className="rating-score">
          <span className="stars" aria-hidden="true">
            ★★★★★
          </span>
          <strong>4.8 on Google</strong>
          <span>93 reviews</span>
        </div>
        <div className="rating-facts">
          <span>Downtown St. John's</span>
          <span>Dine-in</span>
          <span>Takeaway</span>
        </div>
      </div>
    </section>
  );
}

export function PageIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-intro">
      <div className="shell narrow">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{copy}</p>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

export function InfoPill({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="info-pill">
      {icon}
      {children}
    </span>
  );
}

export function FAQItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="faq-item">
      <summary>
        {question}
        <ChevronDown aria-hidden="true" />
      </summary>
      <div>{children}</div>
    </details>
  );
}

export function Stars() {
  return (
    <span className="star-row" aria-label="4.8 out of 5 stars">
      <Star fill="currentColor" />
      <Star fill="currentColor" />
      <Star fill="currentColor" />
      <Star fill="currentColor" />
      <Star fill="currentColor" />
    </span>
  );
}
