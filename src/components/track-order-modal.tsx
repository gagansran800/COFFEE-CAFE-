import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Compass,
  Copy,
  Phone,
  Printer,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  cancelCafeOrder,
  getCafeOrders,
  getLastOrderId,
  setLastOrderId,
  type CafeOrder,
  type OrderStatus,
} from "@/lib/admin-store";
import { ADDRESS, PHONE, WHATSAPP_URL } from "./site";

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string | undefined;
}

export function TrackOrderModal({ isOpen, onClose, initialOrderId }: TrackOrderModalProps) {
  const [orders, setOrders] = useState<CafeOrder[]>(getCafeOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [now, setNow] = useState(Date.now());
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  // Sync orders with localStorage and custom events
  useEffect(() => {
    const handleUpdate = () => {
      setOrders(getCafeOrders());
    };
    window.addEventListener("boreal-store-updated", handleUpdate);
    return () => window.removeEventListener("boreal-store-updated", handleUpdate);
  }, []);

  // Live timer tick for accurate 1-minute countdown
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Determine initial order to select
  useEffect(() => {
    if (!isOpen) return;
    const currentOrders = getCafeOrders();
    setOrders(currentOrders);

    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
      setSearchQuery(initialOrderId);
      return;
    }

    const lastId = getLastOrderId();
    if (lastId && currentOrders.some((o) => o.id === lastId)) {
      setSelectedOrderId(lastId);
      setSearchQuery(lastId);
    } else if (currentOrders.length > 0 && currentOrders[0]) {
      // Default to most recently placed order
      const first = currentOrders[0];
      setSelectedOrderId(first.id);
      setSearchQuery(first.id);
    }
  }, [isOpen, initialOrderId]);

  // Find currently selected order
  const activeOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Filter orders matching search
  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders.slice(0, 5);
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q),
    );
  }, [orders, searchQuery]);

  // Cancellation 1-minute logic
  const cancellationInfo = useMemo(() => {
    if (!activeOrder) return { canCancel: false, remainingSeconds: 0, elapsedSeconds: 0 };
    if (activeOrder.orderStatus === "Cancelled" || activeOrder.orderStatus === "Completed") {
      return { canCancel: false, remainingSeconds: 0, elapsedSeconds: 0 };
    }

    const elapsed = Math.floor((now - activeOrder.createdAt) / 1000);
    const remaining = Math.max(0, 60 - elapsed);
    return {
      canCancel: remaining > 0,
      remainingSeconds: remaining,
      elapsedSeconds: elapsed,
    };
  }, [activeOrder, now]);

  const handleSelectOrder = (order: CafeOrder) => {
    setSelectedOrderId(order.id);
    setSearchQuery(order.id);
    setLastOrderId(order.id);
    setIsConfirmingCancel(false);
  };

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    const res = cancelCafeOrder(activeOrder.id, "Customer self-cancelled within 1-minute grace window");
    if (res.success) {
      toast.success(`Order #${activeOrder.id} Cancelled`, {
        description: "Your order was successfully cancelled. You will not be charged.",
      });
      setIsConfirmingCancel(false);
      setOrders(getCafeOrders());
    } else {
      toast.error(res.message);
    }
  };

  const handleCopyId = () => {
    if (!activeOrder) return;
    navigator.clipboard.writeText(activeOrder.id);
    toast.success(`Order ID #${activeOrder.id} copied to clipboard!`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const pipelineStages: { id: OrderStatus; label: string; icon: typeof Clock }[] = [
    { id: "New", label: "Order Received", icon: Clock },
    { id: "Preparing", label: "In Kitchen", icon: Coffee },
    { id: "Ready for Pickup", label: "Ready for Pickup", icon: CheckCircle2 },
    { id: "Completed", label: "Fulfilled / Complete", icon: Check },
  ];

  const getStepState = (stageId: OrderStatus, currentStatus: OrderStatus) => {
    if (currentStatus === "Cancelled") return "cancelled";
    const orderIndex = pipelineStages.findIndex((s) => s.id === currentStatus);
    const thisIndex = pipelineStages.findIndex((s) => s.id === stageId);
    if (thisIndex < orderIndex) return "completed";
    if (thisIndex === orderIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="track-modal-backdrop" onClick={onClose}>
      <aside
        className="track-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Track Your Order"
      >
        {/* Modal Header */}
        <div className="track-modal-header">
          <div className="track-header-title-row">
            <div className="track-icon-badge">
              <Compass size={20} />
            </div>
            <div>
              <h3>Track & Cancel Order</h3>
              <p className="track-header-sub">
                Live Kitchen Status · 1-Minute Free Cancellation Window
              </p>
            </div>
          </div>
          <button
            type="button"
            className="track-close-btn"
            onClick={onClose}
            aria-label="Close tracking window"
          >
            <X size={20} />
          </button>
        </div>

        <div className="track-modal-body">
          {/* Order Search / Quick Finder */}
          <div className="track-search-card">
            <label className="track-search-label" htmlFor="track-search-input">
              <Search size={14} /> Look up order by Order ID, Phone or Name:
            </label>
            <div className="track-search-input-wrap">
              <input
                id="track-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. ORD-9422 or (709) 552-4809"
                className="track-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick Order Selector Chips */}
            {orders.length > 0 && (
              <div className="recent-orders-chips-row">
                <span className="chips-label">Recent Orders:</span>
                <div className="chips-list">
                  {orders.slice(0, 4).map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      className={`order-chip-btn ${selectedOrderId === o.id ? "active" : ""}`}
                      onClick={() => handleSelectOrder(o)}
                    >
                      <span className="chip-id">#{o.id}</span>
                      <span className={`chip-status status-${o.orderStatus.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
                        {o.orderStatus}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE ORDER DETAILS VIEW */}
          {activeOrder ? (
            <div className="active-order-tracking-view">
              {/* Order Status Ribbon */}
              <div className={`order-status-banner banner-${activeOrder.orderStatus.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}>
                <div className="banner-status-left">
                  {activeOrder.orderStatus === "Cancelled" ? (
                    <XCircle size={24} className="banner-icon-cancel" />
                  ) : activeOrder.orderStatus === "Completed" ? (
                    <CheckCircle2 size={24} className="banner-icon-done" />
                  ) : activeOrder.orderStatus === "Ready for Pickup" ? (
                    <ShoppingBag size={24} className="banner-icon-ready" />
                  ) : activeOrder.orderStatus === "Preparing" ? (
                    <Coffee size={24} className="banner-icon-prep" />
                  ) : (
                    <Clock size={24} className="banner-icon-new" />
                  )}

                  <div>
                    <div className="banner-status-title-row">
                      <span className="banner-status-name">
                        {activeOrder.orderStatus === "New" && "Order Received"}
                        {activeOrder.orderStatus === "Preparing" && "Kitchen Preparing Order"}
                        {activeOrder.orderStatus === "Ready for Pickup" && "Ready for Collection / Table Delivery"}
                        {activeOrder.orderStatus === "Completed" && "Order Fulfilled"}
                        {activeOrder.orderStatus === "Cancelled" && "Order Cancelled"}
                      </span>
                      <span className="order-id-tag">#{activeOrder.id}</span>
                    </div>
                    <p className="banner-status-desc">
                      {activeOrder.orderStatus === "New" &&
                        "Your order has been sent to our barista counter at 351 Water Street."}
                      {activeOrder.orderStatus === "Preparing" &&
                        "Our team is pulling shots, steaming milk, and plating fresh pastries."}
                      {activeOrder.orderStatus === "Ready for Pickup" &&
                        "Your order is packaged and waiting at the counter / on its way to your table!"}
                      {activeOrder.orderStatus === "Completed" &&
                        "Thank you for visiting Boreal Café. Enjoy your handcrafted beverage!"}
                      {activeOrder.orderStatus === "Cancelled" &&
                        (activeOrder.cancelledReason || "This order was cancelled within the 1-minute grace window.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="copy-id-btn"
                  onClick={handleCopyId}
                  title="Copy Order ID"
                >
                  <Copy size={14} /> Copy ID
                </button>
              </div>

              {/* 1-MINUTE CANCELLATION BOX (REQUESTED FEATURE) */}
              {activeOrder.orderStatus !== "Cancelled" && activeOrder.orderStatus !== "Completed" && (
                <div
                  className={`cancellation-countdown-box ${
                    cancellationInfo.canCancel ? "active-window" : "expired-window"
                  }`}
                >
                  {cancellationInfo.canCancel ? (
                    <>
                      <div className="cancellation-top-row">
                        <div className="cancellation-title-group">
                          <span className="cancellation-alert-badge">
                            <Clock size={14} /> 1-MINUTE CANCELLATION WINDOW ACTIVE
                          </span>
                          <strong className="cancellation-headline">
                            Cancel free of charge within 1 minute
                          </strong>
                          <p className="cancellation-sub">
                            Changed your mind or want to modify your order? You can cancel immediately
                            before our baristas begin grinding your beans.
                          </p>
                        </div>

                        {/* Live 60-Second Countdown Dial */}
                        <div className="countdown-timer-dial">
                          <span className="timer-digits">
                            00:{cancellationInfo.remainingSeconds.toString().padStart(2, "0")}
                          </span>
                          <span className="timer-label">SEC REMAINING</span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="countdown-progress-track">
                        <div
                          className="countdown-progress-fill"
                          style={{ width: `${(cancellationInfo.remainingSeconds / 60) * 100}%` }}
                        />
                      </div>

                      {/* Cancel Action Button */}
                      {!isConfirmingCancel ? (
                        <div className="cancel-action-row">
                          <button
                            type="button"
                            className="btn-customer-cancel-order"
                            onClick={() => setIsConfirmingCancel(true)}
                          >
                            <XCircle size={16} />
                            <span>Cancel This Order</span>
                          </button>
                          <span className="cancel-terms-note">
                            Full instant cancellation · Kitchen receives notification immediately
                          </span>
                        </div>
                      ) : (
                        <div className="cancel-confirm-box">
                          <div className="confirm-text">
                            <AlertCircle size={18} className="text-destructive" />
                            <strong>Confirm Cancellation of Order #{activeOrder.id}?</strong>
                          </div>
                          <div className="confirm-btns">
                            <button
                              type="button"
                              className="btn-confirm-yes"
                              onClick={handleCancelOrder}
                            >
                              Yes, Cancel Order Now
                            </button>
                            <button
                              type="button"
                              className="btn-confirm-no"
                              onClick={() => setIsConfirmingCancel(false)}
                            >
                              Keep Order
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="cancellation-expired-content">
                      <div className="expired-left">
                        <Clock size={16} className="text-muted" />
                        <div>
                          <strong>1-Minute Self-Cancellation Window Has Ended</strong>
                          <p>
                            Kitchen preparation is actively underway. If you need urgent assistance,
                            call the café counter directly.
                          </p>
                        </div>
                      </div>
                      <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="btn-call-counter-mini">
                        <Phone size={13} /> Call (709) 552-4809
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* 4-STAGE PIPELINE PROGRESS */}
              {activeOrder.orderStatus !== "Cancelled" && (
                <div className="track-pipeline-card">
                  <span className="pipeline-title">Order Lifecycle Progress</span>
                  <div className="pipeline-track-row">
                    {pipelineStages.map((stage, idx) => {
                      const state = getStepState(stage.id, activeOrder.orderStatus);
                      const Icon = stage.icon;
                      return (
                        <div key={stage.id} className={`pipeline-node-wrap state-${state}`}>
                          <div className="node-circle">
                            <Icon size={14} />
                          </div>
                          <span className="node-label">{stage.label}</span>
                          {idx < pipelineStages.length - 1 && <div className="node-line" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ORDER DETAILS & RECEIPT SUMMARY */}
              <div className="track-receipt-card printable-ticket">
                <div className="receipt-header-strip">
                  <div className="receipt-logo-title">
                    <span className="receipt-brand-mark">B</span>
                    <div>
                      <strong>BOREAL CAFÉ</strong>
                      <span>351 Water St, St. John's, NL</span>
                    </div>
                  </div>
                  <div className="receipt-ticket-meta">
                    <span className="ticket-number">Ticket #{activeOrder.id}</span>
                    <span className="ticket-type">{activeOrder.orderType}</span>
                  </div>
                </div>

                <div className="receipt-dashed-line" />

                <div className="receipt-customer-details">
                  <div>
                    <span className="rc-label">Customer:</span>
                    <strong>{activeOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="rc-label">Phone:</span>
                    <span>{activeOrder.customerPhone}</span>
                  </div>
                  {activeOrder.tableNumber && (
                    <div>
                      <span className="rc-label">Table:</span>
                      <strong>{activeOrder.tableNumber}</strong>
                    </div>
                  )}
                  <div>
                    <span className="rc-label">Payment:</span>
                    <span>{activeOrder.paymentMethod}</span>
                  </div>
                </div>

                <div className="receipt-dashed-line" />

                {/* Items */}
                <div className="receipt-items-list">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="receipt-item-row">
                      <div className="item-qty-name">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                        {item.customization && (
                          <small className="item-mod"> ({item.customization})</small>
                        )}
                      </div>
                      <strong className="item-price">${item.totalPrice.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                {activeOrder.specialInstructions && (
                  <div className="receipt-notes-box">
                    <span>Note to Kitchen:</span>
                    <p>"{activeOrder.specialInstructions}"</p>
                  </div>
                )}

                <div className="receipt-dashed-line" />

                {/* Totals */}
                <div className="receipt-totals-section">
                  <div className="rt-line">
                    <span>Subtotal</span>
                    <span>${activeOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="rt-line">
                    <span>NL HST (15%)</span>
                    <span>${activeOrder.tax.toFixed(2)}</span>
                  </div>
                  {activeOrder.tip !== undefined && activeOrder.tip > 0 && (
                    <div className="rt-line">
                      <span>Staff Gratuity</span>
                      <span>${activeOrder.tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="rt-line grand-total-line">
                    <strong>Total (CAD)</strong>
                    <strong className="receipt-grand-price">${activeOrder.total.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="track-modal-actions-row">
                <a
                  href={`https://wa.me/17095524809?text=${encodeURIComponent(
                    `Hello Boreal Café! I am tracking Order #${activeOrder.id} (${activeOrder.customerName}, ${activeOrder.orderType}). Status: ${activeOrder.orderStatus}.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="track-action-btn btn-whatsapp"
                >
                  <Phone size={14} />
                  <span>Notify via WhatsApp</span>
                </a>

                <button
                  type="button"
                  className="track-action-btn btn-print"
                  onClick={handlePrint}
                >
                  <Printer size={14} />
                  <span>Print Ticket</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="no-order-selected-state">
              <ShoppingBag size={48} className="empty-icon" />
              <h4>No matching order found</h4>
              <p>
                Enter your Order ID (found on your confirmation screen or receipt) or phone number
                above to track preparation.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
