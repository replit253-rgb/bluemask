import { products as initialProducts, type Product } from "./products";
import {
  topUpPackages as initialTopUpPackages,
  type TopUpPackage,
  normalizeCategory,
} from "./topup";
import {
  services as initialServices,
  testimonials as initialTestimonials,
  type Service,
  type Testimonial,
} from "./catalog";
import {
  getProductsFn,
  saveProductFn,
  deleteProductFn,
  getTopupsFn,
  saveTopupFn,
  deleteTopupFn,
  getPageFn,
  savePageFn,
  getFaqsFn,
} from "./pg-server-fn";

export interface PageContent {
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageMobile?: string;
  leadText?: string;
  announcement?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const defaultPages: Record<string, PageContent> = {
  home: {
    slug: "home",
    title: "RedMoon Gaming Store",
    heroTitle: "RedMoon Gaming Store",
    heroSubtitle: "Great accounts. Safer trades. More possibilities in every game.",
    heroImage: "/bg-hero-deskrop.png",
    heroImageMobile: "/bg-hero-mobile.png",
    leadText:
      "Your trusted destination for game account trading, middleman services, and instant top-ups.",
    announcement: "Flash Sale: All game accounts feature an automatic 20% discount!",
    buttonText: "Browse Accounts",
    buttonLink: "/accounts",
    secondaryButtonText: "Explore Top Up",
    secondaryButtonLink: "/games",
    sectionTitle: "Featured Verified Accounts",
    sectionSubtitle:
      "Fully verified high-level strategy game accounts ready for secure instant transfer.",
    updatedAt: new Date().toISOString(),
  },
  accounts: {
    slug: "accounts",
    title: "Accounts Ready to Play",
    heroTitle: "Accounts Ready to Play",
    heroSubtitle: "Verified strategy game accounts with safe middleman transfer.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText: "Sample listings only. Confirm current availability and prices on Discord.",
    sectionTitle: "All Available Accounts",
    sectionSubtitle: "Filter by game title or server to find your next power account.",
    updatedAt: new Date().toISOString(),
  },
  games: {
    slug: "games",
    title: "Game Top Up Center",
    heroTitle: "Instant Game Top Up",
    heroSubtitle: "Fast and secure game currency top-up for Whiteout Survival and Kingshot.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText: "Select your game and pack ID to top up instantly with reliable delivery.",
    sectionTitle: "Available Pack IDs & Top Up Catalogs",
    sectionSubtitle: "Frost Star Pack for Whiteout Survival & Kingdom Star Pack for Kingshot.",
    updatedAt: new Date().toISOString(),
  },
  services: {
    slug: "services",
    title: "Professional Gaming Services & Middleman",
    heroTitle: "Middleman & Account Services",
    heroSubtitle:
      "Secure escrow, account leveling, and trading assistance by professional operators.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText: "Protect your trades and guarantee smooth transfers with RedMoon Middleman.",
    sectionTitle: "Our Professional Services",
    sectionSubtitle: "Choose a service category to begin your order.",
    updatedAt: new Date().toISOString(),
  },
  contact: {
    slug: "contact",
    title: "We're here to help.",
    heroTitle: "Get in Touch with RedMoon",
    heroSubtitle:
      "Customer support for product questions, payment guidance, and transfer assistance.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText: "Reach our support team anytime on Discord or WhatsApp.",
    sectionTitle: "Direct Communication Channels",
    sectionSubtitle: "We reply within minutes during active hours.",
    updatedAt: new Date().toISOString(),
  },
  global_chrome: {
    slug: "global_chrome",
    title: "Global Header, Footer & Announcements",
    heroTitle: "Global Site Settings",
    heroSubtitle: "Manage site-wide announcement banners, brand titles, and footer text.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText: "Global changes apply across all public pages instantly.",
    announcement: "Flash Sale: All game accounts feature an automatic 20% discount!",
    updatedAt: new Date().toISOString(),
  },
};

let memoryProducts: Product[] = [...initialProducts];
let memoryTopUps: TopUpPackage[] = [...initialTopUpPackages];
let memoryServices: Service[] = [...initialServices];
const memoryPages: Record<string, PageContent> = { ...defaultPages };
let memoryTestimonials: Testimonial[] = initialTestimonials.map((t, idx) => ({
  ...t,
  id: t.id || `testi_${idx}_${Math.random().toString(36).slice(2, 6)}`,
}));
let memoryFaqs: FAQ[] = [];

export async function initDatabase(): Promise<void> {
  try {
    const data = await getProductsFn();
    if (Array.isArray(data) && data.length > 0) {
      memoryProducts = data as Product[];
    }
  } catch (err) {
    console.warn("PostgreSQL initDatabase error:", err);
  }
}

// --- Product Repository ---
export async function getProductsFromDB(): Promise<Product[]> {
  try {
    const data = await getProductsFn();
    if (Array.isArray(data) && data.length > 0) {
      memoryProducts = data as Product[];
      return memoryProducts;
    }
  } catch (err) {
    console.warn("PostgreSQL getProducts error:", err);
  }
  return memoryProducts;
}

export async function saveProductToDB(product: Product): Promise<void> {
  memoryProducts = [product, ...memoryProducts.filter((p) => p.code !== product.code)];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("products-changed"));
  }
  try {
    await saveProductFn({ data: product as unknown as Record<string, unknown> });
  } catch (err) {
    console.warn("PostgreSQL saveProduct error:", err);
  }
}

