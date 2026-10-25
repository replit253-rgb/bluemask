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
  saveFaqFn,
  deleteFaqFn,
  getServicesFn,
  saveServiceFn,
  deleteServiceFn,
  getTestimonialsFn,
  saveTestimonialFn,
  deleteTestimonialFn,
  getStoreSettingsFn,
  saveStoreSettingsFn,
  verifyAdminLoginFn,
  changeAdminPasswordFn,
  getGameWorldsFn,
  saveGameWorldsFn,
  getHomeGamesFn,
  saveHomeGamesFn,
  uploadImageFn,
} from "./pg-server-fn";
import { type Product } from "./products";
import { type TopUpPackage, normalizeCategory } from "./topup";
import { type Service, type Testimonial } from "./catalog";
import { type StoreSettings } from "./admin-store";

export interface PageContent {
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageMobile?: string | undefined;
  leadText?: string | undefined;
  announcement?: string | undefined;
  buttonText?: string | undefined;
  buttonLink?: string | undefined;
  secondaryButtonText?: string | undefined;
  secondaryButtonLink?: string | undefined;
  sectionTitle?: string | undefined;
  sectionSubtitle?: string | undefined;
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

export async function initDatabase(): Promise<void> {
  // No-op. Relying on loaders.
}

// --- Product Repository ---
export async function getProductsFromDB(): Promise<Product[]> {
  return (await getProductsFn()) as Product[];
}

export async function saveProductToDB(product: Product): Promise<void> {
  await saveProductFn({ data: product as unknown as Record<string, unknown> });
}

export async function deleteProductFromDB(code: string): Promise<void> {
  await deleteProductFn({ data: { code } });
}

// --- Top-Up Repository ---
export async function getTopUpsFromDB(): Promise<TopUpPackage[]> {
  const data = await getTopupsFn();
  return (data as any[]).map(normalizeCategory);
}

export async function saveTopUpToDB(topup: TopUpPackage): Promise<void> {
  await saveTopupFn({ data: topup as unknown as Record<string, unknown> });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("topups-changed"));
    try {
      window.localStorage.setItem("bm_topups_updated", String(Date.now()));
    } catch (error) {
      console.error("Top-up saved, but cross-tab refresh notification failed:", error);
    }
  }
}

export async function deleteTopUpFromDB(code: string): Promise<void> {
  await deleteTopupFn({ data: { code } });
}

export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  const result = await verifyAdminLoginFn({ data: { username, password } });
  return result.authenticated;
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await changeAdminPasswordFn({ data: { currentPassword, newPassword } });
}

// --- Pages / CMS Repository ---
export async function getPageFromDB(slug: string): Promise<PageContent | null> {
  return (await getPageFn({ data: { slug } })) as PageContent | null;
}

export async function savePageToDB(page: PageContent): Promise<void> {
  await savePageFn({ data: page as unknown as Record<string, unknown> });
}

// --- Services Repository ---
export async function getServicesFromDB(): Promise<Service[]> {
  return (await getServicesFn()) as Service[];
}

export async function saveServiceToDB(service: Service): Promise<void> {
  await saveServiceFn({ data: service as unknown as Record<string, unknown> });
}

export async function deleteServiceFromDB(slug: string): Promise<void> {
  await deleteServiceFn({ data: { slug } });
}

// --- Testimonials Repository ---
export async function getTestimonialsFromDB(): Promise<Testimonial[]> {
  return (await getTestimonialsFn()) as Testimonial[];
}

export async function saveTestimonialToDB(testimonial: Testimonial): Promise<void> {
  await saveTestimonialFn({ data: testimonial as unknown as Record<string, unknown> });
}

export async function deleteTestimonialFromDB(id: string): Promise<void> {
  await deleteTestimonialFn({ data: { id } });
}

// --- Media Upload Repository ---
export async function uploadImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const result = await uploadImageFn({
          data: {
            base64: dataUrl,
            fileName: file.name,
            contentType: file.type,
          },
        });
        resolve(result.url);
      } catch (err) {
        console.error("Server upload failed:", err);
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
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
  return (await getFaqsFn()) as FAQ[];
}

export async function saveFaqToDB(faq: FAQ): Promise<void> {
  await saveFaqFn({ data: faq as unknown as Record<string, unknown> });
}

export async function deleteFaqFromDB(id: string): Promise<void> {
  await deleteFaqFn({ data: { id } });
}

// --- Store Settings Repository ---
export async function getStoreSettingsFromDB(): Promise<StoreSettings> {
  const data = await getStoreSettingsFn();
  return {
    discordLink: typeof data.discordLink === "string" ? data.discordLink : "",
    whatsapp: typeof data.whatsapp === "string" ? data.whatsapp : "",
    discordUsers: Array.isArray(data.discordUsers) ? data.discordUsers : [],
  };
}

export async function saveStoreSettingsToDB(settings: StoreSettings): Promise<void> {
  await saveStoreSettingsFn({ data: { key: "site_config", value: settings } });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("store-settings-changed"));
}

// --- Game Worlds Repository ---
export async function getGameWorldsFromDB(): Promise<any> {
  return await getGameWorldsFn();
}

export async function saveGameWorldsToDB(data: any): Promise<void> {
  await saveGameWorldsFn({ data });
}

// --- Home Games Repository ---
export async function getHomeGamesFromDB(): Promise<any> {
  return await getHomeGamesFn();
}

export async function saveHomeGamesToDB(data: any): Promise<void> {
  await saveHomeGamesFn({ data });
}
