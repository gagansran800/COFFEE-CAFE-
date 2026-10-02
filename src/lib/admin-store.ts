// Admin Data Store & Persistence for Boreal Café Operations

export type ReservationStatus = "pending" | "confirmed" | "seated" | "completed" | "cancelled";

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  partySize: string;
  dateOption: string;
  timeSlot: string;
  preference: string;
  notes?: string;
  status: ReservationStatus;
  tableAssigned?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  category: "Coffee" | "Tea & specialty drinks" | "Pastries & treats" | "Counter specialties";
  name: string;
  price: string;
  description: string;
  inStock: boolean;
  featured: boolean;
  dietary?: string[]; // e.g. ["Vegan", "Gluten-Free", "Nut-Free"]
}

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "replied" | "archived";
  createdAt: string;
  channel: "website" | "whatsapp" | "email";
}

export interface CafeSettings {
  isOpen: boolean;
  specialNoticeEnabled: boolean;
  specialNoticeText: string;
  announcementBadge: string;
  phone: string;
  email: string;
  address: string;
  wifiNetwork: string;
  wifiPassword: string;
  todaySpecial: string;
}

// Storage Keys
const KEY_RESERVATIONS = "boreal_reservations_v1";
const KEY_MENU = "boreal_menu_v1";
const KEY_INQUIRIES = "boreal_inquiries_v1";
const KEY_SETTINGS = "boreal_settings_v1";

// Initial Seed Data
const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "res-101",
    name: "Eleanor Vance",
    email: "eleanor.v@newfoundlandart.ca",
    phone: "+1 709-726-4411",
    partySize: "2 Guests",
    dateOption: "Today",
    timeSlot: "Morning Coffee (8am - 11am)",
    preference: "Cozy Window Table",
    notes: "Celebrating a quiet anniversary morning. Requested table overlooking Water St.",
    status: "confirmed",
    tableAssigned: "Table 4 (Window)",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "res-102",
    name: "Marcus Holloway",
    email: "marcus.h@techsea.com",
    phone: "+1 709-685-9922",
    partySize: "3-4 Guests",
    dateOption: "Today",
    timeSlot: "Afternoon Break (2pm - 5pm)",
    preference: "Quiet Reading Corner",
    notes: "Will need power outlet for a brief laptop meeting with overseas clients.",
    status: "seated",
    tableAssigned: "Table 8 (Booth)",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "res-103",
    name: "Sophia Zhang",
    email: "sophia.zhang@mun.ca",
    phone: "+1 709-743-1288",
    partySize: "1 Guest",
    dateOption: "Tomorrow",
    timeSlot: "Lunch & Treats (11am - 2pm)",
    preference: "Cozy Window Table",
    notes: "Looking forward to trying the Harbour Fog Tea Latte and Date Square.",
    status: "pending",
    tableAssigned: "Unassigned",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "res-104",
    name: "Liam O'Connor",
    email: "liam.oconnor@eastcoastfolk.org",
    phone: "+1 709-722-0941",
    partySize: "5+ Group",
    dateOption: "This Weekend",
    timeSlot: "Morning Coffee (8am - 11am)",
    preference: "Spacious Social Seating",
    notes: "Acoustic music crew breakfast meet before harbour stroll.",
    status: "confirmed",
    tableAssigned: "Table 12 (Large Oval)",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];

