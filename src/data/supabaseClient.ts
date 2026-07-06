// Supabase client for direct table operations
// Maps gym data structures to Supabase tables

const SUPABASE_API_URL = "/api/supabase";

// Type mappings for Supabase tables
interface SupabaseClient {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  weight?: string;
  height?: string;
  special_request?: string;
  client_code?: string;
  member_since?: string;
  package_key?: string;
  package_name?: string;
  package_status?: string;
  username?: string;
  source_payload?: any;
  created_at: string;
}

interface SupabaseTrainer {
  id: string;
  name: string;
  specialization?: string;
  experience?: number;
  image_url?: string;
  bio?: string;
  trainer_key?: string;
  category?: string;
  clients_label?: string;
  source_payload?: any;
  created_at: string;
  updated_at: string;
}

interface SupabaseClass {
  id: string;
  title: string;
  description?: string;
  trainer_id?: string;
  schedule?: string;
  capacity: number;
  class_key?: string;
  trainer_name?: string;
  time_label?: string;
  capacity_label?: string;
  image_url?: string;
  duration?: string;
  intensity?: string;
  target_audience?: string;
  benefits?: any[];
  full_schedule?: string;
  source_payload?: any;
  created_at: string;
  updated_at: string;
}

interface SupabaseProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  category?: string;
  product_key?: string;
  status: string;
  source_payload?: any;
  created_at: string;
  updated_at: string;
}

interface SupabaseOffer {
  id: string;
  title: string;
  description?: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  offer_key?: string;
  code?: string;
  offer_type?: string;
  status: string;
  source_payload?: any;
  created_at: string;
  updated_at: string;
}

interface SupabaseOrder {
  id: string;
  client_id?: string;
  order_number?: string;
  customer_name?: string;
  items?: string;
  total_amount: number;
  payment_label?: string;
  status: string;
  email?: string;
  pickup_point?: string;
  address?: string;
  source_payload?: any;
  created_at: string;
  updated_at: string;
}

interface SupabaseReview {
  id: string;
  client_id?: string;
  rating: number;
  comment?: string;
  review_key?: string;
  customer_name?: string;
  product_name?: string;
  status: string;
  source_payload?: any;
  created_at: string;
  updated_at: string;
}

interface SupabasePayment {
  id: string;
  client_id?: string;
  amount: number;
  method?: string;
  status?: string;
  txn_id?: string;
  member?: string;
  date?: string;
  source_payload?: any;
  created_at: string;
  updated_at: string;
}

interface SupabaseAttendance {
  id: string;
  client_id?: string;
  member?: string;
  plan?: string;
  status?: string;
  time?: string;
  date: string;
  source_payload?: any;
  created_at: string;
}

interface SupabaseBooking {
  id: string;
  client_id?: string;
  booking_id?: string;
  member?: string;
  service?: string;
  trainer?: string;
  program?: string;
  email?: string;
  date?: string;
  source_payload?: any;
  created_at: string;
}

interface SupabaseBlog {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_id?: string;
  slug?: string;
  author_name?: string;
  category?: string;
  read_time?: string;
  summary?: string;
  source_payload?: any;
  created_at: string;
  updated_at: string;
}

interface SupabaseContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  created_at: string;
}

// Generic Supabase API functions
async function supabaseGet<T>(table: string, params?: Record<string, string>): Promise<T[]> {
  const url = new URL(`${SUPABASE_API_URL}/${table}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${table}`);
  }
  return response.json();
}

async function supabasePost<T>(table: string, data: T): Promise<T> {
  const response = await fetch(`${SUPABASE_API_URL}/${table}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create in ${table}`);
  }
  return response.json();
}

async function supabaseUpdate<T>(table: string, id: string, data: Partial<T>): Promise<T> {
  const response = await fetch(`${SUPABASE_API_URL}/${table}?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update in ${table}`);
  }
  return response.json();
}

async function supabaseDelete(table: string, id: string): Promise<void> {
  const response = await fetch(`${SUPABASE_API_URL}/${table}?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete from ${table}`);
  }
}

// Conversion functions: Gym types -> Supabase types
function toSupabaseClient(client: any): Partial<SupabaseClient> {
  return {
    full_name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    weight: client.weight,
    height: client.height,
    special_request: client.specialRequest,
    client_code: client.id,
    member_since: client.memberSince,
    package_key: client.package?.key,
    package_name: client.package?.name,
    package_status: client.package?.status,
    username: client.username,
    source_payload: client,
  };
}

