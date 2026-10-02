import { useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  Coffee,
  HelpCircle,
  Mail,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  DIRECTIONS_URL,
  EMAIL_URL,
  WHATSAPP_URL,
  WhatsAppIcon,
  useReservation,
} from "@/components/site";

export interface FAQItemData {
  id: string;
  num: string;
  category: "Visiting & Space" | "Coffee & Menu" | "Reservations & Contact";
  categoryLabel: string;
  question: string;
  answer: string;
  highlights: string[];
}

export const FAQS_LIST: FAQItemData[] = [
  {
    id: "location",
    num: "01",
    category: "Visiting & Space",
    categoryLabel: "Location & Harbour",
    question: "Where exactly is Boreal Café located in St. John's?",
    answer:
      "We are situated in the heart of historic downtown St. John's at 351 Water Street, NL A1C 1C2, right between local artisan boutiques and steps from the harbourfront. Look for our warm lantern glow and window seating overlooking the street.",
    highlights: [
      "351 Water Street, Downtown St. John's",
      "Short walk to Harbourside Park & Atlantic Place",
    ],
  },
  {
    id: "service",
    num: "02",
    category: "Coffee & Menu",
    categoryLabel: "Dine-In & Takeaway",
    question: "Do you offer both dine-in and takeaway options?",
    answer:
      "Yes, both dine-in and takeaway are happily available! Whether you'd like to settle into an armchair with a ceramic mug and novel, or grab a handcrafted flat white and warm butter pecan scone for your morning harbour stroll, we're ready for you.",
    highlights: ["Ceramic mug dine-in service", "Eco-friendly takeaway cups & bakery boxes"],
  },
  {
    id: "reservations",
    num: "03",
    category: "Reservations & Contact",
    categoryLabel: "Table Booking",
    question: "How do table reservations work, and is there any fee?",
    answer:
      "Table reservations are 100% free! You can click the 'Table Reservation' button anywhere on our website to choose your party size, date, preferred time window, and seating preference (window nook, reading corner, or board game table). You'll receive instant confirmation with one-tap options to send your booking to WhatsApp or email.",
    highlights: [
      "Free online reservations with instant confirmation",
      "Window nook & group table options",
    ],
  },
  {
    id: "dietary",
    num: "04",
    category: "Coffee & Menu",
    categoryLabel: "Plant Milks & Vegan",
    question: "Do you provide dairy-free milk alternatives and vegan pastries?",
    answer:
      "Yes! We proudly steam oat milk, almond milk, and soy milk for all espresso beverages, matcha, and signature tea lattes. We also stock rotating vegan-friendly pastries, date squares, and gluten-sensitive treats in our daily display case.",
    highlights: ["Oat, Almond & Soy milk options", "Daily vegan & gluten-sensitive bakery options"],
  },
  {
    id: "atmosphere",
    num: "05",
    category: "Visiting & Space",
    categoryLabel: "Cozy Space & Study",
    question: "Is Boreal Café suitable for remote work, reading, or studying?",
    answer:
      "Absolutely. Boreal Café is crafted around an unhurried, comfortable pace. Guests love our soft lighting, comfortable banquettes, curated acoustic playlists, and relaxed atmosphere. During busier weekend lunch rush hours, we kindly ask guests to share larger tables.",
    highlights: [
      "Quiet reading nooks & soft ambient lighting",
      "Comfortable seating with power access",
    ],
  },
  {
    id: "games",
    num: "06",
    category: "Visiting & Space",
    categoryLabel: "Board Games & Books",
    question: "Are board games and lending books available for guests?",
    answer:
      "Yes! We maintain a dedicated shelf of classic board games, card decks, and an unhurried lending library of novels, essays, and regional art books. You're always welcome to borrow a game while sipping your coffee.",
    highlights: ["Curated selection of board games & card decks", "Complimentary lending library"],
  },
  {
    id: "families",
    num: "07",
    category: "Visiting & Space",
    categoryLabel: "Children & Families",
    question: "Is the café family-friendly with seating for toddlers and children?",
    answer:
      "Yes! Families with children are warmly welcomed. We provide high chairs, spacious seating areas, and caffeine-free menu choices including artisan hot chocolates, warm spiced cider, and fruit infusions.",
    highlights: [
      "High chairs available upon request",
      "Kid-friendly warm drinks & fresh baked goods",
    ],
  },
  {
    id: "parking",
    num: "08",
    category: "Visiting & Space",
    categoryLabel: "Downtown Parking",
    question: "Where is the best place to park when visiting on Water Street?",
    answer:
      "Metered on-street parking is readily available along Water Street and Harbour Drive. Additionally, covered parking garages (including the 351 Water Street Garage right next door and Atlantic Place Parking) are just a 1-to-2 minute walk away.",
    highlights: [
      "351 Water Street Garage directly adjacent",
      "Street parking along Harbour Drive & Water St",
    ],
  },
  {
    id: "contact",
    num: "09",
    category: "Reservations & Contact",
    categoryLabel: "WhatsApp & Email",
    question: "How quickly can I get in touch via WhatsApp or email?",
    answer:
      "We respond promptly! Use our one-click 'WhatsApp Us' button to start an instant message to +1 709-552-4809 with your pre-filled inquiry, or click 'Email Us' (contact@borealcafe.ca) for reservations, lost-and-found, and menu questions.",
    highlights: [
      "Direct WhatsApp chat to +1 709-552-4809",
      "Direct email support at contact@borealcafe.ca",
    ],
  },
  {
    id: "events",
    num: "10",
    category: "Reservations & Contact",
    categoryLabel: "Private Events & Clubs",
    question: "Do you host private book clubs, meetings, or community gatherings?",
    answer:
      "Yes! We accommodate small group gatherings, evening book clubs, and creative meetups by advance reservation. Contact us through our reservation form or WhatsApp with your group size and date ideas to discuss options.",
    highlights: ["Accommodations for up to 20+ guests", "Custom coffee & pastry catering packages"],
  },
];