const INITIAL_MENU: MenuItem[] = [
  {
    id: "menu-1",
    category: "Coffee",
    name: "Caffè Latte",
    price: "$5.25",
    description: "Double espresso freshly extracted over silky textured whole or oat milk.",
    inStock: true,
    featured: true,
    dietary: ["Oat/Almond option available"],
  },
  {
    id: "menu-2",
    category: "Coffee",
    name: "Cappuccino",
    price: "$4.95",
    description: "Equal balance of double espresso, velvety steamed milk, and dense microfoam.",
    inStock: true,
    featured: true,
  },
  {
    id: "menu-3",
    category: "Coffee",
    name: "Iced Latte",
    price: "$5.75",
    description: "Chilled double espresso poured over fresh milk and mountain ice cubes.",
    inStock: true,
    featured: true,
  },
  {
    id: "menu-4",
    category: "Coffee",
    name: "Nordic Pour-Over Single Origin",
    price: "$6.00",
    description:
      "Rotating Ethiopian & Colombian washed light roasts showcasing floral, berry notes.",
    inStock: true,
    featured: true,
    dietary: ["Single Origin", "House Specialty"],
  },
  {
    id: "menu-5",
    category: "Coffee",
    name: "Americano",
    price: "$4.25",
    description: "Rich double shot of espresso topped with hot Atlantic filtered spring water.",
    inStock: true,
    featured: false,
  },
  {
    id: "menu-6",
    category: "Coffee",
    name: "Cold Brew (Slow Steeped)",
    price: "$5.25",
    description: "Steeped for 18 hours in small batches for ultra-smooth chocolate notes.",
    inStock: true,
    featured: false,
  },
  {
    id: "menu-7",
    category: "Tea & specialty drinks",
    name: "Harbour Fog Tea Latte",
    price: "$5.95",
    description:
      "Our signature St. John's Earl Grey steeped rich, infused with real vanilla bean and lavender steam.",
    inStock: true,
    featured: true,
    dietary: ["House Specialty", "Vegan option"],
  },
  {
    id: "menu-8",
    category: "Tea & specialty drinks",
    name: "Spiced Chai Latte",
    price: "$5.50",
    description: "Slow-brewed black tea infused with cardamom, cinnamon, ginger, and steamed milk.",
    inStock: true,
    featured: true,
    dietary: ["Organic Spice"],
  },
  {
    id: "menu-9",
    category: "Pastries & treats",
    name: "Butter Pecan Scone",
    price: "$4.50",
    description:
      "Baked daily in small batches with toasted pecans, Atlantic butter, and raw sugar crust.",
    inStock: true,
    featured: true,
  },
  {
    id: "menu-10",
    category: "Pastries & treats",
    name: "Wild Blueberry Muffin",
    price: "$4.25",
    description: "Packed with handpicked Newfoundland wild blueberries and cinnamon streusel.",
    inStock: true,
    featured: true,
    dietary: ["Vegetarian", "Locally Foraged"],
  },
  {
    id: "menu-11",
    category: "Pastries & treats",
    name: "Traditional Date Square",
    price: "$4.75",
    description: "Classic brown sugar rolled oat crumble layering slow-simmered date paste.",
    inStock: true,
    featured: false,
    dietary: ["Vegan Friendly"],
  },
  {
    id: "menu-12",
    category: "Pastries & treats",
    name: "Double Chocolate Cookie Sandwich",
    price: "$5.25",
    description: "Dark chocolate sea salt cookies with espresso buttercream filling.",
    inStock: true,
    featured: false,
    dietary: ["Decadent"],
  },
  {
    id: "menu-13",
    category: "Pastries & treats",
    name: "Partridgeberry Tart",
    price: "$5.25",
    description: "Flaky butter pastry shell filled with tart Newfoundland mountain partridgeberries.",
    inStock: true,
    featured: true,
    dietary: ["Atlantic Specialty"],
  },
  {
    id: "menu-14",
    category: "Counter specialties",
    name: "Smoked Salmon Sourdough Toast",
    price: "$9.50",
    description: "Locally cured Atlantic smoked salmon, herb whipped cream cheese, capers, fresh dill.",
    inStock: true,
    featured: true,
    dietary: ["Fresh Catch"],
  },
  {
    id: "menu-15",
    category: "Counter specialties",
    name: "Avocado Sourdough Tartine",
    price: "$8.75",
    description: "Crushed avocado, pickled red onion, toasted pumpkin seeds, and smoked sea salt.",
    inStock: true,
    featured: true,
    dietary: ["Vegan", "Nutrient Rich"],
  },
];

