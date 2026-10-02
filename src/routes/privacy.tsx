import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import { ADDRESS, PHONE, PageShell } from "@/components/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Boreal Café" },
      {
        name: "description",
        content:
          "Privacy Policy for Boreal Café at 351 Water Street in St. John's, Newfoundland. Learn how we handle your personal information and reservations.",
      },
      { property: "og:title", content: "Privacy Policy | Boreal Café" },
      {
        property: "og:description",
        content: "Learn how Boreal Café protects your privacy and personal data.",
      },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell>
      <section className="policy-hero">
        <div className="shell narrow">
          <Link to="/" className="policy-back-link">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="policy-badge">
            <ShieldCheck size={14} /> Legal & Privacy
          </div>
          <h1>Privacy Policy</h1>
          <p className="policy-meta">
            <span>Effective Date: October 2026</span>
            <span>·</span>
            <span>Boreal Café, 351 Water St, St. John's, NL</span>
          </p>
        </div>
      </section>

      <section className="section policy-content-section">
        <div className="shell narrow policy-body">
          <div className="policy-callout">
            <p>
              At <strong>Boreal Café</strong>, we value your privacy and trust. This policy
              describes how we collect, use, and safeguard your personal information when you visit
              our website, submit table reservations, or contact us.
            </p>
          </div>

          <article className="policy-block">
            <h2>1. Information We Collect</h2>
            <p>
              We only collect information that is voluntarily provided by you or necessary to
              provide our hospitality services:
            </p>
            <ul>
              <li>
                <strong>Table Reservation Information:</strong> Your name, phone number, email
                address, party size, preferred time slot, and seating preferences when you submit a
                reservation request.
              </li>
              <li>
                <strong>Direct Communications:</strong> Information provided when contacting us by
                phone or email regarding menu inquiries, dietary needs, or lost items.
              </li>
              <li>
                <strong>Website Usage Data:</strong> Standard technical information such as browser
                type, approximate device type, and referring pages, collected anonymously to ensure
                optimal site performance.
              </li>
            </ul>
          </article>

          <article className="policy-block">
            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information strictly for legitimate hospitality purposes:</p>
            <ul>
              <li>To confirm, accommodate, and manage your table reservations.</li>
              <li>
                To contact you if there are changes to your reservation, hours of operation, or
                severe weather closures in St. John's.
              </li>
              <li>To answer customer service requests and improve our offerings.</li>
              <li>
                We <strong>never sell, rent, or trade</strong> your personal information to third
                parties or marketing brokers.
              </li>
            </ul>
          </article>

          <article className="policy-block">
            <h2>3. Information Storage & Security</h2>
            <p>
              Your reservation details and contact information are protected using industry-standard
              technical measures. Access is restricted exclusively to authorized café management and
              staff responsible for guest seating and communication.
            </p>
          </article>

          <article className="policy-block">
            <h2>4. Third-Party Links & Services</h2>
            <p>
              Our website provides links to external services such as Google Maps for directions and
              social media platforms (Instagram, YouTube, Facebook). When navigating to external
              platforms, their respective privacy policies apply.
            </p>
          </article>

          <article className="policy-block">
            <h2>5. Canadian Privacy Compliance (PIPEDA)</h2>
            <p>
              Boreal Café complies with the{" "}
              <em>Personal Information Protection and Electronic Documents Act (PIPEDA)</em> and
              applicable Newfoundland and Labrador provincial privacy laws. You may request access
              to, correction of, or deletion of your contact information at any time.
            </p>
          </article>

          <article className="policy-block">
            <h2>6. Contact Our Privacy Team</h2>
            <p>
              If you have any questions or requests regarding your personal information, please
              contact us:
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
                <Clock size={18} />
                <span>Downtown St. John's, Newfoundland & Labrador</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
