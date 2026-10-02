import { createFileRoute } from "@tanstack/react-router";
import fogImage from "@/assets/boreal-fog-steam.jpg";
import coffeeImage from "@/assets/boreal-coffee-pastry.jpg";
import streetImage from "@/assets/boreal-water-street-mood.jpg";
import { PageIntro, PageShell } from "@/components/site";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Boreal Café" },
      {
        name: "description",
        content:
          "A visual introduction to the warm, coastal mood of Boreal Café and downtown St. John's.",
      },
      { property: "og:title", content: "Gallery | Boreal Café" },
      { property: "og:description", content: "Coffee, comfort, and Water Street atmosphere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <PageShell>
      <PageIntro
        eyebrow="A glimpse of the mood"
        title="Warm inside. Water Street outside."
        copy="Boreal Café's authentic photo library is still to be added. These editorial mood images express the intended coastal warmth without claiming to show the café itself."
      />
      <section className="section gallery-section">
        <div className="shell gallery-grid">
          <figure className="gallery-a">
            <img
              src={coffeeImage}
              width={1200}
              height={1408}
              loading="lazy"
              alt="Latte and scone in warm window light"
            />
            <figcaption>Coffee & pastry · editorial mood</figcaption>
          </figure>
          <figure className="gallery-b">
            <img
              src={fogImage}
              width={1600}
              height={1056}
              loading="lazy"
              alt="Steaming coffee by a foggy coastal window"
            />
            <figcaption>Coastal quiet · editorial mood</figcaption>
          </figure>
          <figure className="gallery-c">
            <img
              src={streetImage}
              width={1200}
              height={912}
              loading="lazy"
              alt="Atmospheric downtown St. John's street near the harbour"
            />
            <figcaption>St. John's · editorial mood</figcaption>
          </figure>
          <div className="gallery-placeholder">
            <span>Authentic Boreal Café interior photography</span>
            <strong>To be added</strong>
          </div>
          <div className="gallery-placeholder">
            <span>Pastry display & counter details</span>
            <strong>To be added</strong>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