const INITIAL_INQUIRIES: CustomerInquiry[] = [
  {
    id: "inq-1",
    name: "Claire Bennett",
    email: "claire.bennett@eventsnl.ca",
    phone: "+1 709-690-3341",
    subject: "Private Evening Event / Book Launch",
    message:
      "Hello Boreal team! We are looking to host an intimate acoustic book launch for 25 people on a Thursday evening in late October. Are private bookings accommodated after 6 PM?",
    status: "unread",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    channel: "website",
  },
  {
    id: "inq-2",
    name: "David Sterling",
    email: "d.sterling@heritageconsulting.com",
    phone: "+1 709-728-1190",
    subject: "Weekly Office Coffee & Pastry Catering",
    message:
      "Hi there, our architecture studio on Water Street would love to set up a recurring Tuesday morning catering box (2 carafes + 12 mixed pastries). Can we establish an account?",
    status: "replied",
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    channel: "email",
  },
];

const INITIAL_SETTINGS: CafeSettings = {
  isOpen: true,
  specialNoticeEnabled: true,
  specialNoticeText:
    "Fresh morning batch of Butter Pecan Scones & Harbour Fog Lattes ready on Water Street!",
  announcementBadge: "Fresh Today",
  phone: "+1 709-552-4809",
  email: "contact@borealcafe.ca",
  address: "351 Water St, St. John's, NL A1C 1C2, Canada",
  wifiNetwork: "BorealCafe_Guest",
  wifiPassword: "waterstreetcoffee",
  todaySpecial: "Harbour Fog Tea Latte paired with Wild Blueberry Streusel Scone",
};

// Dispatch custom event when store changes so reactive components can re-render
function emitStoreUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("boreal-store-updated"));
  }
}