function fromSupabaseClient(supabaseClient: SupabaseClient): any {
  return {
    id: supabaseClient.client_code || supabaseClient.id,
    name: supabaseClient.full_name,
    email: supabaseClient.email,
    phone: supabaseClient.phone,
    address: supabaseClient.address,
    weight: supabaseClient.weight,
    height: supabaseClient.height,
    specialRequest: supabaseClient.special_request,
    memberSince: supabaseClient.member_since,
    package: supabaseClient.package_key ? {
      key: supabaseClient.package_key,
      name: supabaseClient.package_name,
      status: supabaseClient.package_status,
    } : undefined,
    username: supabaseClient.username,
  };
}

function toSupabaseTrainer(trainer: any): Partial<SupabaseTrainer> {
  return {
    name: trainer.name,
    specialization: trainer.specialty,
    experience: trainer.experienceYears ? parseInt(trainer.experienceYears) : undefined,
    image_url: trainer.image,
    bio: trainer.certificate,
    trainer_key: trainer.name.toLowerCase().replace(/\s+/g, "-"),
    category: trainer.category,
    clients_label: trainer.clients,
    source_payload: trainer,
  };
}

function fromSupabaseTrainer(supabaseTrainer: SupabaseTrainer): any {
  return {
    name: supabaseTrainer.name,
    specialty: supabaseTrainer.specialization,
    experienceYears: supabaseTrainer.experience?.toString(),
    image: supabaseTrainer.image_url || "/images/fitness-logo.jpg",
    certificate: supabaseTrainer.bio,
    category: supabaseTrainer.category,
    clients: supabaseTrainer.clients_label || "0 clients",
  };
}

function toSupabaseClass(classSchedule: any): Partial<SupabaseClass> {
  return {
    title: classSchedule.className,
    description: classSchedule.description,
    trainer_name: classSchedule.trainer,
    time_label: classSchedule.time,
    capacity_label: classSchedule.capacity,
    image_url: classSchedule.image,
    duration: classSchedule.duration,
    intensity: classSchedule.intensity,
    target_audience: classSchedule.targetAudience,
    benefits: classSchedule.benefits ? classSchedule.benefits.split(",").map((b: string) => b.trim()).filter(Boolean) : [],
    full_schedule: classSchedule.schedule,
    class_key: classSchedule.className.toLowerCase().replace(/\s+/g, "-"),
    capacity: parseInt(classSchedule.capacity) || 20,
    source_payload: classSchedule,
  };
}

function fromSupabaseClass(supabaseClass: SupabaseClass): any {
  return {
    className: supabaseClass.title,
    description: supabaseClass.description,
    trainer: supabaseClass.trainer_name,
    time: supabaseClass.time_label,
    capacity: supabaseClass.capacity_label,
    image: supabaseClass.image_url,
    duration: supabaseClass.duration,
    intensity: supabaseClass.intensity,
    targetAudience: supabaseClass.target_audience,
    benefits: Array.isArray(supabaseClass.benefits) ? supabaseClass.benefits.join(", ") : "",
    schedule: supabaseClass.full_schedule,
  };
}

function toSupabaseProduct(product: any): Partial<SupabaseProduct> {
  return {
    name: product.name,
    description: product.category,
    price: parseFloat(product.price.replace(/[^\d.]/g, "")) || 0,
    stock: parseInt(product.stock) || 0,
    image_url: product.image,
    category: product.category,
    product_key: product.name.toLowerCase().replace(/\s+/g, "-"),
    status: product.status,
    source_payload: product,
  };
}

function fromSupabaseProduct(supabaseProduct: SupabaseProduct): any {
  return {
    name: supabaseProduct.name,
    category: supabaseProduct.category || supabaseProduct.description,
    price: `Rs ${supabaseProduct.price}`,
    stock: supabaseProduct.stock.toString(),
    status: supabaseProduct.status,
    image: supabaseProduct.image_url,
  };
}

function toSupabaseOffer(offer: any): Partial<SupabaseOffer> {
  return {
    title: offer.name,
    offer_type: offer.type,
    discount_percentage: parseFloat(offer.discount.replace(/[^\d.]/g, "")) || 0,
    code: offer.code,
    end_date: offer.validTill,
    status: offer.status,
    offer_key: offer.name.toLowerCase().replace(/\s+/g, "-"),
    source_payload: offer,
  };
}

