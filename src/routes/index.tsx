import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  Coffee,
  Compass,
  Copy,
  Croissant,
  ExternalLink,
  Gamepad2,
  Heart,
  Lamp,
  MapPin,
  Navigation,
  Quote,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Sparkles,
  Star,
  Users,
  Waves,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import heroCoffeeImage from "@/assets/boreal-hero-coffee.jpg";
import coffeeImage from "@/assets/boreal-coffee-pastry.jpg";
import streetImage from "@/assets/boreal-water-street-mood.jpg";
import {
  ADDRESS,
  DIRECTIONS_URL,
  PageShell,
  RatingStrip,
  SectionHeading,
  Stars,
  useCart,
} from "@/components/site";
import { FAQSection, FAQS_LIST } from "@/components/faq-section";
import { addToCart } from "@/lib/cart-store";

export const featuredMenuItems = [
  {
    id: "menu-1",
    name: "Caffè Latte",
    category: "Coffee",
    price: "$5.25",
    numPrice: 5.25,
    description: "Double espresso freshly extracted over silky textured whole or oat milk.",
    badge: "Guest Favourite",
  },
  {
    id: "menu-7",
    name: "Harbour Fog Tea Latte",
    category: "Tea & specialty drinks",
    price: "$5.95",
    numPrice: 5.95,
    description: "Signature St. John's Earl Grey infused with pure vanilla bean and lavender steam.",
    badge: "House Specialty",
  },
  {
    id: "menu-2",
    name: "Cappuccino",
    category: "Coffee",
    price: "$4.95",
    numPrice: 4.95,
    description: "Double espresso, velvety steamed milk, and dense microfoam dusted with cocoa.",
    badge: "Classic",
  },
  {
    id: "menu-3",
    name: "Iced Latte",
    category: "Coffee",
    price: "$5.75",
    numPrice: 5.75,
    description: "Chilled double espresso poured over fresh milk and clean mountain ice.",
    badge: "Chilled",
  },
  {
    id: "menu-9",
    name: "Butter Pecan Scone",
    category: "Pastries & treats",
    price: "$4.50",
    numPrice: 4.5,
    description: "Baked daily with toasted pecans, Atlantic butter, and raw demerara sugar crust.",
    badge: "Fresh Baked",
  },
  {
    id: "menu-10",
    name: "Wild Blueberry Muffin",
    category: "Pastries & treats",
    price: "$4.25",
    numPrice: 4.25,
    description: "Handpicked Newfoundland wild blueberries with cinnamon streusel crunch.",
    badge: "Local Berry",
  },
  {
    id: "menu-11",
    name: "Traditional Date Square",
    category: "Pastries & treats",
    price: "$4.75",
    numPrice: 4.75,
    description: "Classic brown sugar rolled oat crumble layering slow-simmered date paste.",
    badge: "Vegan Friendly",
  },
  {
    id: "menu-13",
    name: "Partridgeberry Tart",
    category: "Pastries & treats",
    price: "$5.25",
    numPrice: 5.25,
    description: "Flaky butter pastry filled with tart mountain partridgeberry preserve.",
    badge: "Atlantic Icon",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boreal Café | Coffee & Café on Water Street in St. John's" },
      {
        name: "description",
        content:
          "Visit Boreal Café on Water Street in downtown St. John's for coffee, tea, pastries, a cozy atmosphere, and a comfortable place to slow down.",
      },
      { property: "og:title", content: "Boreal Café | Water Street, St. John's" },
      {
        property: "og:description",
        content: "Coffee, comforting treats, and a warm café atmosphere in downtown St. John's.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CafeOrCoffeeShop",
          name: "Boreal Café",
          telephone: "+17095524809",
          priceRange: "$10–20",
          address: {
            "@type": "PostalAddress",
            streetAddress: "351 Water St",
            addressLocality: "St. John's",
            addressRegion: "NL",
            postalCode: "A1C 1C2",
            addressCountry: "CA",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "93",
          },
          servesCuisine: "Coffee and café fare",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS_LIST.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }),
      },
    ],
  }),
  component: Home,
});

