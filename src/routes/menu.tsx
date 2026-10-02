import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Coffee,
  Croissant,
  Filter,
  Info,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageIntro, PageShell, useCart } from "@/components/site";
import { getMenuItems, type MenuItem } from "@/lib/admin-store";
import { addToCart, getCart, updateCartQuantity } from "@/lib/cart-store";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu & Online Ordering | Boreal Café Water Street" },
      {
        name: "description",
        content:
          "Browse Boreal Café's full menu with prices: artisanal espresso, signature Harbour Fog tea lattes, and fresh Atlantic pastries. Order online for dine-in or pickup.",
      },
      { property: "og:title", content: "Menu & Online Ordering | Boreal Café" },
      {
        property: "og:description",
        content:
          "Complete drink and pastry menu with prices. Double espresso, Harbour Fog lattes, pecan scones, and more.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

export function MenuPage() {
  const { openCart, cartCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [cartItems, setCartItems] = useState(getCart);

  // Sync cart items when cart changes
  useEffect(() => {
    const handleSync = () => setCartItems(getCart());
    window.addEventListener("boreal-cart-updated", handleSync);
    return () => window.removeEventListener("boreal-cart-updated", handleSync);
  }, []);

  const allMenuItems = useMemo(() => getMenuItems(), []);

  const categories = useMemo(() => {
    return [
      "All",
      "Coffee",
      "Tea & specialty drinks",
      "Pastries & treats",
      "Counter specialties",
    ];
  }, []);

  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.dietary && item.dietary.some((d) => d.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    });
  }, [allMenuItems, selectedCategory, search]);

  const handleAdd = (item: MenuItem) => {
    const numPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 5.0;
    addToCart({
      menuId: item.id,
      name: item.name,
      price: numPrice,
      category: item.category,
    });
    setCartItems(getCart());
    toast.success(`Added ${item.name} to order (${item.price})`, {
      description: "Click your Order Bag to review or checkout.",
      action: {
        label: "View Bag",
        onClick: () => openCart(),
      },
    });
  };

  const getItemCartQty = (menuId: string): number => {
    const match = cartItems.find((c) => c.menuId === menuId);
    return match ? match.quantity : 0;
  };

  return (
    <PageShell>
      <PageIntro
        eyebrow="351 Water Street · Artisanal Roastery & Kitchen"
        title="Handcrafted Coffee & Daily Bakes"
        copy="Double espresso extractions, organic tea infusions, and fresh-baked Atlantic pastries. Every item displays its transparent price — select items to order directly for dine-in or counter pickup."
      />

      {/* Menu Header Online Ordering Banner */}
      <section className="menu-ordering-strip">
        <div className="shell menu-strip-inner">
          <div className="strip-left">
            <div className="strip-icon-circle">
              <ShoppingBag size={20} />
            </div>
            <div>
              <strong>Order Online for Takeout, Counter Pickup or Table Delivery</strong>
              <p>Place your order directly. Freshly prepared in our Water Street roastery.</p>
            </div>
          </div>
          <button
            type="button"
            className="button button-order-header-cta"
            onClick={openCart}
            aria-label="Open your café order cart"
          >
            <ShoppingBag size={16} />
            <span>Open Order Bag ({cartCount})</span>
          </button>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="menu-controls-section">
        <div className="shell menu-controls-inner">
          <div className="menu-search-box">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drinks, treats, vegan options, scones..."
              aria-label="Search menu items"
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="menu-category-pills" role="tablist" aria-label="Menu categories">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`category-pill-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" && <Sparkles size={13} />}
                {cat === "Coffee" && <Coffee size={13} />}
                {cat === "Tea & specialty drinks" && <UtensilsCrossed size={13} />}
                {cat === "Pastries & treats" && <Croissant size={13} />}
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Menu Cards Section */}
      <section className="section menu-cards-section">
        <div className="shell">
          <div className="menu-results-meta">
            <span>
              Showing <strong>{filteredItems.length}</strong> item
              {filteredItems.length === 1 ? "" : "s"}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="menu-empty-results">
              <Coffee size={40} />
              <h3>No menu items match your search</h3>
              <p>Try searching for a different drink, pastry, or browse all categories.</p>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="menu-cards-grid">
              {filteredItems.map((item) => {
                const inCartQty = getItemCartQty(item.id);
                return (
                  <article key={item.id} className="menu-product-card full-page-card">
                    <div className="card-top-meta">
                      <span className="product-category-tag">{item.category}</span>
                      {item.dietary && item.dietary.length > 0 && (
                        <div className="dietary-tags-row">
                          {item.dietary.map((d) => (
                            <span key={d} className="product-dietary-badge">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="card-title-price-row">
                      <h2 className="product-title">{item.name}</h2>
                      <div className="price-container">
                        <span className="product-price">{item.price}</span>
                        <span className="currency-label">CAD</span>
                      </div>
                    </div>

                    <p className="product-description">{item.description}</p>

                    <div className="card-action-row">
                      <div className="price-tag-sub">
                        <strong>{item.price}</strong>
                        <span>+ 15% HST</span>
                      </div>

                      {inCartQty > 0 ? (
                        <div className="in-cart-btn-group">
                          <button
                            type="button"
                            className="qty-action-btn"
                            onClick={() => {
                              const match = cartItems.find((c) => c.menuId === item.id);
                              if (match) updateCartQuantity(match.id, -1);
                            }}
                            title="Decrease quantity"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="in-cart-count">{inCartQty} in bag</span>
                          <button
                            type="button"
                            className="qty-action-btn"
                            onClick={() => handleAdd(item)}
                            title="Add another"
                            aria-label="Add another"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      ) : (
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
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Bottom Callout & Order Bag Bar */}
          <div className="menu-bottom-dock">
            <div className="menu-dock-inner">
              <div className="dock-left">
                <Info size={18} />
                <div>
                  <strong>Dietary & Allergy Accommodations</strong>
                  <p>
                    Oat milk, almond milk, and vegan treats available daily. Please include any allergy
                    requests in your order notes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="button button-primary dock-checkout-btn"
                onClick={openCart}
              >
                <ShoppingBag size={17} />
                <span>
                  {cartCount > 0 ? `Review Order (${cartCount}) & Checkout` : "Start Order"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
