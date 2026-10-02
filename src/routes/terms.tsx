import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, FileText, MapPin, Phone } from "lucide-react";
import { ADDRESS, PHONE, PageShell } from "@/components/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Boreal Café" },
      {
        name: "description",
        content:
          "Terms of Service and Customer Guidelines for Boreal Café at 351 Water Street, downtown St. John's, NL.",
      },
      { property: "og:title", content: "Terms of Service | Boreal Café" },
      {
        property: "og:description",
        content:
          "Understand the terms and policies for visiting Boreal Café and using our website.",
      },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell>
      <section className="policy-hero">
        <div className="shell narrow">
          <Link to="/" className="policy-back-link">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="policy-badge">
            <FileText size={14} /> Legal & Terms
          </div>
          <h1>Terms of Service</h1>
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
              Welcome to <strong>Boreal Café</strong>. By accessing our website, browsing our
              offerings, or submitting a table reservation request, you agree to these Terms of
              Service.
            </p>
          </div>

          <article className="policy-block">
            <h2>1. Table Reservations & Seating</h2>
            <ul>
              <li>
                <strong>Reservation Requests:</strong> All table reservation submissions through our
                website are subject to availability and seating confirmation by our staff.
              </li>
              <li>
                <strong>Arrival Grace Period:</strong> We hold reserved tables for up to 15 minutes
                past your scheduled reservation time. If your arrival is delayed due to weather or
                traffic, please notify us at <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
                .
              </li>
              <li>
                <strong>Cancellations:</strong> If your plans change, we appreciate advance notice
                so other guests can be accommodated. There are no cancellation fees for standard
                cafe reservations.
              </li>
            </ul>
          </article>

          <article className="policy-block">
            <h2>2. Food, Beverage & Dietary Disclaimers</h2>
            <ul>
              <li>
                <strong>Artisanal Availability:</strong> Our daily pastries, scones, and featured
                single-origin roasts are prepared fresh in limited batches. Specific items may sell
                out during busy hours.
              </li>
              <li>
                <strong>Allergens & Dietary Options:</strong> While we offer alternative milks and
                select dietary options, our kitchen and counter prepare products containing dairy,
                gluten, nuts, and other allergens. Please inform our staff of any severe allergies
                before ordering.
              </li>
            </ul>
          </article>

          <article className="policy-block">
            <h2>3. In-Café Community Standards</h2>
            <p>
              Boreal Café is designed to be an unhurried, welcoming refuge on Water Street. We ask
              all guests to respect the comfort of fellow patrons:
            </p>
            <ul>
              <li>
                Please keep volume respectful when taking phone calls or listening to media
                (earphones are appreciated).
              </li>
              <li>
                Our books, board games, and shared reading materials are available for guest
                enjoyment during your visit; please return them to the shelves when finished.
              </li>
            </ul>
          </article>

          <article className="policy-block">
            <h2>4. Website Content & Intellectual Property</h2>
            <p>
              All trademarks, photography, typography, logos, and editorial descriptions on this
              website are the property of Boreal Café. Unauthorized reproduction or commercial
              redistribution without prior written consent is strictly prohibited.
            </p>
          </article>

          <article className="policy-block">
            <h2>5. Questions & Contact Information</h2>
            <p>
              For questions or special arrangements regarding our Terms of Service, please reach out
              directly:
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
                <span>Dine-in & Takeaway · Downtown St. John's</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