function StreetSection() {
  const [view, setView] = useState<"photo" | "map">("photo");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;

  return (
    <section className="section street-section">
      <div className="shell street-grid">
        <div className="street-visual-column">
          <div className="street-view-tabs" role="tablist" aria-label="Visual view options">
            <button
              type="button"
              role="tab"
              aria-selected={view === "photo"}
              className={`street-view-tab ${view === "photo" ? "active" : ""}`}
              onClick={() => setView("photo")}
            >
              <Camera size={14} /> Street Mood
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "map"}
              className={`street-view-tab ${view === "map" ? "active" : ""}`}
              onClick={() => setView("map")}
            >
              <Compass size={14} /> Live Map
            </button>
          </div>

          <div className="street-media-card">
            {view === "photo" ? (
              <figure className="street-photo-wrap">
                <img
                  src={streetImage}
                  width={1200}
                  height={912}
                  loading="lazy"
                  alt="Atmospheric interpretation of a foggy downtown St. John's street near the harbour"
                />
                <div className="street-floating-badge">
                  <Waves size={14} />
                  <span>Historic Harbour District</span>
                </div>
                <div className="street-photo-bottom-card">
                  <p className="street-photo-quote">
                    “Steaming mugs, warm lights & rain-slicked streets.”
                  </p>
                  <div className="street-photo-meta">
                    <span>351 Water Street · Downtown St. John's</span>
                    <span>Atmospheric Mood</span>
                  </div>
                </div>
              </figure>
            ) : (
              <div className="street-map-wrap">
                <iframe
                  src={mapEmbedUrl}
                  title="Google Map showing Boreal Café at 351 Water Street"
                  className="street-map-frame"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>

        <div className="street-content-column">
          <div className="street-eyebrow-badge">
            <span className="street-eyebrow-dot" />
            <span>In the Heart of Downtown</span>
          </div>

          <h2 className="street-title">A warm stop on a cool St. John’s day.</h2>

          <p className="street-description">
            Boreal Café sits at 351 Water Street, close to the rhythm of downtown and the harbour.
            Whether escaping the brisk Atlantic fog or taking an unhurried afternoon break, there is
            always a comfortable seat, thoughtful coffee, and a fresh pastry waiting for you.
          </p>

          <div className="street-features-grid">
            <div className="street-feature-item">
              <div className="street-feature-icon">
                <Coffee size={18} />
              </div>
              <div className="street-feature-text">
                <strong>Specialty Coffee & Tea</strong>
                <span>Espresso, brews & Harbour Fog lattes</span>
              </div>
            </div>
            <div className="street-feature-item">
              <div className="street-feature-icon">
                <Croissant size={18} />
              </div>
              <div className="street-feature-text">
                <strong>Fresh Treats Daily</strong>
                <span>Butter pecan scones & bakery favorites</span>
              </div>
            </div>
            <div className="street-feature-item">
              <div className="street-feature-icon">
                <Lamp size={18} />
              </div>
              <div className="street-feature-text">
                <strong>Cozy Atmosphere</strong>
                <span>Gentle ambient lighting, books & games</span>
              </div>
            </div>
            <div className="street-feature-item">
              <div className="street-feature-icon">
                <Waves size={18} />
              </div>
              <div className="street-feature-text">
                <strong>Harbour Proximity</strong>
                <span>Steps from downtown lookouts & shops</span>
              </div>
            </div>
          </div>

          <div className="street-location-card">
            <div className="street-address-bar">
              <div className="street-address-text">
                <span className="street-address-pin">
                  <MapPin size={17} />
                </span>
                <span>{ADDRESS}</span>
              </div>
              <button
                type="button"
                className={`street-copy-button ${copied ? "copied" : ""}`}
                onClick={handleCopy}
                title="Copy address to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Address
                  </>
                )}
              </button>
            </div>

            <div className="street-status-pills">
              <span className="street-status-pill">
                <span className="status-dot-green" />
                Dine-in & Takeaway Welcome
              </span>
              <span className="street-status-pill">
                <span>·</span>
                <span>Downtown St. John's, NL</span>
              </span>
            </div>
          </div>

          <div className="street-actions-group">
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-primary"
            >
              Get directions <ArrowRight size={17} />
            </a>
            <Link to="/visit" className="button button-secondary">
              Plan your visit
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const [activeTab, setActiveTab] = useState<"all" | "coffee" | "atmosphere">("all");

  const ratingBars = [
    { star: 5, pct: 92, count: "86" },
    { star: 4, pct: 6, count: "5" },
    { star: 3, pct: 2, count: "2" },
    { star: 2, pct: 0, count: "0" },
    { star: 1, pct: 0, count: "0" },
  ];

  const subratings = [
    { label: "Coffee & Drinks", score: "4.9", icon: Coffee },
    { label: "Cozy Ambiance", score: "4.9", icon: Lamp },
    { label: "Pastries & Bakes", score: "4.8", icon: Croissant },
    { label: "Warm Hospitality", score: "4.8", icon: Heart },
  ];

  const reviewQuotes = [
    {
      id: "1",
      category: "atmosphere",
      title: "The coziest corner on Water Street",
      quote:
        "There's nothing quite like stepping in from the cool harbour fog to a warm seat by the window. The Harbour Fog tea latte and warm scones are an absolute delight.",
      author: "Downtown Visitor",
      tag: "Cozy Atmosphere & Treats",
      rating: 5,
    },
    {
      id: "2",
      category: "coffee",
      title: "Superb coffee & unhurried ease",
      quote:
        "Top-notch espresso with rich crema, paired with comfortable seating and a thoughtfully curated shelf of books and games. You never feel rushed to leave.",
      author: "Local Coffee Enthusiast",
      tag: "Specialty Roast & Leisure",
      rating: 5,
    },
    {
      id: "3",
      category: "atmosphere",
      title: "Friendly staff & welcoming downtown vibe",
      quote:
        "The team is wonderfully warm and attentive. Perfect location right in the heart of downtown St. John's, whether for a quick takeaway or a slow conversation.",
      author: "Water Street Regular",
      tag: "Hospitality & Location",
      rating: 5,
    },
  ];

  const filteredQuotes =
    activeTab === "all" ? reviewQuotes : reviewQuotes.filter((q) => q.category === activeTab);

  return (
    <section className="section proof-section">
      <div className="shell proof-grid">
        {/* Left Column: Grand Luxury Rating Card */}
        <div className="proof-rating-card">
          <div className="proof-card-header">
            <div className="google-review-badge">
              <span className="google-g-logo">G</span>
              <span>Google Reviews</span>
            </div>
            <span className="proof-card-location-tag">Water St · St. John's</span>
          </div>

          <div className="proof-hero-score">
            <span className="proof-hero-number">4.8</span>
            <div className="proof-hero-details">
              <div className="proof-stars-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <span className="proof-sentiment-text">Exceptional Guest Rating</span>
              <span className="proof-reviews-subtext">Based on 93 verified Google reviews</span>
            </div>
          </div>

          {/* Star Breakdown Bars */}
          <div className="proof-bars-wrap" aria-label="Rating breakdown">
            {ratingBars.map((bar) => (
              <div key={bar.star} className="proof-bar-row">
                <span className="proof-bar-star-label">
                  {bar.star} <Star size={11} fill="currentColor" />
                </span>
                <div className="proof-bar-track">
                  <div className="proof-bar-fill" style={{ width: `${bar.pct}%` }} />
                </div>
                <span className="proof-bar-count">{bar.count}</span>
              </div>
            ))}
          </div>

          {/* Subratings 2x2 grid */}
          <div className="proof-subratings-grid">
            {subratings.map((sub) => {
              const Icon = sub.icon;
              return (
                <div key={sub.label} className="proof-subrating-pill">
                  <div className="proof-subrating-pill-left">
                    <Icon size={14} />
                    <span>{sub.label}</span>
                  </div>
                  <span className="proof-subrating-score">{sub.score} ★</span>
                </div>
              );
            })}
          </div>

          {/* Card Footer Award */}
          <div className="proof-card-footer">
            <div className="proof-award-pill">
              <Award size={15} />
              <span>Top Rated Café on Water Street</span>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Boreal+Cafe+351+Water+St+St+Johns"
              target="_blank"
              rel="noreferrer"
              className="proof-google-link"
            >
              Google Maps <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Right Column: Quotes & Guest Voices */}
        <div className="proof-right-column">
          <div className="proof-eyebrow-badge">
            <Sparkles size={13} />
            <span>What Guests Notice</span>
          </div>

          <h2 className="proof-heading">Good coffee gets people talking.</h2>

          <p className="proof-lead">
            From misty harbour mornings to cozy rainy afternoons, guests continually highlight the
            welcoming atmosphere, artisanal espresso, and comfortable living-room feel that define
            Boreal Café.
          </p>

          <div className="proof-filter-tabs" role="tablist" aria-label="Review topic filters">
            <button
              type="button"
              className={`proof-filter-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Highlights
            </button>
            <button
              type="button"
              className={`proof-filter-btn ${activeTab === "atmosphere" ? "active" : ""}`}
              onClick={() => setActiveTab("atmosphere")}
            >
              <Lamp size={13} /> Atmosphere
            </button>
            <button
              type="button"
              className={`proof-filter-btn ${activeTab === "coffee" ? "active" : ""}`}
              onClick={() => setActiveTab("coffee")}
            >
              <Coffee size={13} /> Coffee & Bakes
            </button>
          </div>

          <div className="proof-quotes-list">
            {filteredQuotes.map((q) => (
              <article key={q.id} className="proof-quote-card">
                <div className="proof-quote-top">
                  <div className="proof-quote-stars">
                    {[...Array(q.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <span className="proof-quote-tag">{q.tag}</span>
                </div>
                <p className="proof-quote-text">“{q.quote}”</p>
                <div className="proof-quote-author">
                  <span>{q.author}</span>
                  <span className="proof-quote-author-dot" />
                  <span>Verified Google Review</span>
                </div>
              </article>
            ))}
          </div>

          <div className="proof-disclaimer">
            <CheckCircle2 size={15} />
            <span>
              Themes synthesized from 93 authentic Google guest reviews for Boreal Café at 351 Water
              Street.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const { openCart } = useCart();

  const handleAdd = (item: (typeof featuredMenuItems)[0]) => {
    addToCart({
      menuId: item.id,
      name: item.name,
      price: item.numPrice,
      category: item.category,
    });
    toast.success(`Added ${item.name} to order (${item.price})`, {
      description: "Item saved in your order bag.",
      action: {
        label: "View Bag",
        onClick: () => openCart(),
      },
    });
  };

  return (
    <PageShell>
      <section className="hero">
        <img
          src={heroCoffeeImage}
          width={1600}
          height={900}
          alt="An artisanal ceramic cup of steaming latte on a warm wooden table at Boreal Café"
        />
        <div className="hero-shade" />
        <div className="shell hero-content">
          <p className="eyebrow hero-eyebrow">351 Water Street · St. John's</p>
          <h1>
            Your cozy corner
            <br />
            on Water Street.
          </h1>
          <p>
            Thoughtfully made coffee, comforting treats, and a warm place to settle in downtown St.
            John's.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              onClick={openCart}
              className="button button-order-hero"
              aria-label="Order Now"
            >
              <ShoppingBag size={17} /> Order Now
            </button>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-primary"
            >
              Get directions <ArrowRight size={17} />
            </a>
            <Link to="/menu" className="button button-ghost">
              View full menu
            </Link>
          </div>
        </div>
        <span className="image-note">Atmosphere image · Boreal Café photography to come</span>
      </section>
      <RatingStrip />

      <section className="section experience-section">
        <div className="shell experience-grid">
          <div className="experience-copy">
            <SectionHeading
              eyebrow="The Boreal feeling"
              title="A place to stay awhile."
              copy="Made for slow mornings, catch-ups with friends, quiet afternoons, and those moments when a good coffee deserves a little more time."
            />
            <div className="experience-list">
              <div>
                <Lamp />
                <span>
                  <strong>Warm & comfortable</strong>Soft lighting and different places to settle
                  in.
                </span>
              </div>
              <div>
                <BookOpen />
                <span>
                  <strong>Easygoing time</strong>Books, games, and room for unhurried conversation.
                </span>
              </div>
              <div>
                <Users />
                <span>
                  <strong>Friendly by nature</strong>A relaxed downtown spot with seating for
                  different kinds of visits.
                </span>
              </div>
            </div>
          </div>
          <figure className="editorial-image tall">
            <img
              src={coffeeImage}
              width={1200}
              height={1408}
              loading="lazy"
              alt="A latte and scone in warm window light, shown as Boreal Café menu inspiration"
            />
            <figcaption>Warm cups. Good things from the pastry case.</figcaption>
          </figure>
        </div>
      </section>

      <section className="section menu-preview">
        <div className="shell">
          <div className="menu-preview-header">
            <div>
              <SectionHeading
                eyebrow="Crafted Fresh Daily"
                title="Something good in your cup & on your plate."
                copy="Artisanal espresso, botanical tea lattes, and small-batch bakes with authentic pricing. Add directly to your order for pickup or dine-in."
              />
            </div>
            <div className="menu-header-cta">
              <button
                type="button"
                className="button button-order-cta"
                onClick={openCart}
              >
                <ShoppingBag size={16} /> Open Order Bag
              </button>
            </div>
          </div>

          <div className="menu-cards-grid">
            {featuredMenuItems.map((item) => (
              <article key={item.id} className="menu-product-card">
                <div className="card-top-meta">
                  <span className="product-category-tag">{item.category}</span>
                  {item.badge && <span className="product-badge">{item.badge}</span>}
                </div>
                <div className="card-title-price-row">
                  <h3 className="product-title">{item.name}</h3>
                  <span className="product-price">{item.price}</span>
                </div>
                <p className="product-description">{item.description}</p>
                <div className="card-action-row">
                  <span className="price-tag-sub">CAD {item.price}</span>
                  <button
                    type="button"
                    className="button button-add-to-order"
                    onClick={() => handleAdd(item)}
                    title={`Add ${item.name} to order`}
                    aria-label={`Add ${item.name} to order for ${item.price}`}
                  >
                    <Plus size={15} />
                    <span>Add to Order</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="menu-preview-bottom-actions">
            <Link to="/menu" className="button button-primary">
              Browse Complete Menu & Prices <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              className="button button-secondary"
              onClick={openCart}
            >
              <ShoppingBag size={15} /> View Order Bag & Checkout
            </button>
          </div>
        </div>
      </section>

      <StreetSection />

      <ProofSection />

      <FAQSection />

      <section className="final-cta">
        <div className="shell">
          <p className="eyebrow">Come in from the weather</p>
          <h2>
            There’s a seat waiting
            <br />
            on Water Street.
          </h2>
          <div>
            <button
              type="button"
              onClick={openCart}
              className="button button-light"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <ShoppingBag size={17} /> Order Online Now
            </button>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-outline-light"
            >
              Get directions <ArrowRight size={17} />
            </a>
            <Link to="/visit" className="button button-outline-light">
              Plan your visit
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
