import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, ArrowLeft, Check, Clock, Heart, MapPin, Phone } from "lucide-react";
import { ADDRESS, PHONE, PageShell } from "@/components/site";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement | Boreal Café" },
      {
        name: "description",
        content:
          "Accessibility commitments for Boreal Café at 351 Water Street, St. John's, NL. Learn about our physical space and digital accessibility standards.",
      },
      { property: "og:title", content: "Accessibility | Boreal Café" },
      {
        property: "og:description",
        content:
          "Boreal Café's commitment to welcoming and accommodating all guests in downtown St. John's.",
      },
    ],
    links: [{ rel: "canonical", href: "/accessibility" }],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <PageShell>
      <section className="policy-hero">
        <div className="shell narrow">
          <Link to="/" className="policy-back-link">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="policy-badge">
            <Accessibility size={14} /> Inclusion & Hospitality
          </div>
          <h1>Accessibility Statement</h1>
          <p className="policy-meta">
            <span>Commitment to All Guests</span>
            <span>·</span>
            <span>351 Water Street, St. John's, NL</span>
          </p>
        </div>
      </section>

      <section className="section policy-content-section">
        <div className="shell narrow policy-body">
          <div className="policy-callout">
            <p>
              At <strong>Boreal Café</strong>, hospitality means creating a warm, inclusive, and
              barrier-free environment where every guest feels welcome, valued, and comfortable—both
              in our physical café space on Water Street and across our digital presence.
            </p>
          </div>

          <article className="policy-block">
            <h2>1. Physical Café Accessibility (351 Water Street)</h2>
            <p>We strive to make your in-person visit as smooth and relaxing as possible:</p>
            <div className="policy-checklist">
              <div>
                <Check size={16} />
                <span>
                  <strong>Accessible Entrance:</strong> Main entry access accommodating wheelchairs,
                  walkers, and strollers.
                </span>
              </div>
              <div>
                <Check size={16} />
                <span>
                  <strong>Flexible Seating Options:</strong> Movable tables and comfortable chairs
                  with wide aisles for easy maneuvering.
                </span>
              </div>
              <div>
                <Check size={16} />
                <span>
                  <strong>Service Animals Welcome:</strong> Certified guide dogs and service animals
                  are warmly welcomed throughout the café in accordance with Newfoundland
                  accessibility laws.
                </span>
              </div>
              <div>
                <Check size={16} />
                <span>
                  <strong>Family Accommodations:</strong> High chairs and seating suitable for
                  toddlers and young children are available upon request.
                </span>
              </div>
              <div>
                <Check size={16} />
                <span>
                  <strong>Staff Assistance:</strong> Our team is trained and delighted to assist
                  with counter orders, table delivery, menu reading, or special seating
                  arrangements.
                </span>
              </div>
            </div>
          </article>

          <article className="policy-block">
            <h2>2. Digital Website Accessibility (WCAG 2.1 AA)</h2>
            <p>
              Our website is developed following the{" "}
              <em>Web Content Accessibility Guidelines (WCAG 2.1) Level AA</em>:
            </p>
            <ul>
              <li>
                <strong>Keyboard Navigation:</strong> Fully operable without requiring a mouse,
                including modal controls and menu navigation.
              </li>
              <li>
                <strong>Color Contrast:</strong> Carefully balanced text-to-background contrast
                meeting accessibility ratios.
              </li>
              <li>
                <strong>Reduced Motion:</strong> Respects system-level{" "}
                <code>prefers-reduced-motion</code> preferences to minimize transitions and
                animations for photosensitive users.
              </li>
              <li>
                <strong>Screen Reader Friendly:</strong> Built with semantic HTML5 landmarks, ARIA
                labels, descriptive image alt text, and logical heading hierarchies.
              </li>
            </ul>
          </article>

          <article className="policy-block">
            <h2>3. Ongoing Improvements & Feedback</h2>
            <p>
              Accessibility is an ongoing journey. If you encounter any barriers or have suggestions
              for how we can make our café or website more accessible to your needs, please reach
              out to us:
            </p>
            <div className="policy-contact-card">
              <div>
                <MapPin size={18} />
                <span>{ADDRESS}</span>
              </div>
              <div>
                <Phone size={18} />
                <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
              </div>
              <div>
                <Heart size={18} />
                <span>We welcome your feedback and are ready to assist you</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