export async function deleteProductFromDB(code: string): Promise<void> {
  memoryProducts = memoryProducts.filter((p) => p.code !== code);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("products-changed"));
  }
  try {
    await deleteProductFn({ data: { code } });
  } catch (err) {
    console.warn("PostgreSQL deleteProduct error:", err);
  }
}

// --- Top-Up Repository ---
export async function getTopUpsFromDB(): Promise<TopUpPackage[]> {
  try {
    const data = await getTopupsFn();
    if (Array.isArray(data) && data.length > 0) {
      memoryTopUps = data.map(normalizeCategory);
      return memoryTopUps;
    }
  } catch (err) {
    console.warn("PostgreSQL getTopups error:", err);
  }
  return memoryTopUps.map(normalizeCategory);
}

export async function saveTopUpToDB(topup: TopUpPackage): Promise<void> {
  memoryTopUps = [topup, ...memoryTopUps.filter((t) => t.code !== topup.code)];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("topups-changed"));
  }
  try {
    await saveTopupFn({ data: topup as unknown as Record<string, unknown> });
  } catch (err) {
    console.warn("PostgreSQL saveTopup error:", err);
  }
}

export async function deleteTopUpFromDB(code: string): Promise<void> {
  memoryTopUps = memoryTopUps.filter((t) => t.code !== code);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("topups-changed"));
  }
  try {
    await deleteTopupFn({ data: { code } });
  } catch (err) {
    console.warn("PostgreSQL deleteTopup error:", err);
  }
}

// --- Pages / CMS Repository ---
export async function getPageFromDB(slug: string): Promise<PageContent> {
  const fallback = defaultPages[slug] || {
    slug,
    title: "Page",
    heroTitle: "Page Title",
    heroSubtitle: "Subtitle",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    updatedAt: new Date().toISOString(),
  };

  try {
    const data = await getPageFn({ data: { slug } });
    if (data) {
      memoryPages[slug] = data;
      return data;
    }
  } catch (err) {
    console.warn("PostgreSQL getPage error:", err);
  }
  return memoryPages[slug] || fallback;
}

export async function savePageToDB(page: PageContent): Promise<void> {
  memoryPages[page.slug] = page;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pages-changed"));
  }
  try {
    await savePageFn({ data: page as unknown as Record<string, unknown> });
  } catch (err) {
    console.warn("PostgreSQL savePage error:", err);
  }
}

// --- Services Repository ---
export async function getServicesFromDB(): Promise<Service[]> {
  return memoryServices;
}

export async function saveServiceToDB(service: Service): Promise<void> {
  const existingIdx = memoryServices.findIndex((s) => s.slug === service.slug);
  if (existingIdx >= 0) {
    memoryServices[existingIdx] = service;
  } else {
    memoryServices.push(service);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("services-changed"));
  }
}

export async function deleteServiceFromDB(slug: string): Promise<void> {
  memoryServices = memoryServices.filter((s) => s.slug !== slug);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("services-changed"));
  }
}

// --- Testimonials Repository ---
export async function getTestimonialsFromDB(): Promise<Testimonial[]> {
  return memoryTestimonials;
}

export async function saveTestimonialToDB(testimonial: Testimonial): Promise<void> {
  if (!testimonial.id) {
    testimonial.id = `testi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }
  const existingIdx = memoryTestimonials.findIndex((t) => t.id === testimonial.id);
  if (existingIdx >= 0) {
    memoryTestimonials[existingIdx] = testimonial;
  } else {
    memoryTestimonials = [testimonial, ...memoryTestimonials];
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("testimonials-changed"));
  }
}

export async function deleteTestimonialFromDB(id: string): Promise<void> {
  memoryTestimonials = memoryTestimonials.filter((t) => t.id !== id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("testimonials-changed"));
  }
}

// --- Media Upload Repository ---
export async function uploadImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;

      const img = new Image();
      img.onload = async () => {
        let finalDataUrl = rawDataUrl;
        try {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            finalDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          }
        } catch (err) {
          console.warn("Canvas compression fallback:", err);
        }

        resolve(finalDataUrl);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export async function uploadMultipleImages(files: FileList | File[]): Promise<string[]> {
  const fileArray = Array.from(files);
  const results: string[] = [];
  for (const file of fileArray) {
    if (file.type.startsWith("image/")) {
      try {
        const url = await uploadImageFile(file);
        results.push(url);
      } catch (err) {
        console.warn("Failed to upload image file:", file.name, err);
      }
    }
  }
  return results;
}

// --- FAQ Repository ---
export async function getFaqsFromDB(): Promise<FAQ[]> {
  try {
    const data = await getFaqsFn();
    if (Array.isArray(data) && data.length > 0) {
      memoryFaqs = data;
      return data;
    }
  } catch (err) {
    console.warn("PostgreSQL getFaqs error:", err);
  }
  return memoryFaqs;
}

export async function saveFaqToDB(faq: FAQ): Promise<void> {
  const idx = memoryFaqs.findIndex((f) => f.id === faq.id);
  if (idx >= 0) memoryFaqs[idx] = faq;
  else memoryFaqs.push(faq);
}

export async function deleteFaqFromDB(id: string): Promise<void> {
  memoryFaqs = memoryFaqs.filter((f) => f.id !== id);
}
