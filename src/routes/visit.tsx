import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ADDRESS,
  DIRECTIONS_URL,
  EMAIL,
  EMAIL_URL,
  PHONE,
  PageIntro,
  PageShell,
  WHATSAPP_URL,
  WhatsAppIcon,
} from "@/components/site";
import { FAQSection, FAQS_LIST } from "@/components/faq-section";
import { trackFormSubmission } from "@/lib/tracker";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit Boreal Café | 351 Water Street, St. John's" },
      {
        name: "description",
        content:
          "Plan your visit to Boreal Café at 351 Water Street in downtown St. John's. Explore 10 guest FAQs, directions, WhatsApp chat, and table reservations.",
      },
      { property: "og:title", content: "Visit Boreal Café on Water Street · 10 Guest FAQs" },
      {
        property: "og:description",
        content:
          "Directions, parking, dietary options, table reservations, and 10 frequently asked questions for Boreal Café in downtown St. John's.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/visit" }],
    scripts: [
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
  component: VisitPage,
});

function VisitPage() {
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;
  return (
    <PageShell>
      <PageIntro
        eyebrow="Downtown St. John's"
        title="Find us on Water Street."
        copy="Coffee, tea, pastries, and a comfortable place to pause at 351 Water Street."
      />
      <section className="visit-panel">
        <div className="map-wrap">
          <iframe
            src={mapUrl}
            title="Map showing Boreal Café at 351 Water Street"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="visit-card">
          <div>
            <MapPin />
            <p className="eyebrow">Address</p>
            <address>
              351 Water St
              <br />
              St. John's, NL A1C 1C2
              <br />
              Canada
            </address>
          </div>
          <div>
            <Phone />
            <p className="eyebrow">Phone & WhatsApp</p>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
          </div>
          <div>
            <Mail />
            <p className="eyebrow">Email</p>
            <a href={EMAIL_URL}>{EMAIL}</a>
          </div>
          <div>
            <Clock />
            <p className="eyebrow">Opening hours</p>
            <p>Current weekly hours to be verified.</p>
          </div>
          <div className="visit-buttons">
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-primary"
            >
              Get directions <ArrowUpRight size={17} />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="button button-whatsapp"
            >
              <WhatsAppIcon size={16} /> WhatsApp
            </a>
            <a href={EMAIL_URL} className="button button-secondary">
              <Mail size={16} /> Email
            </a>
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="button button-secondary">
              Call us
            </a>
          </div>
          <p className="service-note">Dine-in · Takeaway</p>
        </div>
      </section>

      {/* Guest Contact & Direct Message Form */}
      <ContactInquirySection />

      {/* 10 FAQ and Question Answer Part with Stylish Texture */}
      <FAQSection />
    </PageShell>
  );
}

function ContactInquirySection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formName, setFormName] = useState("General Visit Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Please enter your name and message.");
      return;
    }

    trackFormSubmission({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      formName,
      message: message.trim(),
      page: "/visit",
      source: "Website Visit Page",
      status: "New",
    });

    setSubmitted(true);
    toast.success("Thank you! Your message has been sent to our café team.");
  };

  return (
    <section className="section contact-form-section">
      <div className="shell contact-form-inner">
        <div className="contact-form-header">
          <p className="eyebrow">Direct Inquiries</p>
          <h2>Send Us a Message</h2>
          <p>
            Have a question about group reservations, daily pastry selections, or private events?
            Drop us a note below and our Water Street team will respond promptly.
          </p>
        </div>

        {submitted ? (
          <div className="contact-success-box">
            <CheckCircle2 size={40} className="success-icon" />
            <h3>Message Received</h3>
            <p>
              Thank you, <strong>{name}</strong>! We have received your inquiry regarding{" "}
              <em>{formName}</em>. A member of our staff will reach out to you shortly.
            </p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setSubmitted(false);
                setName("");
                setPhone("");
                setEmail("");
                setMessage("");
              }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-inquiry-form">
            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="inq-name">Your Full Name *</label>
                <input
                  id="inq-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aman Patel"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="inq-phone">Contact Phone</label>
                <input
                  id="inq-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 709-555-0123"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label htmlFor="inq-email">Email Address</label>
                <input
                  id="inq-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="form-field">
                <label htmlFor="inq-cat">Topic / Inquiry Type</label>
                <select id="inq-cat" value={formName} onChange={(e) => setFormName(e.target.value)}>
                  <option value="General Visit Inquiry">General Visit Inquiry</option>
                  <option value="Group / Private Event">Group / Private Event (Evening)</option>
                  <option value="Office Coffee & Pastry Catering">
                    Office Coffee & Pastry Catering
                  </option>
                  <option value="Special Dietary / Allergy Request">
                    Special Dietary / Allergy Request
                  </option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="inq-msg">Your Message *</label>
              <textarea
                id="inq-msg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you'd like to arrange or ask..."
                required
              />
            </div>

            <button type="submit" className="button button-primary">
              <Send size={15} /> Send Message to Boreal Café
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
