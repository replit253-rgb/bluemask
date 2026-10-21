import { products as initialProducts, type Product } from "./products";
import { topUpPackages as initialTopUpPackages, type TopUpPackage } from "./topup";
import {
  discordLink as defaultDiscord,
  whatsappNumber as defaultWa,
  services as initialServices,
  testimonials as initialTestimonials,
  type Service,
  type Testimonial,
} from "./catalog";

export interface PageContent {
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  leadText?: string;
  announcement?: string;
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

const DB_NAME = "bluemask_relational_db";
const DB_VERSION = 1;

const defaultPages: Record<string, PageContent> = {
  home: {
    slug: "home",
    title: "BlueMask Gaming Store",
    heroTitle: "BlueMask Gaming Store",
    heroSubtitle: "Great accounts. Safer trades. More possibilities in every game.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText:
      "Your trusted destination for game account trading, middleman services, and instant top-ups.",
    announcement: "Flash Sale: All game accounts feature an automatic 20% discount!",
    updatedAt: new Date().toISOString(),
  },
  accounts: {
    slug: "accounts",
    title: "Accounts Ready to Play",
    heroTitle: "Accounts Ready to Play",
    heroSubtitle: "Verified strategy game accounts with safe middleman transfer.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText: "Sample listings only. Confirm current availability and prices on Discord.",
    updatedAt: new Date().toISOString(),
  },
  contact: {
    slug: "contact",
    title: "We're here to help.",
    heroTitle: "Get in Touch with BlueMask",
    heroSubtitle:
      "Customer support for product questions, payment guidance, and transfer assistance.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText: "Reach our support team anytime on Discord or WhatsApp.",
    updatedAt: new Date().toISOString(),
  },
};

// Database connection helper using browser IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("products")) {
        const productStore = db.createObjectStore("products", { keyPath: "code" });
        productStore.createIndex("game", "game", { unique: false });
        productStore.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains("topups")) {
        const topupStore = db.createObjectStore("topups", { keyPath: "code" });
        topupStore.createIndex("game", "game", { unique: false });
      }

      if (!db.objectStoreNames.contains("pages")) {
        db.createObjectStore("pages", { keyPath: "slug" });
      }

      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback in-memory / storage cache for SSR or when IndexedDB is warming up
let memoryProducts: Product[] = [...initialProducts];
let memoryTopUps: TopUpPackage[] = [...initialTopUpPackages];
let memoryServices: Service[] = [...initialServices];
const memoryPages: Record<string, PageContent> = { ...defaultPages };

// Initialize database with initial seeds if empty
export async function initDatabase(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await openDatabase();

    // Check if products exist
    const tx = db.transaction(["products", "topups", "pages"], "readwrite");
    const pStore = tx.objectStore("products");
    const countReq = pStore.count();

    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        initialProducts.forEach((p) => pStore.add(p));
      }
    };

    const tStore = tx.objectStore("topups");
    const tCountReq = tStore.count();
    tCountReq.onsuccess = () => {
      if (tCountReq.result === 0) {
        initialTopUpPackages.forEach((t) => tStore.add(t));
      }
    };

    const pageStore = tx.objectStore("pages");
    const pageCountReq = pageStore.count();
    pageCountReq.onsuccess = () => {
      if (pageCountReq.result === 0) {
        Object.values(defaultPages).forEach((page) => pageStore.add(page));
      }
    };
  } catch (err) {
    console.warn("DB initialization notice:", err);
  }
}

// --- Product Repository ---
export async function getProductsFromDB(): Promise<Product[]> {
  if (typeof window === "undefined") return memoryProducts;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction("products", "readonly");
      const store = tx.objectStore("products");
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          memoryProducts = req.result;
          resolve(req.result);
        } else {
          resolve(memoryProducts);
        }
      };
      req.onerror = () => resolve(memoryProducts);
    });
  } catch {
    return memoryProducts;
  }
}

export async function saveProductToDB(product: Product): Promise<void> {
  memoryProducts = [product, ...memoryProducts.filter((p) => p.code !== product.code)];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bm_admin_products_v1", JSON.stringify(memoryProducts));
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  }

  if (typeof window === "undefined" || !window.indexedDB) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction("products", "readwrite");
    tx.objectStore("products").put(product);
  } catch (err) {
    console.warn("Save product DB error:", err);
  }
}

