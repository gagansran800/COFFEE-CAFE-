import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Compass,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  Printer,
  Receipt,
  ShoppingBag,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  clearCart,
  getCart,
  getCartTotals,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart-store";
import {
  getMenuItems,
  saveCafeOrder,
  setLastOrderId,
  type CafeOrder,
  type OrderType,
} from "@/lib/admin-store";
import { trackEvent } from "@/lib/tracker";
import { PHONE, ADDRESS, WHATSAPP_URL } from "./site";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [items, setItems] = useState<CartItem[]>(getCart);
  const [step, setStep] = useState<"cart" | "checkout" | "confirmed">("cart");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Takeout / Counter");
  const [tableNumber, setTableNumber] = useState("Table 1");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CafeOrder["paymentMethod"]>(
    "Credit / Debit (Square)",
  );
  const [tipRate, setTipRate] = useState<number>(0.15); // default 15%
  const [customTip, setCustomTip] = useState<string>("");
  const [placedOrder, setPlacedOrder] = useState<CafeOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync cart on custom event
  useEffect(() => {
    const handleCartSync = () => setItems(getCart());
    window.addEventListener("boreal-cart-updated", handleCartSync);
    return () => window.removeEventListener("boreal-cart-updated", handleCartSync);
  }, []);

  // Reset to cart view when drawer opens, if not confirmed
  useEffect(() => {
    if (isOpen && step !== "confirmed") {
      setStep("cart");
    }
  }, [isOpen]);

  const totals = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Number((sub * 0.15).toFixed(2));
    let tip = 0;
    if (customTip !== "") {
      tip = Math.max(0, parseFloat(customTip) || 0);
    } else {
      tip = Number((sub * tipRate).toFixed(2));
    }
    const total = Number((sub + tax + tip).toFixed(2));
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: Number(sub.toFixed(2)),
      tax,
      tip: Number(tip.toFixed(2)),
      total,
      itemCount,
    };
  }, [items, tipRate, customTip]);

  const handleQty = (id: string, delta: number) => {
    updateCartQuantity(id, delta);
  };

  const handleRemove = (id: string, name: string) => {
    removeFromCart(id);
    toast.info(`Removed ${name} from order`);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      toast.error("Please provide your name and contact phone number.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || "guest@borealcafe.ca",
      orderType,
      tableNumber: orderType === "Dine-in" ? tableNumber : undefined,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
        totalPrice: Number((i.price * i.quantity).toFixed(2)),
        customization: i.customization,
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      tip: totals.tip,
      total: totals.total,
      paymentStatus: "Paid" as const,
      paymentMethod,
      orderStatus: "New" as const,
      specialInstructions: specialInstructions.trim() || undefined,
      estimatedReadyMinutes: 10,
    };

    setTimeout(() => {
      const saved = saveCafeOrder(orderPayload);
      setLastOrderId(saved.id);
      setPlacedOrder(saved);
      clearCart();
      setIsSubmitting(false);
      setStep("confirmed");

      // Track order placement analytics event
      trackEvent("booking_submitted", {
        page: "/order",
        details: {
          orderId: saved.id,
          total: saved.total,
          type: saved.orderType,
          label: `Order #${saved.id} - $${saved.total.toFixed(2)} (${saved.orderType})`,
        },
      });

      toast.success(`Order #${saved.id} Confirmed!`, {
        description: "Sent directly to Boreal Café kitchen counter.",
      });
    }, 450);
  };

  const menuItems = useMemo(() => getMenuItems().slice(0, 4), []);

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Your Order Cart"
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title-row">
            <ShoppingBag size={20} className="header-bag-icon" />
            <div>
              <h3>Your Café Order</h3>
              <p className="cart-header-sub">
                {step === "confirmed"
                  ? "Order Confirmed"
                  : step === "checkout"
                    ? "Complete Guest Details"
                    : `${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"} in order`}
              </p>
            </div>
          </div>
          <button type="button" className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: CART REVIEW */}
        {step === "cart" && (
          <>
            <div className="cart-drawer-body">
              {items.length === 0 ? (
                <div className="empty-cart-state">
                  <div className="empty-icon-wrap">
                    <Coffee size={40} />
                  </div>
                  <h4>Your order bag is empty</h4>
                  <p>Add handcrafted espresso, signature Harbour Fog lattes, and fresh Atlantic bakes.</p>

                  <div className="quick-add-suggestions">
                    <span className="suggestions-label">Popular Favourites:</span>
                    <div className="suggestions-list">
                      {menuItems.map((item) => (
                        <div key={item.id} className="suggestion-item-row">
                          <div>
                            <strong>{item.name}</strong>
                            <span className="sugg-price">{item.price}</span>
                          </div>
                          <button
                            type="button"
                            className="btn-quick-add"
                            onClick={() => {
                              const numPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 5.0;
                              updateCartQuantity(item.id, 1);
                              // Or add to cart
                              setItems(
                                getCart().concat([
                                  {
                                    id: `cart-${Date.now()}`,
                                    menuId: item.id,
                                    name: item.name,
                                    price: numPrice,
                                    category: item.category,
                                    quantity: 1,
                                  },
                                ]),
                              );
                              toast.success(`Added ${item.name} to order!`);
                            }}
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cart-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item-card">
                      <div className="cart-item-main">
                        <div className="item-name-col">
                          <strong className="cart-item-title">{item.name}</strong>
                          <span className="cart-item-category">{item.category}</span>
                          {item.customization && (
                            <span className="cart-item-note">▸ {item.customization}</span>
                          )}
                        </div>
                        <div className="cart-item-price-col">
                          <span className="cart-item-total">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="cart-item-unit">${item.price.toFixed(2)} each</span>
                        </div>
                      </div>

                      <div className="cart-item-controls-row">
                        <div className="qty-picker">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQty(item.id, -1)}
                            title="Decrease quantity"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQty(item.id, 1)}
                            title="Increase quantity"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => handleRemove(item.id, item.name)}
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-financial-summary">
                  <div className="summary-line">
                    <span>Subtotal</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-line">
                    <span>NL Harmonized Sales Tax (HST 15%)</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>

                  {/* Tip Selection */}
                  <div className="tip-selection-row">
                    <span className="tip-label">Staff Gratuity:</span>
                    <div className="tip-pills">
                      {[
                        { label: "10%", rate: 0.1 },
                        { label: "15%", rate: 0.15 },
                        { label: "18%", rate: 0.18 },
                        { label: "None", rate: 0 },
                      ].map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          className={`tip-pill ${tipRate === t.rate && customTip === "" ? "active" : ""}`}
                          onClick={() => {
                            setTipRate(t.rate);
                            setCustomTip("");
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="summary-line total-line">
                    <strong>Estimated Total (CAD)</strong>
                    <strong className="grand-total-amount">${totals.total.toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-proceed-checkout"
                  onClick={() => setStep("checkout")}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: GUEST CHECKOUT DETAILS */}
        {step === "checkout" && (
          <form onSubmit={handlePlaceOrder} className="checkout-form-wrap">
            <div className="cart-drawer-body">
              <button
                type="button"
                className="btn-back-to-cart"
                onClick={() => setStep("cart")}
              >
                ← Back to Order Summary
              </button>

              <div className="checkout-section">
                <h4 className="checkout-sec-title">
                  <UtensilsCrossed size={15} /> 1. How would you like your order?
                </h4>
                <div className="order-type-tabs">
                  {(["Takeout / Counter", "Dine-in", "Advance Pickup"] as OrderType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`type-tab-btn ${orderType === t ? "active" : ""}`}
                      onClick={() => setOrderType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {orderType === "Dine-in" && (
                  <div className="field-group" style={{ marginTop: "0.75rem" }}>
                    <label>Table Number (if currently seated)</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 4 (Window) or Bar Seat"
                      className="drawer-input"
                    />
                  </div>
                )}
              </div>

              <div className="checkout-section">
                <h4 className="checkout-sec-title">
                  <MapPin size={15} /> 2. Guest Information
                </h4>
                <div className="field-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="drawer-input"
                  />
                </div>

                <div className="field-group">
                  <label>Contact Phone (for pickup notification) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 709-552-4809"
                    className="drawer-input"
                  />
                </div>

                <div className="field-group">
                  <label>Email Address (for receipt)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. eleanor@example.ca"
                    className="drawer-input"
                  />
                </div>
              </div>

              <div className="checkout-section">
                <h4 className="checkout-sec-title">
                  <Coffee size={15} /> 3. Kitchen Notes & Instructions
                </h4>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Extra hot, steamed oat milk, allergy notes, package securely..."
                  className="drawer-textarea"
                />
              </div>

              <div className="checkout-section">
                <h4 className="checkout-sec-title">
                  <CreditCard size={15} /> 4. Payment Method
                </h4>
                <div className="payment-options-grid">
                  {(
                    [
                      "Credit / Debit (Square)",
                      "Apple Pay",
                      "Cash",
                      "Interac e-Transfer",
                    ] as CafeOrder["paymentMethod"][]
                  ).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`payment-option-chip ${paymentMethod === m ? "selected" : ""}`}
                      onClick={() => setPaymentMethod(m)}
                    >
                      {paymentMethod === m ? <Check size={14} /> : <CreditCard size={14} />}
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="cart-drawer-footer">
              <div className="checkout-final-breakdown">
                <span>Total to pay:</span>
                <strong>${totals.total.toFixed(2)} CAD</strong>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-proceed-checkout confirm-btn"
              >
                {isSubmitting ? (
                  <span>Sending to Kitchen...</span>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    <span>Confirm & Place Order (${totals.total.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER CONFIRMED RECEIPT SCREEN */}
        {step === "confirmed" && placedOrder && (
          <div className="confirmed-view-container">
            <div className="confirmed-celebration">
              <div className="success-badge-glow">
                <CheckCircle2 size={44} />
              </div>
              <span className="order-placed-tag">Order Received by Kitchen</span>
              <h2>Thank You, {placedOrder.customerName}!</h2>
              <p className="order-ready-estimate">
                <Clock size={15} /> Estimated ready in ~{placedOrder.estimatedReadyMinutes || 10} mins
              </p>
            </div>

            {/* Receipt Ticket Box */}
            <div className="confirmed-receipt-ticket">
              <div className="ticket-header">
                <strong>BOREAL CAFÉ</strong>
                <span>351 Water St, St. John's, NL</span>
                <span className="ticket-id">Order Ticket #{placedOrder.id}</span>
              </div>

              <div className="ticket-divider" />

              <div className="ticket-meta">
                <div>
                  <span className="label">Service:</span>
                  <strong>{placedOrder.orderType}</strong>
                </div>
                {placedOrder.tableNumber && (
                  <div>
                    <span className="label">Table:</span>
                    <strong>{placedOrder.tableNumber}</strong>
                  </div>
                )}
                <div>
                  <span className="label">Payment:</span>
                  <strong>{placedOrder.paymentMethod}</strong>
                </div>
              </div>

              <div className="ticket-divider" />

              <div className="ticket-items">
                {placedOrder.items.map((item) => (
                  <div key={item.id} className="ticket-item-row">
                    <span>
                      {item.quantity}x {item.name}
                      {item.customization && (
                        <small className="ticket-item-mod"> ({item.customization})</small>
                      )}
                    </span>
                    <strong>${item.totalPrice.toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div className="ticket-divider" />

              <div className="ticket-totals">
                <div className="t-row">
                  <span>Subtotal:</span>
                  <span>${placedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="t-row">
                  <span>HST (15%):</span>
                  <span>${placedOrder.tax.toFixed(2)}</span>
                </div>
                {placedOrder.tip !== undefined && placedOrder.tip > 0 && (
                  <div className="t-row">
                    <span>Staff Tip:</span>
                    <span>${placedOrder.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="t-row total">
                  <strong>Total Paid (CAD):</strong>
                  <strong>${placedOrder.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* WhatsApp notification action */}
            <div className="confirmed-actions">
              <button
                type="button"
                className="button button-track-live"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(
                    new CustomEvent("boreal-open-track", {
                      detail: { orderId: placedOrder.id },
                    }),
                  );
                }}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #123424 0%, #0c2419 100%)",
                  color: "#6ee7b7",
                  border: "1px solid rgba(110, 231, 183, 0.4)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Compass size={16} /> Track Order & 1-Min Cancel Window
              </button>

              <a
                href={`https://wa.me/17095524809?text=${encodeURIComponent(
                  `Hello Boreal Café! I have placed Order #${placedOrder.id} for ${placedOrder.customerName} (${placedOrder.orderType}):\n${placedOrder.items.map((i) => `• ${i.quantity}x ${i.name}`).join("\n")}\nTotal: $${placedOrder.total.toFixed(2)}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="button button-whatsapp"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Send Order Copy via WhatsApp
              </a>

              <button
                type="button"
                className="button button-secondary"
                onClick={() => window.print()}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Printer size={15} /> Print Ticket Receipt
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={onClose}
                style={{ width: "100%", justifyContent: "center" }}
              >
                Done / Back to Café
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
