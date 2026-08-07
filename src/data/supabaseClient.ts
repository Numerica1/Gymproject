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
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
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
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseBlog {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  slug?: string;
  author_name?: string;
  category?: string;
  read_time?: string;
  summary?: string;
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
}

interface SupabaseMembership {
  id: string;
  name: string;
  duration: number;
  price: number;
  plan_key?: string;
  access?: string;
  trainer?: string;
  sessions_total?: number;
  features?: unknown;
  upcoming_classes?: unknown;
  highlighted?: boolean;
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
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
  benefits?: unknown[];
  full_schedule?: string;
  tag?: string;
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseProduct {
  id: string;
  brand_id?: string;
  brand_key?: string;
  brand_name?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  category?: string;
  flavor?: string;
  size_label?: string;
  rating?: number;
  product_key?: string;
  status: string;
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseBrand {
  id: string;
  name: string;
  brand_key?: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  status: string;
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
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
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
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
  payment_method?: string;
  phone?: string;
  status: string;
  email?: string;
  pickup_point?: string;
  address?: string;
  source_payload?: unknown;
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
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
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
  source_payload?: unknown;
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
  source_payload?: unknown;
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
  source_payload?: unknown;
  created_at: string;
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

interface SupabaseShopCategory {
  id: string;
  label: string;
  category: string;
  image_url?: string;
  display_order?: number;
  source_payload?: unknown;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  updated_at: string;
}

type SourcePayload = Record<string, unknown>;
type SupabaseInsert<T> = Partial<T>;

function isSourcePayload(value: unknown): value is SourcePayload {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

type ClientPackagePayload = Partial<{
  key: string;
  name: string;
  status: string;
}>;

type GymClientPayload = SourcePayload & Partial<{
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  weight: string;
  height: string;
  specialRequest: string;
  memberSince: string;
  package: ClientPackagePayload;
  username: string;
}>;

type GymTrainerPayload = SourcePayload & Partial<{
  name: string;
  specialty: string;
  experienceYears: string;
  image: string;
  certificate: string;
  category: string;
  clients: string;
}>;

type GymClassPayload = SourcePayload & Partial<{
  className: string;
  description: string;
  trainer: string;
  time: string;
  capacity: string;
  image: string;
  duration: string;
  intensity: string;
  targetAudience: string;
  benefits: string;
  schedule: string;
  tag: string;
}>;

type GymProductPayload = SourcePayload & Partial<{
  name: string;
  brandKey: string;
  brandName: string;
  category: string;
  flavor: string;
  size: string;
  price: string;
  rating: string;
  stock: string;
  image: string;
  status: string;
  description: string;
}>;

type GymBrandPayload = SourcePayload & Partial<{
  key: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  status: string;
}>;

type GymOfferPayload = SourcePayload & Partial<{
  name: string;
  type: string;
  discount: string;
  code: string;
  validTill: string;
  status: string;
}>;

type GymOrderPayload = SourcePayload & Partial<{
  id: string;
  orderId: string;
  customer: string;
  items: string;
  total: string;
  payment: string;
  status: string;
  email: string;
  phone: string;
  pickupPoint: string;
  address: string;
  paymentMethod: string;
}>;

type GymReviewPayload = SourcePayload & Partial<{
  customer: string;
  product: string;
  rating: string;
  reviewText: string;
  status: string;
}>;

type GymPaymentPayload = SourcePayload & Partial<{
  txnId: string;
  member: string;
  amount: string;
  method: string;
  status: string;
  date: string;
}>;

type GymAttendancePayload = SourcePayload & Partial<{
  member: string;
  plan: string;
  status: string;
  time: string;
}>;

type GymBookingPayload = SourcePayload & Partial<{
  bookingId: string;
  member: string;
  service: string;
  trainer: string;
  program: string;
  email: string;
  date: string;
}>;

type GymContactMessagePayload = SourcePayload & Partial<{
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}>;

type GymShopCategoryPayload = SourcePayload & Partial<{
  id: string;
  label: string;
  category: string;
  image: string;
  order: number;
}>;

// Generic Supabase API functions
async function supabaseGet<T>(table: string, params?: Record<string, string>): Promise<T[]> {
  const queryParts = Object.entries(params || {}).map(
    ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
  );
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const url = `${SUPABASE_API_URL}/${table}${query}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let detail = text;
    try {
      detail = JSON.stringify(JSON.parse(text), null, 2);
    } catch {}
    console.error(`[Supabase Error] GET ${url} failed (HTTP ${response.status} ${response.statusText}):\n${detail}`);
    throw new Error(`Failed to fetch from ${table}: HTTP ${response.status} - ${text || response.statusText}`);
  }
  return response.json();
}

async function supabasePost<T>(table: string, data: T): Promise<T> {
  const url = `${SUPABASE_API_URL}/${table}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let detail = text;
    let supabaseError: unknown = null;
    try {
      supabaseError = JSON.parse(text);
      detail = JSON.stringify(supabaseError, null, 2);
    } catch {}

    console.error(`[Supabase Error] POST ${url} failed (HTTP ${response.status} ${response.statusText}):\n${detail}`);

    const errorMsg =
      typeof supabaseError === "object" && supabaseError && "error" in supabaseError
        ? String((supabaseError as { error: unknown }).error)
        : typeof supabaseError === "object" && supabaseError && "message" in supabaseError
        ? String((supabaseError as { message: unknown }).message)
        : text || `HTTP ${response.status} ${response.statusText}`;

    throw new Error(`Failed to create in ${table}: ${errorMsg}`);
  }
  return response.json();
}

function buildIdQuery(table: string, id: string): string {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (table === "clients" && !isUuid) {
    return `id=${encodeURIComponent(id)}&idColumn=client_code`;
  }
  return `id=${encodeURIComponent(id)}`;
}

async function supabaseUpdate<T>(table: string, id: string, data: Partial<T>): Promise<T> {
  const query = buildIdQuery(table, id);
  const url = `${SUPABASE_API_URL}/${table}?${query}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let detail = text;
    let supabaseError: unknown = null;
    try {
      supabaseError = JSON.parse(text);
      detail = JSON.stringify(supabaseError, null, 2);
    } catch {}

    console.error(`[Supabase Error] PUT ${url} failed (HTTP ${response.status} ${response.statusText}):\n${detail}`);

    const errorMsg =
      typeof supabaseError === "object" && supabaseError && "error" in supabaseError
        ? String((supabaseError as { error: unknown }).error)
        : typeof supabaseError === "object" && supabaseError && "message" in supabaseError
        ? String((supabaseError as { message: unknown }).message)
        : text || `HTTP ${response.status} ${response.statusText}`;

    throw new Error(`Failed to update in ${table}: ${errorMsg}`);
  }
  return response.json();
}

async function supabaseDelete(table: string, id: string): Promise<void> {
  const query = buildIdQuery(table, id);
  const url = `${SUPABASE_API_URL}/${table}?${query}`;
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[Supabase Error] DELETE ${url} failed (HTTP ${response.status}): ${text}`);
    throw new Error(`Failed to delete from ${table}: HTTP ${response.status} - ${text}`);
  }
}

/** Soft-delete: sets is_deleted=true, deleted_at=now() */
async function supabaseSoftDelete(table: string, id: string): Promise<void> {
  const query = buildIdQuery(table, id);
  const url = `${SUPABASE_API_URL}/${table}?${query}`;
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[Supabase Error] Soft Delete ${url} failed (HTTP ${response.status}): ${text}`);
    throw new Error(`Failed to soft-delete from ${table}: HTTP ${response.status} - ${text}`);
  }
}

/** Restore: sets is_deleted=false, deleted_at=null */
async function supabaseRestore<T>(table: string, id: string): Promise<T> {
  return supabaseUpdate<T>(table, id, { is_deleted: false, deleted_at: null } as unknown as Partial<T>);
}

/** Permanently delete (bypasses soft-delete) */
async function supabasePermanentDelete(table: string, id: string): Promise<void> {
  const query = buildIdQuery(table, id);
  const url = `${SUPABASE_API_URL}/${table}?${query}&permanent=true`;
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[Supabase Error] Permanent Delete ${url} failed`, {
      statusCode: response.status,
      responseBody: text,
      requestUrl: url,
    });
    throw new Error(`Failed to permanently delete from ${table}: HTTP ${response.status} - ${text}`);
  }
}

