import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Coffee, MessageCircle } from "lucide-react";
import coffeeImage from "@/assets/boreal-coffee-pastry.jpg";
import { PageIntro, PageShell } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Boreal Café on Water Street" },
      {
        name: "description",
        content:
          "Discover the cozy, community-oriented atmosphere of Boreal Café in downtown St. John's.",
      },
      { property: "og:title", content: "About Boreal Café" },
      {
        property: "og:description",
        content:
          "A relaxed place for coffee, conversation, and comfortable everyday visits on Water Street.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <PageIntro
        eyebrow="The café"
        title="More than a coffee stop."
        copy="Boreal Café is a comfortable place for coffee, conversation, reading, and unhurried time in downtown St. John's."
      />
      <section className="section">
        <div className="shell story-grid">
          <figure className="editorial-image tall">
            <img
              src={coffeeImage}
              width={1200}
              height={1408}
              loading="lazy"
              alt="Latte and scone in a calm, warm setting"
            />
            <figcaption>Menu mood · authentic café photography to come</figcaption>
          </figure>
          <div className="story-copy">
            <p className="eyebrow">Come as you are</p>
            <h2>A café shaped around the way people gather.</h2>
            <p>
              Some visits are a quick takeaway. Others are a long conversation, a quiet chapter, a
              game at the table, or a pause between downtown errands. Boreal makes room for all of
              them.
            </p>
            <div className="value-list">
              <div>
                <Coffee />
                <h3>Good things to sip</h3>
                <p>Coffee, tea lattes, and cold drinks with pastries and treats.</p>
              </div>
              <div>
                <MessageCircle />
                <h3>Room to connect</h3>
                <p>Comfortable seating and a relaxed atmosphere for easy conversation.</p>
              </div>
              <div>
                <BookOpen />
                <h3>Time of your own</h3>
                <p>Books, games, photography, and a quieter pace than some cafés.</p>
              </div>
            </div>
            <Link to="/visit" className="inline-link">
              Plan a visit <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