function fromSupabaseOffer(supabaseOffer: SupabaseOffer): any {
  return {
    name: supabaseOffer.title,
    type: supabaseOffer.offer_type,
    discount: `${supabaseOffer.discount_percentage}%`,
    code: supabaseOffer.code,
    validTill: supabaseOffer.end_date,
    status: supabaseOffer.status,
  };
}

function toSupabaseOrder(order: any): Partial<SupabaseOrder> {
  return {
    order_number: order.orderId,
    customer_name: order.customer,
    items: order.items,
    total_amount: parseFloat(order.total.replace(/[^\d.]/g, "")) || 0,
    payment_label: order.payment,
    status: order.status,
    email: order.email,
    pickup_point: order.pickupPoint,
    address: order.address,
    source_payload: order,
  };
}

function fromSupabaseOrder(supabaseOrder: SupabaseOrder): any {
  return {
    orderId: supabaseOrder.order_number,
    customer: supabaseOrder.customer_name,
    items: supabaseOrder.items,
    total: `Rs ${supabaseOrder.total_amount}`,
    payment: supabaseOrder.payment_label,
    status: supabaseOrder.status,
    email: supabaseOrder.email,
    pickupPoint: supabaseOrder.pickup_point,
    address: supabaseOrder.address,
    date: new Date(supabaseOrder.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

function toSupabaseReview(review: any): Partial<SupabaseReview> {
  return {
    customer_name: review.customer,
    product_name: review.product,
    rating: review.rating.length, // Count stars
    comment: review.reviewText,
    status: review.status,
    review_key: `${review.customer}-${review.product}`.toLowerCase().replace(/\s+/g, "-"),
    source_payload: review,
  };
}

function fromSupabaseReview(supabaseReview: SupabaseReview): any {
  return {
    customer: supabaseReview.customer_name,
    product: supabaseReview.product_name,
    rating: "★".repeat(supabaseReview.rating),
    reviewText: supabaseReview.comment,
    status: supabaseReview.status,
    date: new Date(supabaseReview.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

function toSupabasePayment(payment: any): Partial<SupabasePayment> {
  return {
    txn_id: payment.txnId,
    member: payment.member,
    amount: parseFloat(payment.amount.replace(/[^\d.]/g, "")) || 0,
    method: payment.method,
    status: payment.status,
    date: payment.date,
    source_payload: payment,
  };
}

function fromSupabasePayment(supabasePayment: SupabasePayment): any {
  return {
    txnId: supabasePayment.txn_id,
    member: supabasePayment.member,
    amount: `Rs ${supabasePayment.amount}`,
    method: supabasePayment.method,
    status: supabasePayment.status,
    date: supabasePayment.date || new Date(supabasePayment.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

function toSupabaseAttendance(attendance: any): Partial<SupabaseAttendance> {
  return {
    member: attendance.member,
    plan: attendance.plan,
    status: attendance.status,
    time: attendance.time,
    date: new Date().toISOString().split('T')[0],
    source_payload: attendance,
  };
}

function fromSupabaseAttendance(supabaseAttendance: SupabaseAttendance): any {
  return {
    member: supabaseAttendance.member,
    plan: supabaseAttendance.plan,
    status: supabaseAttendance.status,
    time: supabaseAttendance.time,
  };
}

function toSupabaseBooking(booking: any): Partial<SupabaseBooking> {
  return {
    booking_id: booking.bookingId,
    member: booking.member,
    service: booking.service,
    trainer: booking.trainer,
    program: booking.program,
    email: booking.email,
    date: booking.date,
    source_payload: booking,
  };
}

function fromSupabaseBooking(supabaseBooking: SupabaseBooking): any {
  return {
    bookingId: supabaseBooking.booking_id,
    member: supabaseBooking.member,
    service: supabaseBooking.service,
    trainer: supabaseBooking.trainer,
    program: supabaseBooking.program,
    email: supabaseBooking.email,
    date: supabaseBooking.date,
  };
}

function toSupabaseContactMessage(message: any): Partial<SupabaseContactMessage> {
  return {
    name: message.name,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    message: message.message,
  };
}

function fromSupabaseContactMessage(supabaseMessage: SupabaseContactMessage): any {
  return {
    id: supabaseMessage.id,
    name: supabaseMessage.name,
    email: supabaseMessage.email,
    phone: supabaseMessage.phone,
    subject: supabaseMessage.subject,
    message: supabaseMessage.message,
    date: new Date(supabaseMessage.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
    status: "New",
  };
}

// Export functions for each table
export const supabaseClients = {
  get: () => supabaseGet<SupabaseClient>("clients").then(data => data.map(fromSupabaseClient)),
  create: (client: any) => supabasePost("clients", toSupabaseClient(client)),
  update: (id: string, client: any) => supabaseUpdate("clients", id, toSupabaseClient(client)),
  delete: (id: string) => supabaseDelete("clients", id),
};

export const supabaseTrainers = {
  get: () => supabaseGet<SupabaseTrainer>("trainers").then(data => data.map(fromSupabaseTrainer)),
  create: (trainer: any) => supabasePost("trainers", toSupabaseTrainer(trainer)),
  update: (id: string, trainer: any) => supabaseUpdate("trainers", id, toSupabaseTrainer(trainer)),
  delete: (id: string) => supabaseDelete("trainers", id),
};

export const supabaseClasses = {
  get: () => supabaseGet<SupabaseClass>("classes").then(data => data.map(fromSupabaseClass)),
  create: (classSchedule: any) => supabasePost("classes", toSupabaseClass(classSchedule)),
  update: (id: string, classSchedule: any) => supabaseUpdate("classes", id, toSupabaseClass(classSchedule)),
  delete: (id: string) => supabaseDelete("classes", id),
};

export const supabaseProducts = {
  get: () => supabaseGet<SupabaseProduct>("products").then(data => data.map(fromSupabaseProduct)),
  create: (product: any) => supabasePost("products", toSupabaseProduct(product)),
  update: (id: string, product: any) => supabaseUpdate("products", id, toSupabaseProduct(product)),
  delete: (id: string) => supabaseDelete("products", id),
};

export const supabaseOffers = {
  get: () => supabaseGet<SupabaseOffer>("offers").then(data => data.map(fromSupabaseOffer)),
  create: (offer: any) => supabasePost("offers", toSupabaseOffer(offer)),
  update: (id: string, offer: any) => supabaseUpdate("offers", id, toSupabaseOffer(offer)),
  delete: (id: string) => supabaseDelete("offers", id),
};

export const supabaseOrders = {
  get: () => supabaseGet<SupabaseOrder>("orders").then(data => data.map(fromSupabaseOrder)),
  create: (order: any) => supabasePost("orders", toSupabaseOrder(order)),
  update: (id: string, order: any) => supabaseUpdate("orders", id, toSupabaseOrder(order)),
  delete: (id: string) => supabaseDelete("orders", id),
};

export const supabaseReviews = {
  get: () => supabaseGet<SupabaseReview>("reviews").then(data => data.map(fromSupabaseReview)),
  create: (review: any) => supabasePost("reviews", toSupabaseReview(review)),
  update: (id: string, review: any) => supabaseUpdate("reviews", id, toSupabaseReview(review)),
  delete: (id: string) => supabaseDelete("reviews", id),
};

export const supabasePayments = {
  get: () => supabaseGet<SupabasePayment>("payments").then(data => data.map(fromSupabasePayment)),
  create: (payment: any) => supabasePost("payments", toSupabasePayment(payment)),
  update: (id: string, payment: any) => supabaseUpdate("payments", id, toSupabasePayment(payment)),
  delete: (id: string) => supabaseDelete("payments", id),
};

export const supabaseAttendance = {
  get: () => supabaseGet<SupabaseAttendance>("attendance").then(data => data.map(fromSupabaseAttendance)),
  create: (attendance: any) => supabasePost("attendance", toSupabaseAttendance(attendance)),
  update: (id: string, attendance: any) => supabaseUpdate("attendance", id, toSupabaseAttendance(attendance)),
  delete: (id: string) => supabaseDelete("attendance", id),
};

export const supabaseBookings = {
  get: () => supabaseGet<SupabaseBooking>("bookings").then(data => data.map(fromSupabaseBooking)),
  create: (booking: any) => supabasePost("bookings", toSupabaseBooking(booking)),
  update: (id: string, booking: any) => supabaseUpdate("bookings", id, toSupabaseBooking(booking)),
  delete: (id: string) => supabaseDelete("bookings", id),
};

export const supabaseContactMessages = {
  get: () => supabaseGet<SupabaseContactMessage>("contact_messages").then(data => data.map(fromSupabaseContactMessage)),
  create: (message: any) => supabasePost("contact_messages", toSupabaseContactMessage(message)),
  delete: (id: string) => supabaseDelete("contact_messages", id),
};