export async function deleteProductFromDB(code: string): Promise<void> {
  memoryProducts = memoryProducts.filter((p) => p.code !== code);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bm_admin_products_v1", JSON.stringify(memoryProducts));
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  }

  if (typeof window === "undefined" || !window.indexedDB) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction("products", "readwrite");
    tx.objectStore("products").delete(code);
  } catch (err) {
    console.warn("Delete product DB error:", err);
  }
}

// --- Top-Up Repository ---
export async function getTopUpsFromDB(): Promise<TopUpPackage[]> {
  if (typeof window === "undefined") return memoryTopUps;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction("topups", "readonly");
      const store = tx.objectStore("topups");
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          memoryTopUps = req.result;
          resolve(req.result);
        } else {
          resolve(memoryTopUps);
        }
      };
      req.onerror = () => resolve(memoryTopUps);
    });
  } catch {
    return memoryTopUps;
  }
}

export async function saveTopUpToDB(topup: TopUpPackage): Promise<void> {
  memoryTopUps = [topup, ...memoryTopUps.filter((t) => t.code !== topup.code)];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bm_admin_topups_v1", JSON.stringify(memoryTopUps));
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  }

  if (typeof window === "undefined" || !window.indexedDB) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction("topups", "readwrite");
    tx.objectStore("topups").put(topup);
  } catch (err) {
    console.warn("Save topup DB error:", err);
  }
}

export async function deleteTopUpFromDB(code: string): Promise<void> {
  memoryTopUps = memoryTopUps.filter((t) => t.code !== code);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bm_admin_topups_v1", JSON.stringify(memoryTopUps));
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  }

  if (typeof window === "undefined" || !window.indexedDB) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction("topups", "readwrite");
    tx.objectStore("topups").delete(code);
  } catch (err) {
    console.warn("Delete topup DB error:", err);
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

  if (typeof window === "undefined" || !window.indexedDB) return memoryPages[slug] || fallback;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction("pages", "readonly");
      const req = tx.objectStore("pages").get(slug);
      req.onsuccess = () => resolve(req.result || fallback);
      req.onerror = () => resolve(fallback);
    });
  } catch {
    return memoryPages[slug] || fallback;
  }
}

export async function savePageToDB(page: PageContent): Promise<void> {
  memoryPages[page.slug] = page;

  if (typeof window === "undefined" || !window.indexedDB) return;
  try {
    const db = await openDatabase();
    const tx = db.transaction("pages", "readwrite");
    tx.objectStore("pages").put(page);
  } catch (err) {
    console.warn("Save page DB error:", err);
  }
}

// --- Services / Middleman Repository ---
export async function getServicesFromDB(): Promise<Service[]> {
  if (typeof window === "undefined") return memoryServices;

  try {
    const raw = localStorage.getItem("bm_admin_services_v1");
    if (raw) {
      memoryServices = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Storage sync error:", err);
  }

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
    try {
      localStorage.setItem("bm_admin_services_v1", JSON.stringify(memoryServices));
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  }
}

export async function deleteServiceFromDB(slug: string): Promise<void> {
  memoryServices = memoryServices.filter((s) => s.slug !== slug);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bm_admin_services_v1", JSON.stringify(memoryServices));
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  }
}

// --- Testimonials Repository ---
let memoryTestimonials: Testimonial[] = initialTestimonials.map((t, idx) => ({
  ...t,
  id: t.id || `testi_${idx}_${Math.random().toString(36).slice(2, 6)}`,
}));

export async function getTestimonialsFromDB(): Promise<Testimonial[]> {
  if (typeof window === "undefined") return memoryTestimonials;
  try {
    const raw = localStorage.getItem("bm_admin_testimonials_v1");
    if (raw) {
      memoryTestimonials = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Storage sync error for testimonials:", err);
  }
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
    try {
      localStorage.setItem("bm_admin_testimonials_v1", JSON.stringify(memoryTestimonials));
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  }
}

export async function deleteTestimonialFromDB(id: string): Promise<void> {
  memoryTestimonials = memoryTestimonials.filter((t) => t.id !== id);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("bm_admin_testimonials_v1", JSON.stringify(memoryTestimonials));
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  }
}

// --- Media Upload Repository ---
export async function uploadImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;

      // Optimize image via canvas to keep size under 250KB for fast storage & loading
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

        const mediaItem: MediaItem = {
          id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          dataUrl: finalDataUrl,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          try {
            const db = await openDatabase();
            const tx = db.transaction("media", "readwrite");
            tx.objectStore("media").put(mediaItem);
          } catch (err) {
            console.warn("Media storage error:", err);
          }
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