type CategoryFilter = "All" | "Visiting & Space" | "Coffee & Menu" | "Reservations & Contact";

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(["location", "reservations"]);
  const { openReservation } = useReservation();

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const filteredFAQs = FAQS_LIST.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.categoryLabel.toLowerCase().includes(query) ||
      faq.highlights.some((h) => h.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  const categories: { label: CategoryFilter; count: number }[] = [
    { label: "All", count: FAQS_LIST.length },
    {
      label: "Visiting & Space",
      count: FAQS_LIST.filter((f) => f.category === "Visiting & Space").length,
    },
    {
      label: "Coffee & Menu",
      count: FAQS_LIST.filter((f) => f.category === "Coffee & Menu").length,
    },
    {
      label: "Reservations & Contact",
      count: FAQS_LIST.filter((f) => f.category === "Reservations & Contact").length,
    },
  ];

  return (
    <section className="section faq-section" aria-label="Frequently Asked Questions">
      <div className="shell faq-layout">
        {/* Left Sticky Sidebar */}
        <aside className="faq-sticky-sidebar">
          <div className="faq-header-content">
            <span
              className="eyebrow"
              style={{
                color: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              <Sparkles size={14} /> Everything You Need to Know
            </span>
            <h2>Answers from the counter.</h2>
            <p>
              From our cozy harbourfront location and table reservations to dietary choices and
              downtown parking, explore the 10 most common guest questions before visiting Boreal
              Café.
            </p>
          </div>

          <div className="faq-help-card">
            <span className="eyebrow" style={{ color: "var(--accent)", fontSize: "0.68rem" }}>
              Direct Assistance
            </span>
            <h3>Have a question?</h3>
            <p>
              Our team at 351 Water Street is always happy to help you plan your visit or answer
              questions directly.
            </p>
            <div className="faq-help-actions">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="button button-whatsapp"
                style={{ width: "100%", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
              >
                <WhatsAppIcon size={16} /> WhatsApp Us
              </a>
              <a
                href={EMAIL_URL}
                className="button button-email"
                style={{ width: "100%", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
              >
                <Mail size={16} /> Email Us
              </a>
              <button
                type="button"
                onClick={openReservation}
                className="button button-secondary"
                style={{ width: "100%", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}
              >
                <Calendar size={15} /> Reserve a Table
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main FAQ Content */}
        <div className="faq-main-column">
          {/* Category Filter Chips */}
          <div className="faq-filter-bar" role="tablist" aria-label="Filter FAQ by topic">
            {categories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.label}
                className={`faq-filter-chip ${activeCategory === cat.label ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.label)}
              >
                <span>{cat.label}</span>
                <span className="faq-filter-count">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="faq-search-wrapper">
            <Search size={18} className="faq-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search 10 frequently asked questions (e.g. parking, vegan, booking)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq-search-input"
              aria-label="Search frequently asked questions"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="faq-clear-search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* 10 FAQ Accordion Cards */}
          {filteredFAQs.length > 0 ? (
            <div className="faq-cards-list">
              {filteredFAQs.map((faq) => {
                const isOpen = openIds.includes(faq.id);
                return (
                  <details
                    key={faq.id}
                    className="faq-card"
                    open={isOpen}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFAQ(faq.id);
                    }}
                  >
                    <summary className="faq-summary">
                      <div className="faq-summary-left">
                        <span className="faq-num-badge">{faq.num}</span>
                        <div className="faq-meta-block">
                          <span className="faq-category-label">{faq.categoryLabel}</span>
                          <h3 className="faq-question-title">{faq.question}</h3>
                        </div>
                      </div>
                      <span className="faq-chevron-toggle" aria-hidden="true">
                        <ChevronDown size={17} />
                      </span>
                    </summary>

                    <div className="faq-content-body">
                      <p>{faq.answer}</p>
                      {faq.highlights && faq.highlights.length > 0 && (
                        <ul className="faq-highlights-list" aria-label="Key highlights">
                          {faq.highlights.map((item, idx) => (
                            <li key={idx} className="faq-highlight-pill">
                              <Check size={13} aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3.5rem 2rem",
                background: "color-mix(in oklab, var(--card) 85%, var(--background))",
                borderRadius: "1rem",
                border: "1px dashed var(--border)",
              }}
            >
              <HelpCircle
                size={36}
                style={{ color: "var(--muted-foreground)", marginBottom: "0.75rem" }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                No questions matched your search
              </h3>
              <p
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: "0.92rem",
                  marginBottom: "1.25rem",
                }}
              >
                Try searching for something else like "parking", "vegan", "coffee", or
                "reservations".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="button button-secondary"
                style={{ borderRadius: "9999px" }}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