// ----------------- RESERVATIONS -----------------
export function getReservations(): Reservation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_RESERVATIONS);
    if (!raw) {
      localStorage.setItem(KEY_RESERVATIONS, "[]");
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveReservation(
  res: Omit<Reservation, "id" | "createdAt" | "status">,
): Reservation {
  const all = getReservations();
  const newRecord: Reservation = {
    ...res,
    id: `res-${Date.now().toString(36)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const updated = [newRecord, ...all];
  try {
    localStorage.setItem(KEY_RESERVATIONS, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to save reservation:", e);
  }
  return newRecord;
}

export function updateReservation(id: string, patch: Partial<Reservation>): Reservation[] {
  const all = getReservations();
  const updated = all.map((item) => (item.id === id ? { ...item, ...patch } : item));
  try {
    localStorage.setItem(KEY_RESERVATIONS, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to update reservation:", e);
  }
  return updated;
}

export function deleteReservation(id: string): Reservation[] {
  const all = getReservations();
  const updated = all.filter((item) => item.id !== id);
  try {
    localStorage.setItem(KEY_RESERVATIONS, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to delete reservation:", e);
  }
  return updated;
}

// ----------------- MENU ITEMS -----------------
export function getMenuItems(): MenuItem[] {
  if (typeof window === "undefined") return INITIAL_MENU;
  try {
    const raw = localStorage.getItem(KEY_MENU);
    if (!raw) {
      localStorage.setItem(KEY_MENU, JSON.stringify(INITIAL_MENU));
      return INITIAL_MENU;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MENU;
  }
}

export function updateMenuItem(id: string, patch: Partial<MenuItem>): MenuItem[] {
  const all = getMenuItems();
  const updated = all.map((item) => (item.id === id ? { ...item, ...patch } : item));
  try {
    localStorage.setItem(KEY_MENU, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to update menu item:", e);
  }
  return updated;
}

export function addMenuItem(item: Omit<MenuItem, "id">): MenuItem[] {
  const all = getMenuItems();
  const newItem: MenuItem = {
    ...item,
    id: `menu-${Date.now().toString(36)}`,
  };
  const updated = [...all, newItem];
  try {
    localStorage.setItem(KEY_MENU, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to add menu item:", e);
  }
  return updated;
}

export function deleteMenuItem(id: string): MenuItem[] {
  const all = getMenuItems();
  const updated = all.filter((item) => item.id !== id);
  try {
    localStorage.setItem(KEY_MENU, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to delete menu item:", e);
  }
  return updated;
}

// ----------------- INQUIRIES -----------------
export function getCustomerInquiries(): CustomerInquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_INQUIRIES);
    if (!raw) {
      localStorage.setItem(KEY_INQUIRIES, "[]");
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function updateInquiryStatus(
  id: string,
  status: CustomerInquiry["status"],
): CustomerInquiry[] {
  const all = getCustomerInquiries();
  const updated = all.map((item) => (item.id === id ? { ...item, status } : item));
  try {
    localStorage.setItem(KEY_INQUIRIES, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to update inquiry:", e);
  }
  return updated;
}

export function deleteInquiry(id: string): CustomerInquiry[] {
  const all = getCustomerInquiries();
  const updated = all.filter((item) => item.id !== id);
  try {
    localStorage.setItem(KEY_INQUIRIES, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to delete inquiry:", e);
  }
  return updated;
}

// ----------------- SETTINGS -----------------
export function getCafeSettings(): CafeSettings {
  if (typeof window === "undefined") return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (!raw) {
      localStorage.setItem(KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function updateCafeSettings(patch: Partial<CafeSettings>): CafeSettings {
  const current = getCafeSettings();
  const updated = { ...current, ...patch };
  try {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(updated));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
  return updated;
}

// ----------------- ORDERS MANAGEMENT -----------------
export type OrderStatus = "New" | "Preparing" | "Ready for Pickup" | "Completed" | "Cancelled";
export type OrderType = "Dine-in" | "Takeout / Counter" | "Advance Pickup" | "Curbside";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: string | undefined;
}

export interface CafeOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: OrderType;
  tableNumber?: string | undefined;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip?: number | undefined;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: "Credit / Debit (Square)" | "Cash" | "Interac e-Transfer" | "Apple Pay";
  orderStatus: OrderStatus;
  specialInstructions?: string | undefined;
  createdAt: number;
  estimatedReadyMinutes?: number | undefined;
  cancelledAt?: number | undefined;
  cancelledReason?: string | undefined;
}

const KEY_ORDERS = "boreal_orders_v1";

export function generateSeedOrders(): CafeOrder[] {
  const now = Date.now();
  return [
    {
      id: "ORD-9422",
      customerName: "Sarah Jenkins",
      customerPhone: "+1 709-330-8912",
      customerEmail: "sarah.jenkins@mun.ca",
      orderType: "Advance Pickup",
      items: [
        {
          id: "item-1",
          name: "Harbour Fog Tea Latte",
          quantity: 1,
          unitPrice: 5.95,
          totalPrice: 5.95,
          customization: "Extra hot, oat milk",
        },
        {
          id: "item-2",
          name: "Wild Blueberry Streusel Scone",
          quantity: 2,
          unitPrice: 4.5,
          totalPrice: 9.0,
          customization: "Warm, salted butter on side",
        },
      ],
      subtotal: 14.95,
      tax: 2.24,
      tip: 2.5,
      total: 19.69,
      paymentStatus: "Paid",
      paymentMethod: "Apple Pay",
      orderStatus: "New",
      specialInstructions: "Will arrive around noon for pickup at counter.",
      createdAt: now - 1000 * 60 * 5,
      estimatedReadyMinutes: 10,
    },
    {
      id: "ORD-9421",
      customerName: "Chloe Dupont",
      customerPhone: "+1 709-579-2234",
      customerEmail: "chloe.d@atlanticdesign.com",
      orderType: "Takeout / Counter",
      items: [
        {
          id: "item-1",
          name: "Harbour Fog Tea Latte",
          quantity: 2,
          unitPrice: 5.95,
          totalPrice: 11.9,
          customization: "Steamed oat milk, extra lavender",
        },
        {
          id: "item-2",
          name: "Butter Pecan Tart",
          quantity: 2,
          unitPrice: 4.75,
          totalPrice: 9.5,
        },
      ],
      subtotal: 21.4,
      tax: 3.21,
      tip: 3.0,
      total: 27.61,
      paymentStatus: "Paid",
      paymentMethod: "Credit / Debit (Square)",
      orderStatus: "Preparing",
      specialInstructions: "Walking down to Harbour drive, please package securely.",
      createdAt: now - 1000 * 60 * 18,
      estimatedReadyMinutes: 8,
    },
    {
      id: "ORD-9420",
      customerName: "Rahul Sharma",
      customerPhone: "+1 709-685-1144",
      customerEmail: "rahul.sharma@eastcoasttech.ca",
      orderType: "Dine-in",
      tableNumber: "Table 4 (Window)",
      items: [
        {
          id: "item-1",
          name: "Caffè Latte",
          quantity: 1,
          unitPrice: 5.25,
          totalPrice: 5.25,
          customization: "Double shot, whole milk",
        },
        {
          id: "item-2",
          name: "Cappuccino",
          quantity: 1,
          unitPrice: 4.95,
          totalPrice: 4.95,
          customization: "Dusted cinnamon",
        },
        {
          id: "item-3",
          name: "Wild Blueberry Streusel Scone",
          quantity: 1,
          unitPrice: 4.5,
          totalPrice: 4.5,
        },
      ],
      subtotal: 14.7,
      tax: 2.21,
      tip: 2.5,
      total: 19.41,
      paymentStatus: "Paid",
      paymentMethod: "Credit / Debit (Square)",
      orderStatus: "Ready for Pickup",
      specialInstructions: "Deliver directly to Window Table 4.",
      createdAt: now - 1000 * 60 * 32,
    },
    {
      id: "ORD-9419",
      customerName: "Marcus Holloway",
      customerPhone: "+1 709-685-9922",
      customerEmail: "marcus.h@techsea.com",
      orderType: "Dine-in",
      tableNumber: "Table 8 (Booth)",
      items: [
        {
          id: "item-1",
          name: "Iced Latte",
          quantity: 2,
          unitPrice: 5.75,
          totalPrice: 11.5,
          customization: "Almond milk",
        },
        {
          id: "item-2",
          name: "Partridgeberry Galette",
          quantity: 2,
          unitPrice: 5.25,
          totalPrice: 10.5,
        },
      ],
      subtotal: 22.0,
      tax: 3.3,
      tip: 3.5,
      total: 28.8,
      paymentStatus: "Paid",
      paymentMethod: "Interac e-Transfer",
      orderStatus: "Completed",
      createdAt: now - 1000 * 60 * 75,
    },
    {
      id: "ORD-9418",
      customerName: "Eleanor Vance",
      customerPhone: "+1 709-726-4411",
      customerEmail: "eleanor.v@mun.ca",
      orderType: "Advance Pickup",
      items: [
        {
          id: "item-1",
          name: "Harbour Fog Tea Latte",
          quantity: 1,
          unitPrice: 5.95,
          totalPrice: 5.95,
        },
        {
          id: "item-2",
          name: "Butter Pecan Tart",
          quantity: 1,
          unitPrice: 4.75,
          totalPrice: 4.75,
        },
      ],
      subtotal: 10.7,
      tax: 1.61,
      tip: 2.0,
      total: 14.31,
      paymentStatus: "Paid",
      paymentMethod: "Credit / Debit (Square)",
      orderStatus: "Completed",
      createdAt: now - 1000 * 60 * 130,
    },
    {
      id: "ORD-9417",
      customerName: "Liam O'Connor",
      customerPhone: "+1 709-722-0941",
      customerEmail: "liam.oconnor@folkfest.nl.ca",
      orderType: "Takeout / Counter",
      items: [
        {
          id: "item-1",
          name: "Caffè Latte",
          quantity: 3,
          unitPrice: 5.25,
          totalPrice: 15.75,
        },
        {
          id: "item-2",
          name: "Wild Blueberry Streusel Scone",
          quantity: 3,
          unitPrice: 4.5,
          totalPrice: 13.5,
        },
      ],
      subtotal: 29.25,
      tax: 4.39,
      tip: 4.0,
      total: 37.64,
      paymentStatus: "Paid",
      paymentMethod: "Cash",
      orderStatus: "Completed",
      createdAt: now - 1000 * 60 * 240,
    },
  ];
}

export function getCafeOrders(): CafeOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_ORDERS);
    if (!raw) {
      const seeded = generateSeedOrders();
      localStorage.setItem(KEY_ORDERS, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCafeOrder(
  order: Omit<CafeOrder, "id" | "createdAt"> & { id?: string },
): CafeOrder {
  const all = getCafeOrders();
  const newOrder: CafeOrder = {
    ...order,
    id: order.id || "ORD-" + Math.floor(1000 + Math.random() * 9000),
    createdAt: Date.now(),
  };
  const updated = [newOrder, ...all];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY_ORDERS, JSON.stringify(updated));
      emitStoreUpdate();
    } catch (e) {
      console.error("Failed to save order:", e);
    }
  }
  return newOrder;
}

export function updateCafeOrderStatus(id: string, orderStatus: OrderStatus): CafeOrder[] {
  const all = getCafeOrders();
  const updated = all.map((o) => (o.id === id ? { ...o, orderStatus } : o));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY_ORDERS, JSON.stringify(updated));
      emitStoreUpdate();
    } catch (e) {
      console.error("Failed to update order status:", e);
    }
  }
  return updated;
}

export function deleteCafeOrder(id: string): CafeOrder[] {
  const all = getCafeOrders();
  const updated = all.filter((o) => o.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY_ORDERS, JSON.stringify(updated));
      emitStoreUpdate();
    } catch (e) {
      console.error("Failed to delete order:", e);
    }
  }
  return updated;
}

const KEY_LAST_ORDER_ID = "boreal_last_order_id_v1";

export function getLastOrderId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEY_LAST_ORDER_ID) || "";
  } catch {
    return "";
  }
}

export function setLastOrderId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_LAST_ORDER_ID, id);
  } catch (e) {
    void e;
  }
}

export function cancelCafeOrder(
  id: string,
  reason = "Customer cancelled order within 1-minute window",
): { success: boolean; message: string; order?: CafeOrder } {
  const all = getCafeOrders();
  const target = all.find((o) => o.id === id);
  if (!target) {
    return { success: false, message: "Order not found." };
  }
  if (target.orderStatus === "Cancelled") {
    return { success: false, message: "This order is already cancelled.", order: target };
  }
  if (target.orderStatus === "Completed") {
    return {
      success: false,
      message: "Order has already been completed and cannot be cancelled.",
      order: target,
    };
  }

  const elapsedMs = Date.now() - target.createdAt;
  const isWithinOneMinute = elapsedMs <= 60 * 1000;

  if (!isWithinOneMinute) {
    return {
      success: false,
      message:
        "The 1-minute cancellation window has expired because kitchen preparation has begun. Please call the café counter directly at +1 709-552-4809 for assistance.",
      order: target,
    };
  }

  const updatedOrder: CafeOrder = {
    ...target,
    orderStatus: "Cancelled",
    cancelledAt: Date.now(),
    cancelledReason: reason,
  };

  const updatedList = all.map((o) => (o.id === id ? updatedOrder : o));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY_ORDERS, JSON.stringify(updatedList));
      emitStoreUpdate();
    } catch (e) {
      console.error("Failed to cancel order:", e);
    }
  }

  return { success: true, message: "Order successfully cancelled.", order: updatedOrder };
}

// ----------------- CLEAR ALL OPERATIONAL DATA -----------------
export function clearAllAdminStoreData(): void {
  try {
    localStorage.setItem(KEY_RESERVATIONS, "[]");
    localStorage.setItem(KEY_INQUIRIES, "[]");
    localStorage.setItem(KEY_ORDERS, "[]");
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to clear admin store data:", e);
  }
}

// ----------------- RESET ALL DEMO DATA -----------------
export function resetAllDataToDefault(): void {
  try {
    localStorage.setItem(KEY_RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
    localStorage.setItem(KEY_MENU, JSON.stringify(INITIAL_MENU));
    localStorage.setItem(KEY_INQUIRIES, JSON.stringify(INITIAL_INQUIRIES));
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(KEY_ORDERS, JSON.stringify(generateSeedOrders()));
    emitStoreUpdate();
  } catch (e) {
    console.error("Failed to reset demo data:", e);
  }
}