// Conversion functions: Gym types -> Supabase types
function toSupabaseClient(client: GymClientPayload): SupabaseInsert<SupabaseClient> {
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

function fromSupabaseClient(supabaseClient: SupabaseClient): SourcePayload {
  const source = isSourcePayload(supabaseClient.source_payload)
    ? supabaseClient.source_payload
    : {};
  const sourcePackage = isSourcePayload(source.package) ? source.package : undefined;
  const packageFromColumns = supabaseClient.package_key
    ? {
        ...sourcePackage,
        key: supabaseClient.package_key,
        name: supabaseClient.package_name ?? sourcePackage?.name,
        status: supabaseClient.package_status ?? sourcePackage?.status,
      }
    : sourcePackage;

  return {
    ...source,
    id: supabaseClient.client_code || supabaseClient.id,
    name: supabaseClient.full_name,
    email: supabaseClient.email,
    phone: supabaseClient.phone,
    address: supabaseClient.address,
    weight: supabaseClient.weight,
    height: supabaseClient.height,
    specialRequest: supabaseClient.special_request,
    memberSince: supabaseClient.member_since,
    package: packageFromColumns,
    username: supabaseClient.username ?? source.username,
  };
}

function toSupabaseTrainer(trainer: GymTrainerPayload): SupabaseInsert<SupabaseTrainer> {
  return {
    name: trainer.name,
    specialization: trainer.specialty,
    experience: trainer.experienceYears ? parseInt(trainer.experienceYears) : undefined,
    image_url: trainer.image,
    bio: trainer.certificate,
    trainer_key: trainer.name?.toLowerCase().replace(/\s+/g, "-"),
    category: trainer.category,
    clients_label: trainer.clients,
    source_payload: trainer,
  };
}

function fromSupabaseTrainer(supabaseTrainer: SupabaseTrainer): SourcePayload {
  return {
    id: supabaseTrainer.id,
    name: supabaseTrainer.name,
    specialty: supabaseTrainer.specialization,
    experienceYears: supabaseTrainer.experience?.toString(),
    image: supabaseTrainer.image_url || "/images/fitness-logo.jpg",
    certificate: supabaseTrainer.bio,
    category: supabaseTrainer.category,
    clients: supabaseTrainer.clients_label || "0 clients",
  };
}

function toSupabaseBlog(blog: SourcePayload): SupabaseInsert<SupabaseBlog> {
  const content = Array.isArray(blog.content) ? blog.content.map(String).join("\n\n") : String(blog.content || "");
  return {
    title: String(blog.title || "Untitled"),
    content,
    image_url: typeof blog.image === "string" ? blog.image : undefined,
    slug: typeof blog.slug === "string" ? blog.slug : undefined,
    author_name: typeof blog.author === "string" ? blog.author : undefined,
    category: typeof blog.category === "string" ? blog.category : undefined,
    read_time: typeof blog.readTime === "string" ? blog.readTime : undefined,
    summary: typeof blog.summary === "string" ? blog.summary : undefined,
    source_payload: blog,
  };
}

function fromSupabaseBlog(row: SupabaseBlog): SourcePayload {
  const source = isSourcePayload(row.source_payload) ? row.source_payload : {};
  return {
    ...source,
    id: row.id,
    slug: row.slug || source.slug || row.id,
    title: row.title,
    image: row.image_url || source.image || "/images/gym-corner.jpg",
    author: row.author_name || source.author || "Admin",
    category: row.category || source.category || "Fitness",
    readTime: row.read_time || source.readTime || "5 min read",
    summary: row.summary || source.summary || "",
    content: Array.isArray(source.content) ? source.content : row.content.split(/\n\n+/).filter(Boolean),
    date: source.date || new Date(row.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
  };
}

function toSupabaseMembership(plan: SourcePayload): SupabaseInsert<SupabaseMembership> {
  return {
    name: String(plan.name || "Membership"),
    duration: 30,
    price: Number(plan.price) || 0,
    plan_key: typeof plan.key === "string" ? plan.key : undefined,
    access: typeof plan.access === "string" ? plan.access : undefined,
    trainer: typeof plan.trainer === "string" ? plan.trainer : undefined,
    sessions_total: Number(plan.sessionsTotal) || 0,
    features: Array.isArray(plan.features) ? plan.features : [],
    upcoming_classes: Array.isArray(plan.upcomingClasses) ? plan.upcomingClasses : [],
    highlighted: Boolean(plan.highlighted),
    source_payload: plan,
  };
}

function fromSupabaseMembership(row: SupabaseMembership): SourcePayload {
  const source = isSourcePayload(row.source_payload) ? row.source_payload : {};
  return {
    ...source,
    id: row.id,
    key: row.plan_key || source.key || row.id,
    name: row.name,
    price: row.price,
    access: row.access || source.access || "",
    trainer: row.trainer || source.trainer || "",
    sessionsTotal: row.sessions_total || source.sessionsTotal || 0,
    features: Array.isArray(row.features) ? row.features : (source.features || []),
    upcomingClasses: Array.isArray(row.upcoming_classes) ? row.upcoming_classes : (source.upcomingClasses || []),
    highlighted: row.highlighted ?? source.highlighted ?? false,
  };
}

function toSupabaseClass(classSchedule: GymClassPayload): SupabaseInsert<SupabaseClass> {
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
    benefits: classSchedule.benefits ? classSchedule.benefits.split(",").map((b) => b.trim()).filter(Boolean) : [],
    full_schedule: classSchedule.schedule,
    tag: classSchedule.tag,
    class_key: classSchedule.className?.toLowerCase().replace(/\s+/g, "-"),
    capacity: parseInt(classSchedule.capacity || "") || 20,
    source_payload: classSchedule,
  };
}

function fromSupabaseClass(supabaseClass: SupabaseClass): SourcePayload {
  return {
    id: supabaseClass.id,
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
    tag: supabaseClass.tag,
  };
}

function toSupabaseProduct(product: GymProductPayload): SupabaseInsert<SupabaseProduct> {
  return {
    name: product.name,
    description: product.description || product.category,
    price: parseFloat((product.price || "").replace(/[^\d.]/g, "")) || 0,
    stock: parseInt(product.stock || "") || 0,
    image_url: product.image,
    brand_key: product.brandKey,
    brand_name: product.brandName,
    category: product.category,
    flavor: product.flavor,
    size_label: product.size,
    rating: parseFloat(product.rating || "") || 0,
    product_key: product.name?.toLowerCase().replace(/\s+/g, "-"),
    status: product.status,
    source_payload: product,
  };
}

function fromSupabaseProduct(supabaseProduct: SupabaseProduct): SourcePayload {
  const source = isSourcePayload(supabaseProduct.source_payload)
    ? supabaseProduct.source_payload
    : {};

  return {
    ...source,
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    brandKey: supabaseProduct.brand_key ?? source.brandKey,
    brandName: supabaseProduct.brand_name ?? source.brandName,
    category: supabaseProduct.category || supabaseProduct.description,
    flavor: supabaseProduct.flavor ?? source.flavor,
    size: supabaseProduct.size_label ?? source.size,
    price: `Rs ${supabaseProduct.price}`,
    rating: String(supabaseProduct.rating || source.rating || "4.5"),
    stock: supabaseProduct.stock.toString(),
    status: supabaseProduct.status,
    image: supabaseProduct.image_url,
    description: supabaseProduct.description,
  };
}

function toSupabaseBrand(brand: GymBrandPayload): SupabaseInsert<SupabaseBrand> {
  return {
    name: brand.name,
    brand_key: brand.key || brand.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    logo_url: brand.logo,
    banner_url: brand.banner,
    description: brand.description,
    status: brand.status || "Active",
    source_payload: brand,
  };
}

function fromSupabaseBrand(supabaseBrand: SupabaseBrand): SourcePayload {
  const source = isSourcePayload(supabaseBrand.source_payload)
    ? supabaseBrand.source_payload
    : {};

  return {
    ...source,
    id: supabaseBrand.id,
    key: supabaseBrand.brand_key || source.key || supabaseBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: supabaseBrand.name,
    logo: supabaseBrand.logo_url || source.logo,
    banner: supabaseBrand.banner_url || source.banner,
    description: supabaseBrand.description || source.description,
    status: supabaseBrand.status || source.status || "Active",
  };
}

function toSupabaseOffer(offer: GymOfferPayload): SupabaseInsert<SupabaseOffer> {
  return {
    title: offer.name,
    offer_type: offer.type,
    discount_percentage: parseFloat((offer.discount || "").replace(/[^\d.]/g, "")) || 0,
    code: offer.code,
    end_date: offer.validTill,
    status: offer.status,
    offer_key: offer.name?.toLowerCase().replace(/\s+/g, "-"),
    source_payload: offer,
  };
}

function fromSupabaseOffer(supabaseOffer: SupabaseOffer): SourcePayload {
  return {
    id: supabaseOffer.id,
    name: supabaseOffer.title,
    type: supabaseOffer.offer_type,
    discount: `${supabaseOffer.discount_percentage}%`,
    code: supabaseOffer.code,
    validTill: supabaseOffer.end_date,
    status: supabaseOffer.status,
  };
}

function isUuidString(val: unknown): boolean {
  return typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

function toSupabaseOrder(order: GymOrderPayload): SupabaseInsert<SupabaseOrder> {
  const rawClientId = order.clientId || order.client_id;
  const clientId = isUuidString(rawClientId) ? String(rawClientId) : undefined;

  return {
    ...(clientId ? { client_id: clientId } : {}),
    order_number: order.orderId,
    customer_name: order.customer,
    items: order.items,
    total_amount: parseFloat((order.total || "").replace(/[^\d.]/g, "")) || 0,
    payment_label: order.payment,
    payment_method: order.paymentMethod,
    phone: order.phone,
    status: order.status || "Processing",
    email: order.email,
    pickup_point: order.pickupPoint,
    address: order.address,
    source_payload: order,
  };
}

function fromSupabaseOrder(supabaseOrder: SupabaseOrder): SourcePayload {
  const source = isSourcePayload(supabaseOrder.source_payload)
    ? supabaseOrder.source_payload
    : {};
  return {
    ...source,
    id: supabaseOrder.id,
    orderId: supabaseOrder.order_number || (source.orderId as string) || `#${supabaseOrder.id}`,
    customer: supabaseOrder.customer_name || (source.customer as string) || "Customer",
    items: supabaseOrder.items || (source.items as string) || "Gym shop order",
    total: supabaseOrder.total_amount ? `Rs ${supabaseOrder.total_amount}` : ((source.total as string) || "Rs 0"),
    payment: supabaseOrder.payment_label || (source.payment as string) || "Pending",
    paymentMethod: supabaseOrder.payment_method || (source.paymentMethod as string) || "Cash on Pickup / Delivery",
    phone: supabaseOrder.phone || (source.phone as string) || "",
    status: supabaseOrder.status || (source.status as string) || "Processing",
    email: supabaseOrder.email || (source.email as string) || "",
    pickupPoint: supabaseOrder.pickup_point || (source.pickupPoint as string) || "",
    address: supabaseOrder.address || (source.address as string) || "",
    cartItems: (source.cartItems as Record<string, unknown>[]) || undefined,
    date: (source.date as string) || (supabaseOrder.created_at ? new Date(supabaseOrder.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })),
  };
}

function parseStarRating(rating: unknown): number {
  if (typeof rating === "number") return Math.min(5, Math.max(1, Math.round(rating)));
  if (!rating) return 5;
  const str = String(rating).trim();
  if (str.includes("★")) return Math.min(5, Math.max(1, str.length));
  const num = parseFloat(str);
  return isNaN(num) ? 5 : Math.min(5, Math.max(1, Math.round(num)));
}

function toSupabaseReview(review: GymReviewPayload): SupabaseInsert<SupabaseReview> {
  return {
    customer_name: review.customer,
    product_name: review.product,
    rating: parseStarRating(review.rating),
    comment: review.reviewText,
    status: review.status || "Approved",
    review_key: `${review.customer}-${review.product}`.toLowerCase().replace(/\s+/g, "-"),
    source_payload: review,
  };
}

function fromSupabaseReview(supabaseReview: SupabaseReview): SourcePayload {
  return {
    id: supabaseReview.id,
    customer: supabaseReview.customer_name,
    product: supabaseReview.product_name,
    rating: String(supabaseReview.rating || 5),
    reviewText: supabaseReview.comment,
    status: supabaseReview.status,
    date: new Date(supabaseReview.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

function toSupabasePayment(payment: GymPaymentPayload): SupabaseInsert<SupabasePayment> {
  return {
    txn_id: payment.txnId,
    member: payment.member,
    amount: parseFloat((payment.amount || "").replace(/[^\d.]/g, "")) || 0,
    method: payment.method,
    status: payment.status,
    date: payment.date,
    source_payload: payment,
  };
}

function fromSupabasePayment(supabasePayment: SupabasePayment): SourcePayload {
  return {
    txnId: supabasePayment.txn_id,
    member: supabasePayment.member,
    amount: `Rs ${supabasePayment.amount}`,
    method: supabasePayment.method,
    status: supabasePayment.status,
    date: supabasePayment.date || new Date(supabasePayment.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
  };
}

function toSupabaseAttendance(attendance: GymAttendancePayload): SupabaseInsert<SupabaseAttendance> {
  return {
    member: attendance.member,
    plan: attendance.plan,
    status: attendance.status,
    time: attendance.time,
    date: new Date().toISOString().split('T')[0],
    source_payload: attendance,
  };
}

function fromSupabaseAttendance(supabaseAttendance: SupabaseAttendance): SourcePayload {
  return {
    member: supabaseAttendance.member,
    plan: supabaseAttendance.plan,
    status: supabaseAttendance.status,
    time: supabaseAttendance.time,
  };
}

function toSupabaseBooking(booking: GymBookingPayload): SupabaseInsert<SupabaseBooking> {
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

function fromSupabaseBooking(supabaseBooking: SupabaseBooking): SourcePayload {
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

function toSupabaseContactMessage(message: GymContactMessagePayload): SupabaseInsert<SupabaseContactMessage> {
  return {
    name: message.name,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    message: message.message,
  };
}

function fromSupabaseContactMessage(supabaseMessage: SupabaseContactMessage): SourcePayload {
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
  create: (client: Record<string, unknown>) => supabasePost("clients", toSupabaseClient(client)),
  update: async (id: string, client: Record<string, unknown>) => {
    try {
      return await supabaseUpdate("clients", id, toSupabaseClient(client));
    } catch {
      const email = typeof client.email === "string" ? client.email.trim() : "";
      if (email) {
        const matches = await supabaseGet<SupabaseClient>("clients", { email }).catch(() => [] as SupabaseClient[]);
        if (matches.length > 0 && matches[0].id) {
          return await supabaseUpdate("clients", matches[0].id, toSupabaseClient(client));
        }
      }
      return await supabasePost("clients", toSupabaseClient(client));
    }
  },
  delete: (id: string) => supabaseDelete("clients", id),
  softDelete: (id: string) => supabaseSoftDelete("clients", id),
  restore: (id: string) => supabaseRestore("clients", id),
  permanentDelete: (id: string) => supabasePermanentDelete("clients", id),
};

export const supabaseTrainers = {
  get: () => supabaseGet<SupabaseTrainer>("trainers").then(data => data.map(fromSupabaseTrainer)),
  create: (trainer: Record<string, unknown>) => supabasePost("trainers", toSupabaseTrainer(trainer)),
  update: (id: string, trainer: Record<string, unknown>) => supabaseUpdate("trainers", id, toSupabaseTrainer(trainer)),
  delete: (id: string) => supabaseDelete("trainers", id),
  softDelete: (id: string) => supabaseSoftDelete("trainers", id),
  restore: (id: string) => supabaseRestore("trainers", id),
  permanentDelete: (id: string) => supabasePermanentDelete("trainers", id),
};

export const supabaseBlogs = {
  get: () => supabaseGet<SupabaseBlog>("blogs").then(data => data.map(fromSupabaseBlog)),
  create: (blog: Record<string, unknown>) => supabasePost("blogs", toSupabaseBlog(blog)),
  update: (id: string, blog: Record<string, unknown>) => supabaseUpdate("blogs", id, toSupabaseBlog(blog)),
  delete: (id: string) => supabaseDelete("blogs", id),
  softDelete: (id: string) => supabaseSoftDelete("blogs", id),
  restore: (id: string) => supabaseRestore("blogs", id),
  permanentDelete: (id: string) => supabasePermanentDelete("blogs", id),
};

export const supabaseMemberships = {
  get: () => supabaseGet<SupabaseMembership>("memberships").then(data => data.map(fromSupabaseMembership)),
  create: (plan: Record<string, unknown>) => supabasePost("memberships", toSupabaseMembership(plan)),
  update: (id: string, plan: Record<string, unknown>) => supabaseUpdate("memberships", id, toSupabaseMembership(plan)),
  delete: (id: string) => supabaseDelete("memberships", id),
  softDelete: (id: string) => supabaseSoftDelete("memberships", id),
  restore: (id: string) => supabaseRestore("memberships", id),
  permanentDelete: (id: string) => supabasePermanentDelete("memberships", id),
};

export const supabasePrograms = {
  get: () => supabaseGet<SupabaseClass>("programs").then(data => data.map(fromSupabaseClass)),
  create: (classSchedule: Record<string, unknown>) => supabasePost("programs", toSupabaseClass(classSchedule)),
  update: (id: string, classSchedule: Record<string, unknown>) => supabaseUpdate("programs", id, toSupabaseClass(classSchedule)),
  delete: (id: string) => supabaseDelete("programs", id),
  softDelete: (id: string) => supabaseSoftDelete("programs", id),
  restore: (id: string) => supabaseRestore("programs", id),
  permanentDelete: (id: string) => supabasePermanentDelete("programs", id),
};

export const supabaseClasses = supabasePrograms;

export const supabaseProducts = {
  get: () => supabaseGet<SupabaseProduct>("products").then(data => data.map(fromSupabaseProduct)),
  create: (product: Record<string, unknown>) => supabasePost("products", toSupabaseProduct(product)),
  update: (id: string, product: Record<string, unknown>) => supabaseUpdate("products", id, toSupabaseProduct(product)),
  delete: (id: string) => supabaseDelete("products", id),
  softDelete: (id: string) => supabaseSoftDelete("products", id),
  restore: (id: string) => supabaseRestore("products", id),
  permanentDelete: (id: string) => supabasePermanentDelete("products", id),
};

export const supabaseBrands = {
  get: () => supabaseGet<SupabaseBrand>("brands").then(data => data.map(fromSupabaseBrand)),
  create: (brand: Record<string, unknown>) => supabasePost("brands", toSupabaseBrand(brand)),
  update: (id: string, brand: Record<string, unknown>) => supabaseUpdate("brands", id, toSupabaseBrand(brand)),
  delete: (id: string) => supabaseDelete("brands", id),
  softDelete: (id: string) => supabaseSoftDelete("brands", id),
  restore: (id: string) => supabaseRestore("brands", id),
  permanentDelete: (id: string) => supabasePermanentDelete("brands", id),
};

export const supabaseOffers = {
  get: () => supabaseGet<SupabaseOffer>("offers").then(data => data.map(fromSupabaseOffer)),
  create: (offer: Record<string, unknown>) => supabasePost("offers", toSupabaseOffer(offer)),
  update: (id: string, offer: Record<string, unknown>) => supabaseUpdate("offers", id, toSupabaseOffer(offer)),
  delete: (id: string) => supabaseDelete("offers", id),
  softDelete: (id: string) => supabaseSoftDelete("offers", id),
  restore: (id: string) => supabaseRestore("offers", id),
  permanentDelete: (id: string) => supabasePermanentDelete("offers", id),
};

export const supabaseOrders = {
  get: () => supabaseGet<SupabaseOrder>("orders").then(data => data.map(fromSupabaseOrder)),
  create: (order: Record<string, unknown>) =>
    supabasePost("orders", toSupabaseOrder(order)).catch((err) => {
      console.warn("[supabaseOrders.create] Full payload failed, retrying with core columns:", err);
      const basicPayload = {
        order_number: (order.orderId as string) || (order.id as string),
        customer_name: (order.customer as string) || "Customer",
        items: (order.items as string) || "",
        total_amount: parseFloat(String(order.total || "").replace(/[^\d.]/g, "")) || 0,
        payment_label: (order.payment as string) || "Pending",
        status: (order.status as string) || "Processing",
      };
      return supabasePost("orders", basicPayload);
    }),
  update: (id: string, order: Record<string, unknown>) =>
    supabaseUpdate("orders", id, toSupabaseOrder(order)).catch((err) => {
      console.warn("[supabaseOrders.update] Full payload failed, retrying with core columns:", err);
      const basicPayload = {
        order_number: (order.orderId as string) || (order.id as string),
        customer_name: (order.customer as string) || "Customer",
        items: (order.items as string) || "",
        total_amount: parseFloat(String(order.total || "").replace(/[^\d.]/g, "")) || 0,
        payment_label: (order.payment as string) || "Pending",
        status: (order.status as string) || "Processing",
      };
      return supabaseUpdate("orders", id, basicPayload);
    }),
  delete: (id: string) => supabaseDelete("orders", id),
  softDelete: (id: string) => supabaseSoftDelete("orders", id),
  restore: (id: string) => supabaseRestore("orders", id),
  permanentDelete: (id: string) => supabasePermanentDelete("orders", id),
};

export const supabaseReviews = {
  get: () => supabaseGet<SupabaseReview>("reviews").then(data => data.map(fromSupabaseReview)),
  create: (review: Record<string, unknown>) => supabasePost("reviews", toSupabaseReview(review)),
  update: (id: string, review: Record<string, unknown>) => supabaseUpdate("reviews", id, toSupabaseReview(review)),
  delete: (id: string) => supabaseDelete("reviews", id),
  softDelete: (id: string) => supabaseSoftDelete("reviews", id),
  restore: (id: string) => supabaseRestore("reviews", id),
  permanentDelete: (id: string) => supabasePermanentDelete("reviews", id),
};

export const supabasePayments = {
  get: () => supabaseGet<SupabasePayment>("payments").then(data => data.map(fromSupabasePayment)),
  create: (payment: Record<string, unknown>) => supabasePost("payments", toSupabasePayment(payment)),
  update: (id: string, payment: Record<string, unknown>) => supabaseUpdate("payments", id, toSupabasePayment(payment)),
  delete: (id: string) => supabaseDelete("payments", id),
};

export const supabaseAttendance = {
  get: () => supabaseGet<SupabaseAttendance>("attendance").then(data => data.map(fromSupabaseAttendance)),
  create: (attendance: Record<string, unknown>) => supabasePost("attendance", toSupabaseAttendance(attendance)),
  update: (id: string, attendance: Record<string, unknown>) => supabaseUpdate("attendance", id, toSupabaseAttendance(attendance)),
  delete: (id: string) => supabaseDelete("attendance", id),
};

export const supabaseBookings = {
  get: () => supabaseGet<SupabaseBooking>("bookings").then(data => data.map(fromSupabaseBooking)),
  create: (booking: Record<string, unknown>) => supabasePost("bookings", toSupabaseBooking(booking)),
  update: (id: string, booking: Record<string, unknown>) => supabaseUpdate("bookings", id, toSupabaseBooking(booking)),
  delete: (id: string) => supabaseDelete("bookings", id),
};

export const supabaseContactMessages = {
  get: () => supabaseGet<SupabaseContactMessage>("contact_messages").then(data => data.map(fromSupabaseContactMessage)),
  create: (message: Record<string, unknown>) => supabasePost("contact_messages", toSupabaseContactMessage(message)),
  delete: (id: string) => supabaseDelete("contact_messages", id),
};

function toSupabaseShopCategory(cat: GymShopCategoryPayload): SupabaseInsert<SupabaseShopCategory> {
  return {
    id: cat.id,
    label: cat.label || "",
    category: cat.category || "Protein",
    image_url: cat.image,
    display_order: typeof cat.order === "number" ? cat.order : 0,
    source_payload: cat,
  };
}

function fromSupabaseShopCategory(row: SupabaseShopCategory): SourcePayload {
  const source = isSourcePayload(row.source_payload) ? row.source_payload : {};
  return {
    ...source,
    id: row.id,
    label: row.label,
    category: row.category,
    image: row.image_url ?? source.image,
    order: row.display_order ?? source.order ?? 0,
  };
}

export const supabaseShopCategories = {
  get: () => supabaseGet<SupabaseShopCategory>("shop_categories").then(data => data.map(fromSupabaseShopCategory)),
  create: (cat: Record<string, unknown>) => supabasePost("shop_categories", toSupabaseShopCategory(cat)),
  update: (id: string, cat: Record<string, unknown>) => supabaseUpdate("shop_categories", id, toSupabaseShopCategory(cat)),
  delete: (id: string) => supabaseDelete("shop_categories", id),
  softDelete: (id: string) => supabaseSoftDelete("shop_categories", id),
  restore: (id: string) => supabaseRestore("shop_categories", id),
  permanentDelete: (id: string) => supabasePermanentDelete("shop_categories", id),
};

interface SupabaseShopBuyer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  member_since?: string;
  source_payload?: unknown;
  created_at: string;
  updated_at: string;
}

export type ShopBuyer = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  memberSince?: string;
};

function toSupabaseShopBuyer(buyer: SourcePayload): SupabaseInsert<SupabaseShopBuyer> {
  return {
    full_name: String(buyer.name || ""),
    email: String(buyer.email || ""),
    phone: buyer.phone ? String(buyer.phone) : undefined,
    address: buyer.address ? String(buyer.address) : undefined,
    member_since: buyer.memberSince ? String(buyer.memberSince) : undefined,
    source_payload: buyer,
  };
}

function fromSupabaseShopBuyer(row: SupabaseShopBuyer): ShopBuyer {
  const source = isSourcePayload(row.source_payload) ? row.source_payload : {};
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone ?? (source.phone as string | undefined),
    address: row.address ?? (source.address as string | undefined),
    memberSince: row.member_since ?? (source.memberSince as string | undefined),
  };
}

export const supabaseShopBuyers = {
  get: () => supabaseGet<SupabaseShopBuyer>("shop_buyers").then((data) => data.map(fromSupabaseShopBuyer)),
  upsert: async (buyer: SourcePayload): Promise<ShopBuyer | null> => {
    const email = String(buyer.email || "");
    if (!email) return null;
    try {
      // Try update first (by email via params), then create if not found
      const existing = await supabaseGet<SupabaseShopBuyer>("shop_buyers", { email }).catch(() => [] as SupabaseShopBuyer[]);
      if (existing.length > 0 && existing[0].id) {
        const updated = (await supabaseUpdate("shop_buyers", existing[0].id, toSupabaseShopBuyer(buyer))) as unknown as SupabaseShopBuyer;
        return fromSupabaseShopBuyer(updated);
      }
      const created = (await supabasePost("shop_buyers", toSupabaseShopBuyer(buyer))) as unknown as SupabaseShopBuyer;
      return fromSupabaseShopBuyer(created);
    } catch {
      return null;
    }
  },
  delete: (id: string) => supabaseDelete("shop_buyers", id),
};

// Unified trash utilities — used by AdminPanel
export const supabaseTrash = {
  /** Soft-delete any supported table row */
  softDelete: (tableName: string, id: string) => supabaseSoftDelete(tableName, id),
  /** Restore any soft-deleted row */
  restore: (tableName: string, id: string) => supabaseRestore(tableName, id),
  /** Permanently delete any row */
  permanentDelete: (tableName: string, id: string) => supabasePermanentDelete(tableName, id),
};
