import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  Package,
  CreditCard,
  Settings,
  Check,
  ArrowUpRight,
  TrendingUp,
  X,
  Upload,
  Layout,
  Image as ImageIcon,
  Search,
  ExternalLink,
  Layers,
  RotateCcw,
  MessageSquare,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteChrome";
import {
  getProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  getTopUpsFromDB,
  saveTopUpToDB,
  deleteTopUpFromDB,
  getServicesFromDB,
  saveServiceToDB,
  deleteServiceFromDB,
  getTestimonialsFromDB,
  saveTestimonialToDB,
  deleteTestimonialFromDB,
  uploadImageFile,
  uploadMultipleImages,
  initDatabase,
} from "@/lib/db";
import { getStoreSettings, saveStoreSettings } from "@/lib/admin-store";
import { formatCurrency, type Product } from "@/lib/products";
// ... (I need to find where to replace all instances)

import {
  findGame,
  games,
  services as defaultServices,
  type GameSlug,
  type Service,
  type Testimonial,
} from "@/lib/catalog";
import { type TopUpPackage, normalizeCategory, GAME_TOPUP_CATEGORIES } from "@/lib/topup";
import { TopUpProductDetailModal } from "@/components/TopUp";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Store Management Panel — BlueMask" },
      {
        name: "description",
        content:
          "Store management portal for BlueMask gaming accounts, top-ups, and middleware services.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

type AdminTab = "overview" | "accounts" | "topups" | "services" | "testimonials" | "settings";

export function AdminDashboardPage() {
  const navigate = useNavigate();

  // Navigation & Notification
  const [tab, setTab] = useState<AdminTab>("overview");
  const [notice, setNotice] = useState<string | null>(null);

  // Repositories
  const [products, setProducts] = useState<Product[]>([]);
  const [topups, setTopups] = useState<TopUpPackage[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>(defaultServices);
  const [settings, setSettings] = useState({ discordLink: "", whatsapp: "" });

  // Filters & Search
  const [accountSearch, setAccountSearch] = useState("");
  const [accountGameFilter, setAccountGameFilter] = useState<string>("all");
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>("all");

  const [topupSearch, setTopupSearch] = useState("");
  const [topupGameFilter, setTopupGameFilter] = useState<string>("all");
  const [topupCategoryFilter, setTopupCategoryFilter] = useState<string>("all");

  // Account Modals State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: "",
    game: "whiteout-survival",
    title: "",
    badge: "Ready",
    price: 100,
    status: "tersedia",
    server: "",
    description: "",
    image: "",
    screenshots: [],
    stats: [
      { label: "Level", value: "Max" },
      { label: "Power", value: "50M" },
      { label: "VIP", value: "8" },
      { label: "State", value: "#100" },
    ],
    highlights: ["Clean account credentials", "Safe middleman transaction"],
  });

  // TopUp Modals State
  const [isAddingTopUp, setIsAddingTopUp] = useState(false);
  const [editingTopUp, setEditingTopUp] = useState<TopUpPackage | null>(null);
  const [confirmDeleteTopUp, setConfirmDeleteTopUp] = useState<string | null>(null);
  const [previewTopUp, setPreviewTopUp] = useState<TopUpPackage | null>(null);

  const [newTopUp, setNewTopUp] = useState<Partial<TopUpPackage>>({
    code: "",
    game: "whiteout-survival",
    name: "",
    detail: "Event pack & gems",
    price: 10,
    popular: false,
    image: "",
    category: "Pack ID Top Up",
    description: "",
    features: [
      "Direct account top up via Player ID",
      "No account password required",
      "Instant Discord ticket delivery (5-15 mins)",
    ],
    instructions: "Provide your Player ID and State / Kingdom number in your Discord ticket.",
    deliveryTime: "5 - 15 Minutes",
  });

  // Services / Middleware Modals State
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirmDeleteService, setConfirmDeleteService] = useState<string | null>(null);

  const [newService, setNewService] = useState<Partial<Service>>({
    slug: "",
    name: "",
    tagline: "",
    intro: "",
    fee: "5% min $2",
    image: "",
    checklist: ["Player ID", "Account credentials agreement", "Confirmation screenshot"],
    steps: [
      { title: "Open a ticket", text: "Contact the BlueMask team on Discord with deal details." },
      { title: "Review & Hold", text: "BlueMask holds funds safely until handover is complete." },
      { title: "Complete", text: "Account verified and funds released smoothly." },
    ],
    gameSlugs: ["whiteout-survival", "kingshot", "rise-of-kingdoms", "call-of-dragons"],
  });

  // Upload Loaders
  const [isUploading, setIsUploading] = useState(false);
  const fileCoverAddRef = useRef<HTMLInputElement | null>(null);
  const fileCoverEditRef = useRef<HTMLInputElement | null>(null);
  const fileScreenshotsAddRef = useRef<HTMLInputElement | null>(null);
  const fileScreenshotsEditRef = useRef<HTMLInputElement | null>(null);
  const fileTopupAddRef = useRef<HTMLInputElement | null>(null);
  const fileTopupEditRef = useRef<HTMLInputElement | null>(null);
  const fileServiceAddRef = useRef<HTMLInputElement | null>(null);
  const fileServiceEditRef = useRef<HTMLInputElement | null>(null);

  // Initial Auth & Data Load
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("bm_is_admin") !== "true") {
      navigate({ to: "/admin/login" });
      return;
    }

    initDatabase().then(() => {
      getProductsFromDB().then((p) => setProducts(p));
      getTopUpsFromDB().then((t) => setTopups(t));
      getServicesFromDB().then((s) => {
        if (s && s.length > 0) setServicesList(s);
      });
      getTestimonialsFromDB().then((t) => {
        if (t && t.length > 0) setTestimonialsList(t);
      });
    });
    setSettings(getStoreSettings());
  }, [navigate]);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bm_is_admin");
    }
    navigate({ to: "/admin/login" });
  };

  // -------------------------------------------------------------
  // DEVICE IMAGE UPLOAD HANDLERS
  // -------------------------------------------------------------
  const handleUploadCoverAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      setNewProduct((prev) => ({ ...prev, image: url }));
      showNotification("Cover image uploaded from device.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadCoverEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      setEditingProduct((prev) => (prev ? { ...prev, image: url } : null));
      showNotification("Cover image updated from device.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadScreenshotsAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const urls = await uploadMultipleImages(files);
      setNewProduct((prev) => ({
        ...prev,
        screenshots: [...(prev.screenshots || []), ...urls],
      }));
      showNotification(`${urls.length} screenshots uploaded from device.`);
    } catch {
      showNotification("Failed to upload screenshots.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadScreenshotsEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;
    try {
      setIsUploading(true);
      const urls = await uploadMultipleImages(files);
      setEditingProduct((prev) =>
        prev
          ? {
              ...prev,
              screenshots: [...(prev.screenshots || []), ...urls],
            }
          : null,
      );
      showNotification(`${urls.length} screenshots added from device.`);
    } catch {
      showNotification("Failed to upload screenshots.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadTopUpAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      setNewTopUp((prev) => ({ ...prev, image: url }));
      showNotification("Top-up pack image uploaded from device.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadTopUpEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTopUp) return;
    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      setEditingTopUp((prev) => (prev ? { ...prev, image: url } : null));
      showNotification("Top-up image updated from device.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadServiceAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      setNewService((prev) => ({ ...prev, image: url }));
      showNotification("Service image uploaded from device.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadServiceEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingService) return;
    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      setEditingService((prev) => (prev ? { ...prev, image: url } : null));
      showNotification("Service image updated from device.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  // -------------------------------------------------------------
  // TESTIMONIALS CRUD & UPLOAD
  // -------------------------------------------------------------
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [confirmDeleteTestimonial, setConfirmDeleteTestimonial] = useState<string | null>(null);

  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: "",
    role: "Buyer",
    game: "whiteout-survival",
    service: "middleman",
    quote: "",
    date: "Oct 2026",
    image: "",
  });

  const fileTestimonialAddRef = useRef<HTMLInputElement | null>(null);
  const fileTestimonialEditRef = useRef<HTMLInputElement | null>(null);

  const handleUploadTestimonialAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      setNewTestimonial((prev) => ({ ...prev, image: url }));
      showNotification("Testimonial image uploaded from device.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadTestimonialEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingTestimonial) return;
    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      setEditingTestimonial((prev) => (prev ? { ...prev, image: url } : null));
      showNotification("Testimonial image updated from device.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveNewTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.quote) return;

    const item: Testimonial = {
      id: `testi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newTestimonial.name.trim(),
      role: (newTestimonial.role as "Buyer" | "Seller") || "Buyer",
      game: (newTestimonial.game as GameSlug | "all") || "all",
      service: (newTestimonial.service as Service["slug"]) || "middleman",
      quote: newTestimonial.quote.trim(),
      date: newTestimonial.date?.trim() || "Oct 2026",
      image: newTestimonial.image || undefined,
    };

    await saveTestimonialToDB(item);
    setTestimonialsList([item, ...testimonialsList]);
    setIsAddingTestimonial(false);
    setNewTestimonial({
      name: "",
      role: "Buyer",
      game: "whiteout-survival",
      service: "middleman",
      quote: "",
      date: "Oct 2026",
      image: "",
    });
    showNotification(`Testimonial from ${item.name} added and published.`);
  };

  const handleUpdateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    await saveTestimonialToDB(editingTestimonial);
    setTestimonialsList(
      testimonialsList.map((t) => (t.id === editingTestimonial.id ? editingTestimonial : t)),
    );
    setEditingTestimonial(null);
    showNotification("Testimonial updated successfully.");
  };

  const executeDeleteTestimonial = async (id: string) => {
    await deleteTestimonialFromDB(id);
    setTestimonialsList(testimonialsList.filter((t) => t.id !== id));
    setConfirmDeleteTestimonial(null);
    showNotification("Testimonial removed.");
  };

  // -------------------------------------------------------------
  // ACCOUNTS CRUD
  // -------------------------------------------------------------
  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.code || !newProduct.title) return;

    const code = newProduct.code.trim().toUpperCase();
    const item: Product = {
      code,
      game: (newProduct.game as GameSlug) || "whiteout-survival",
      title: newProduct.title.trim(),
      badge: newProduct.badge?.trim() || "Ready",
      price: Number(newProduct.price) || 100,
      hasDiscount: newProduct.hasDiscount ?? true,
      discountPercent: Number(newProduct.discountPercent) || 20,
      status: (newProduct.status as Product["status"]) || "tersedia",
      image: newProduct.image || undefined,
      screenshots: newProduct.screenshots || [],
      description: newProduct.description?.trim() || undefined,
      server: newProduct.server?.trim() || undefined,
      stats:
        newProduct.stats && newProduct.stats.length > 0
          ? newProduct.stats
          : [
              { label: "Level", value: newProduct.badge || "Max" },
              { label: "Status", value: "Verified" },
            ],
      highlights:
        newProduct.highlights && newProduct.highlights.length > 0
          ? newProduct.highlights
          : ["Clean account credentials", "Safe middleman transaction"],
    };

    await saveProductToDB(item);
    setProducts([item, ...products.filter((p) => p.code !== item.code)]);
    setIsAddingProduct(false);
    setNewProduct({
      code: "",
      game: "whiteout-survival",
      title: "",
      badge: "Ready",
      price: 1_500_000,
      status: "tersedia",
      server: "",
      description: "",
      image: "",
      screenshots: [],
      stats: [
        { label: "Level", value: "Max" },
        { label: "Power", value: "50M" },
      ],
      highlights: ["Clean account credentials", "Safe middleman transaction"],
    });
    showNotification(`Account ${item.code} created and saved to database.`);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await saveProductToDB(editingProduct);
    setProducts(products.map((p) => (p.code === editingProduct.code ? editingProduct : p)));
    setEditingProduct(null);
    showNotification(`Account ${editingProduct.code} updated in database.`);
  };

  const handleToggleProductStatus = async (code: string) => {
    const target = products.find((p) => p.code === code);
    if (!target) return;
    const updated: Product = {
      ...target,
      status: target.status === "tersedia" ? "terjual" : "tersedia",
    };
    await saveProductToDB(updated);
    setProducts(products.map((p) => (p.code === code ? updated : p)));
    showNotification(`Account ${code} status changed to ${updated.status}.`);
  };

  const executeDeleteProduct = async (code: string) => {
    await deleteProductFromDB(code);
    setProducts(products.filter((p) => p.code !== code));
    setConfirmDeleteProduct(null);
    showNotification(`Account ${code} removed from database.`);
  };

  // Helper to add/remove dynamic stats in edit/add product
  const addStatField = (isEdit: boolean) => {
    if (isEdit) {
      if (!editingProduct) return;
      setEditingProduct({
        ...editingProduct,
        stats: [...editingProduct.stats, { label: "Spec", value: "Value" }],
      });
    } else {
      setNewProduct((prev) => ({
        ...prev,
        stats: [...(prev.stats || []), { label: "Spec", value: "Value" }],
      }));
    }
  };

  const removeStatField = (isEdit: boolean, index: number) => {
    if (isEdit) {
      if (!editingProduct) return;
      const updated = editingProduct.stats.filter((_, i) => i !== index);
      setEditingProduct({ ...editingProduct, stats: updated });
    } else {
      setNewProduct((prev) => ({
        ...prev,
        stats: (prev.stats || []).filter((_, i) => i !== index),
      }));
    }
  };

  const updateStatField = (isEdit: boolean, index: number, key: "label" | "value", val: string) => {
    if (isEdit) {
      if (!editingProduct) return;
      const updated = [...editingProduct.stats];
      updated[index] = { ...updated[index], [key]: val };
      setEditingProduct({ ...editingProduct, stats: updated });
    } else {
      setNewProduct((prev) => {
        const stats = [...(prev.stats || [])];
        stats[index] = { ...stats[index], [key]: val };
        return { ...prev, stats };
      });
    }
  };

  // Helper to add/remove highlights in edit/add product
  const addHighlightField = (isEdit: boolean) => {
    if (isEdit) {
      if (!editingProduct) return;
      setEditingProduct({
        ...editingProduct,
        highlights: [...editingProduct.highlights, "New highlight point"],
      });
    } else {
      setNewProduct((prev) => ({
        ...prev,
        highlights: [...(prev.highlights || []), "New highlight point"],
      }));
    }
  };

  const removeHighlightField = (isEdit: boolean, index: number) => {
    if (isEdit) {
      if (!editingProduct) return;
      setEditingProduct({
        ...editingProduct,
        highlights: editingProduct.highlights.filter((_, i) => i !== index),
      });
    } else {
      setNewProduct((prev) => ({
        ...prev,
        highlights: (prev.highlights || []).filter((_, i) => i !== index),
      }));
    }
  };

  const updateHighlightField = (isEdit: boolean, index: number, val: string) => {
    if (isEdit) {
      if (!editingProduct) return;
      const updated = [...editingProduct.highlights];
      updated[index] = val;
      setEditingProduct({ ...editingProduct, highlights: updated });
    } else {
      setNewProduct((prev) => {
        const highlights = [...(prev.highlights || [])];
        highlights[index] = val;
        return { ...prev, highlights };
      });
    }
  };

  // Helper to add/remove features in edit/add topup
  const addTopUpFeatureField = (isEdit: boolean) => {
    if (isEdit) {
      if (!editingTopUp) return;
      setEditingTopUp({
        ...editingTopUp,
        features: [...(editingTopUp.features || []), "New package item/benefit"],
      });
    } else {
      setNewTopUp((prev) => ({
        ...prev,
        features: [...(prev.features || []), "New package item/benefit"],
      }));
    }
  };

  const removeTopUpFeatureField = (isEdit: boolean, index: number) => {
    if (isEdit) {
      if (!editingTopUp) return;
      setEditingTopUp({
        ...editingTopUp,
        features: (editingTopUp.features || []).filter((_, i) => i !== index),
      });
    } else {
      setNewTopUp((prev) => ({
        ...prev,
        features: (prev.features || []).filter((_, i) => i !== index),
      }));
    }
  };

  const updateTopUpFeatureField = (isEdit: boolean, index: number, val: string) => {
    if (isEdit) {
      if (!editingTopUp) return;
      const updated = [...(editingTopUp.features || [])];
      updated[index] = val;
      setEditingTopUp({ ...editingTopUp, features: updated });
    } else {
      setNewTopUp((prev) => {
        const features = [...(prev.features || [])];
        features[index] = val;
        return { ...prev, features };
      });
    }
  };

  // -------------------------------------------------------------
  // TOP-UP CRUD
  // -------------------------------------------------------------
  const handleSaveNewTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopUp.code || !newTopUp.name) return;

    const game = (newTopUp.game as GameSlug) || "whiteout-survival";
    const defaultCat = game === "whiteout-survival" ? "Pack ID Top Up" : "Pack ID Top Up";

    const item: TopUpPackage = {
      code: newTopUp.code.trim().toUpperCase(),
      game,
      name: newTopUp.name.trim(),
      detail: newTopUp.detail?.trim() || "Packs & Gems",
      price: Number(newTopUp.price) || 10,
      popular: Boolean(newTopUp.popular),
      image: newTopUp.image || undefined,
      category: newTopUp.category || defaultCat,
      description: newTopUp.description?.trim() || undefined,
      features: (newTopUp.features || []).filter((f) => f.trim().length > 0),
      instructions: newTopUp.instructions?.trim() || undefined,
      deliveryTime: newTopUp.deliveryTime?.trim() || "5 - 15 Minutes",
    };

    await saveTopUpToDB(item);
    setTopups([item, ...topups.filter((t) => t.code !== item.code)]);
    setIsAddingTopUp(false);
    setNewTopUp({
      code: "",
      game: "whiteout-survival",
      name: "",
      detail: "",
      price: 10,
      popular: false,
      image: "",
      category: "Pack ID Top Up",
      description: "",
      features: [
        "Direct account top up via Player ID",
        "No account password required",
        "Instant Discord ticket delivery (5-15 mins)",
      ],
      instructions: "Provide your Player ID and State / Kingdom number in your Discord ticket.",
      deliveryTime: "5 - 15 Minutes",
    });
    showNotification(`Top-up pack ${item.code} created and saved.`);
  };

  const handleUpdateTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopUp) return;
    const sanitized: TopUpPackage = {
      ...editingTopUp,
      features: (editingTopUp.features || []).filter((f) => f.trim().length > 0),
    };
    await saveTopUpToDB(sanitized);
    setTopups(topups.map((t) => (t.code === sanitized.code ? sanitized : t)));
    setEditingTopUp(null);
    showNotification(`Top-up pack ${sanitized.code} updated in database.`);
  };

  const executeDeleteTopUp = async (code: string) => {
    await deleteTopUpFromDB(code);
    setTopups(topups.filter((t) => t.code !== code));
    setConfirmDeleteTopUp(null);
    showNotification(`Top-up pack ${code} removed from database.`);
  };

  // -------------------------------------------------------------
  // SERVICES & MIDDLEWARE CRUD
  // -------------------------------------------------------------
  const handleSaveNewService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.slug || !newService.name) return;

    const item: Service = {
      slug: newService.slug.trim().toLowerCase(),
      name: newService.name.trim(),
      tagline: newService.tagline?.trim() || "Safe gaming services.",
      intro: newService.intro?.trim() || "Protected with verified escrow and fast handover.",
      fee: newService.fee?.trim() || "5% min $2",
      image: newService.image || undefined,
      checklist: newService.checklist || ["Player ID", "Deal confirmation"],
      steps: newService.steps || [
        { title: "Contact on Discord", text: "Open a ticket with BlueMask." },
      ],
      gameSlugs: newService.gameSlugs || [
        "whiteout-survival",
        "kingshot",
        "rise-of-kingdoms",
        "call-of-dragons",
      ],
    };

    await saveServiceToDB(item);
    setServicesList([item, ...servicesList.filter((s) => s.slug !== item.slug)]);
    setIsAddingService(false);
    setNewService({
      slug: "",
      name: "",
      tagline: "",
      intro: "",
      fee: "5% min $2",
      image: "",
      checklist: ["Player ID", "Deal details"],
      steps: [{ title: "Contact", text: "Open a ticket on Discord." }],
      gameSlugs: ["whiteout-survival", "kingshot", "rise-of-kingdoms", "call-of-dragons"],
    });
    showNotification(`Service card "${item.name}" created and published.`);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    await saveServiceToDB(editingService);
    setServicesList(servicesList.map((s) => (s.slug === editingService.slug ? editingService : s)));
    setEditingService(null);
    showNotification(`Service card "${editingService.name}" updated in database.`);
  };

  const executeDeleteService = async (slug: string) => {
    await deleteServiceFromDB(slug);
    setServicesList(servicesList.filter((s) => s.slug !== slug));
    setConfirmDeleteService(null);
    showNotification(`Service "${slug}" removed from database.`);
  };

  const handleResetServices = async () => {
    if (confirm("Reset services list back to original default presets?")) {
      for (const s of defaultServices) {
        await saveServiceToDB(s);
      }
      setServicesList(defaultServices);
      showNotification("Services reset to default preset list.");
    }
  };

  // -------------------------------------------------------------
  // SETTINGS
  // -------------------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings(settings);
    showNotification("Store contact channels updated.");
  };

  // Filtered queries
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !accountSearch ||
      p.code.toLowerCase().includes(accountSearch.toLowerCase()) ||
      p.title.toLowerCase().includes(accountSearch.toLowerCase());
    const matchGame = accountGameFilter === "all" || p.game === accountGameFilter;
    const matchStatus = accountStatusFilter === "all" || p.status === accountStatusFilter;
    return matchSearch && matchGame && matchStatus;
  });

  const filteredTopUps = topups.map(normalizeCategory).filter((t) => {
    const matchSearch =
      !topupSearch ||
      t.code.toLowerCase().includes(topupSearch.toLowerCase()) ||
      t.name.toLowerCase().includes(topupSearch.toLowerCase()) ||
      t.detail.toLowerCase().includes(topupSearch.toLowerCase());
    const matchGame = topupGameFilter === "all" || t.game === topupGameFilter;
    const matchCategory = topupCategoryFilter === "all" || t.category === topupCategoryFilter;
    return matchSearch && matchGame && matchCategory;
  });

  const availableCount = products.filter((p) => p.status === "tersedia").length;
  const soldCount = products.filter((p) => p.status === "terjual").length;

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground">
      {/* Floating Notice Banner */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary/95 border border-primary text-foreground px-5 py-3.5 rounded-lg shadow-xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-sm font-medium">{notice}</span>
        </div>
      )}

      {/* Full Height & Width Sidebar */}
      <aside className="w-full md:w-72 md:h-screen md:sticky md:top-0 bg-secondary/20 border-r border-border/60 p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-950/70 border border-sky-400/30 text-sky-400 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" /> Admin Panel
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">
              Store Management
            </h1>
          </div>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setTab("overview")}
              className={`w-full px-4 py-3 text-sm font-medium rounded-lg flex items-center gap-3 transition-all ${
                tab === "overview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setTab("accounts")}
              className={`w-full px-4 py-3 text-sm font-medium rounded-lg flex items-center justify-between transition-all ${
                tab === "accounts"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4" /> Accounts (Jual Beli)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border/40 font-mono">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setTab("topups")}
              className={`w-full px-4 py-3 text-sm font-medium rounded-lg flex items-center justify-between transition-all ${
                tab === "topups"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" /> Top-Up Cards
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border/40 font-mono">
                {topups.length}
              </span>
            </button>
            <button
              onClick={() => setTab("services")}
              className={`w-full px-4 py-3 text-sm font-medium rounded-lg flex items-center justify-between transition-all ${
                tab === "services"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <Layers className="w-4 h-4" /> Middleware & Services
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border/40 font-mono">
                {servicesList.length}
              </span>
            </button>
            <button
              onClick={() => setTab("testimonials")}
              className={`w-full px-4 py-3 text-sm font-medium rounded-lg flex items-center justify-between transition-all ${
                tab === "testimonials"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" /> Testimonials
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border/40 font-mono">
                {testimonialsList.length}
              </span>
            </button>
            <button
              onClick={() => setTab("settings")}
              className={`w-full px-4 py-3 text-sm font-medium rounded-lg flex items-center gap-3 transition-all ${
                tab === "settings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Settings className="w-4 h-4" /> Store Settings
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-6 border-t border-border/60 space-y-3">
          <Button asChild variant="outline" className="w-full justify-start text-xs">
            <Link to="/admin/cms">
              <Layout className="w-4 h-4 mr-2" /> CMS & Live Preview
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start text-xs">
            <Link to="/">
              <ArrowUpRight className="w-4 h-4 mr-2" /> View Storefront
            </Link>
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* --------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW */}
          {/* --------------------------------------------------------- */}
          {tab === "overview" && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl border border-border/60 bg-secondary/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Total Accounts
                  </span>
                  <strong className="text-3xl font-extrabold text-foreground tabular-nums">
                    {products.length}
                  </strong>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">
                      {availableCount} Available
                    </span>
                    <span>·</span>
                    <span className="text-rose-400 font-semibold">{soldCount} Sold</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-border/60 bg-secondary/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Top-Up Packages
                  </span>
                  <strong className="text-3xl font-extrabold text-foreground tabular-nums">
                    {topups.length}
                  </strong>
                  <div className="text-xs text-muted-foreground mt-2">
                    Across {games.length} games
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-border/60 bg-secondary/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Middleware & Services
                  </span>
                  <strong className="text-3xl font-extrabold text-foreground tabular-nums">
                    {servicesList.length}
                  </strong>
                  <div className="text-xs text-muted-foreground mt-2">
                    Active public service cards
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-border/60 bg-secondary/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Device Uploads
                  </span>
                  <strong className="text-3xl font-extrabold text-emerald-400 tabular-nums">
                    Ready
                  </strong>
                  <div className="text-xs text-muted-foreground mt-2">
                    Instant client-side compression
                  </div>
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="p-6 rounded-xl border border-border/60 bg-secondary/15 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Quick Management Actions</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create new account cards with multiple screenshots, top-ups, or service
                    packages.
                  </p>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  <Button
                    onClick={() => {
                      setTab("accounts");
                      setIsAddingProduct(true);
                    }}
                    className="bm-btn bm-btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Account (Jual Beli)
                  </Button>
                  <Button
                    onClick={() => {
                      setTab("topups");
                      setIsAddingTopUp(true);
                    }}
                    variant="outline"
                    className="bm-btn bm-btn-outline"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Top-Up Pack
                  </Button>
                  <Button
                    onClick={() => {
                      setTab("services");
                      setIsAddingService(true);
                    }}
                    variant="outline"
                    className="bm-btn bm-btn-outline"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Service Card
                  </Button>
                </div>
              </div>

              {/* Recent Accounts Table */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-foreground">
                    Recent Accounts (Jual Beli)
                  </h3>
                  <Button
                    onClick={() => setTab("accounts")}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-sky-400"
                  >
                    View All →
                  </Button>
                </div>
                <div className="border border-border/60 rounded-xl overflow-hidden bg-card/40">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                        <tr>
                          <th className="p-3.5">Account</th>
                          <th className="p-3.5">Game</th>
                          <th className="p-3.5">Price</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {products.slice(0, 5).map((p) => {
                          const game = findGame(p.game);
                          const thumb = p.image || game?.image;
                          return (
                            <tr key={p.code} className="hover:bg-secondary/20 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  {thumb && (
                                    <img
                                      src={thumb}
                                      alt={p.title}
                                      className="w-12 h-9 object-cover rounded border border-border/50 shrink-0"
                                    />
                                  )}
                                  <div>
                                    <strong className="font-semibold text-foreground block text-xs md:text-sm">
                                      {p.title}
                                    </strong>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      {p.code} · {p.badge}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 text-xs text-muted-foreground whitespace-nowrap">
                                {game?.name || p.game}
                              </td>
                              <td className="p-3.5 text-xs font-semibold tabular-nums text-foreground whitespace-nowrap">
                                {formatCurrency(Math.round(p.price * 0.8))}
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                                    p.status === "tersedia"
                                      ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/40"
                                      : "bg-rose-950/70 text-rose-400 border border-rose-800/40"
                                  }`}
                                >
                                  {p.status === "tersedia" ? "Available" : "Sold"}
                                </span>
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    to="/accounts/$code"
                                    params={{ code: p.code }}
                                    target="_blank"
                                    className="p-1.5 text-muted-foreground hover:text-sky-400 transition-colors"
                                    title="View detail page"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                  <Button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setTab("accounts");
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 2: ACCOUNTS (JUAL BELI AKUN & DETAIL PRODUK) */}
          {/* --------------------------------------------------------- */}
          {tab === "accounts" && (
            <div className="space-y-6">
              {/* Header & Add Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Manage Accounts (Jual Beli Akun)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Upload cover images and multiple screenshots from your device. Edit
                    specifications, highlights, and status.
                  </p>
                </div>
                <Button onClick={() => setIsAddingProduct(true)} className="bm-btn bm-btn-primary">
                  <Plus className="w-4 h-4 mr-1.5" /> Add New Account
                </Button>
              </div>

              {/* Filter and Search Bar */}
              <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="Search by code or title..."
                    className="w-full bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={accountGameFilter}
                    onChange={(e) => setAccountGameFilter(e.target.value)}
                    className="bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">All Games</option>
                    {games.map((g) => (
                      <option key={g.slug} value={g.slug}>
                        {g.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={accountStatusFilter}
                    onChange={(e) => setAccountStatusFilter(e.target.value)}
                    className="bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="tersedia">Available Only</option>
                    <option value="terjual">Sold Only</option>
                  </select>
                </div>
              </div>

              {/* CREATE ACCOUNT MODAL / DRAWER */}
              {isAddingProduct && (
                <div className="p-6 rounded-xl border-2 border-primary/60 bg-card shadow-2xl space-y-6 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Create New Account Listing
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Fill in basic details and upload screenshot files from your phone or PC.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingProduct(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveNewProduct} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Account Code *
                        </label>
                        <input
                          type="text"
                          value={newProduct.code}
                          onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                          placeholder="BM-WOS-05"
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Game *
                        </label>
                        <select
                          value={newProduct.game}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, game: e.target.value as GameSlug })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          {games.map((g) => (
                            <option key={g.slug} value={g.slug}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Badge / Level Tag *
                        </label>
                        <input
                          type="text"
                          value={newProduct.badge}
                          onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                          placeholder="FC 5, TC 30, CH 25"
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-border/60 bg-secondary/10">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                            Original Price (USD) *
                          </label>
                          <input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, price: Number(e.target.value) })
                            }
                            required
                            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs tabular-nums"
                          />
                        </div>

                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="newHasDiscAdmin"
                              checked={newProduct.hasDiscount ?? true}
                              onChange={(e) =>
                                setNewProduct({ ...newProduct, hasDiscount: e.target.checked })
                              }
                              className="w-4 h-4 rounded border-border"
                            />
                            <label
                              htmlFor="newHasDiscAdmin"
                              className="text-xs font-semibold text-foreground cursor-pointer"
                            >
                              Gunakan Diskon
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                            Diskon (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newProduct.discountPercent ?? 20}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                discountPercent: Number(e.target.value),
                              })
                            }
                            disabled={!(newProduct.hasDiscount ?? true)}
                            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs tabular-nums disabled:opacity-50"
                          />
                          <span className="text-[10px] text-sky-400 mt-1 block">
                            Jual:{" "}
                            {formatCurrency(
                              (newProduct.hasDiscount ?? true)
                                ? Math.round(
                                    (Number(newProduct.price) || 0) *
                                      (1 - (Number(newProduct.discountPercent) || 20) / 100),
                                  )
                                : Number(newProduct.price) || 0,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Listing Title *
                        </label>
                        <input
                          type="text"
                          value={newProduct.title}
                          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                          placeholder="FC 5 · 92M Power · 6 Mythic Heroes · Clean Gmail Transfer"
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          State / Server / Kingdom
                        </label>
                        <input
                          type="text"
                          value={newProduct.server}
                          onChange={(e) => setNewProduct({ ...newProduct, server: e.target.value })}
                          placeholder="State #812"
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    {/* Cover Image Upload From Device */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-sky-400" /> Cover Image (Upload from Device)
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {newProduct.image ? (
                          <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-border group shrink-0">
                            <img
                              src={newProduct.image}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setNewProduct({ ...newProduct, image: "" })}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="w-28 h-20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 shrink-0">
                            <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground/60" />
                            <span className="text-[10px]">No image</span>
                          </div>
                        )}

                        <div>
                          <input
                            type="file"
                            ref={fileCoverAddRef}
                            accept="image/*"
                            onChange={handleUploadCoverAdd}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileCoverAddRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="bm-btn text-xs"
                            disabled={isUploading}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            {isUploading ? "Processing..." : "Select Cover Photo from Device"}
                          </Button>
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            Supported: JPG, PNG, WEBP. Compressed automatically.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detail Produk: Multiple Screenshots From Device */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-400" /> Detail Screenshots
                          Gallery (Multiple Device Upload)
                        </label>
                        <span className="text-xs text-muted-foreground font-mono">
                          {(newProduct.screenshots || []).length} images uploaded
                        </span>
                      </div>

                      {/* Thumbnails strip */}
                      {newProduct.screenshots && newProduct.screenshots.length > 0 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1">
                          {newProduct.screenshots.map((s, idx) => (
                            <div
                              key={idx}
                              className="relative w-24 h-16 rounded-md overflow-hidden border border-border shrink-0 group"
                            >
                              <img
                                src={s}
                                alt={`Screenshot ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setNewProduct({
                                    ...newProduct,
                                    screenshots: newProduct.screenshots?.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  })
                                }
                                className="absolute top-1 right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete screenshot"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <input
                          type="file"
                          ref={fileScreenshotsAddRef}
                          accept="image/*"
                          multiple
                          onChange={handleUploadScreenshotsAdd}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => fileScreenshotsAddRef.current?.click()}
                          variant="outline"
                          size="sm"
                          className="bm-btn text-xs"
                          disabled={isUploading}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          {isUploading
                            ? "Uploading..."
                            : "Upload Screenshots from Device (Multi-select)"}
                        </Button>
                      </div>
                    </div>

                    {/* Detail Produk: Description & Specs & Highlights */}
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Detail Description / Account Notes
                        </label>
                        <textarea
                          rows={3}
                          value={newProduct.description}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, description: e.target.value })
                          }
                          placeholder="Detailed notes: 40+ days speedups, Red chief gear in 4 slots, clean VIP 10, never topped up with third parties. Handover assisted step-by-step."
                          className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-xs leading-relaxed"
                        />
                      </div>

                      {/* Specs Table */}
                      <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-foreground">
                            Specifications / Stats Table
                          </label>
                          <Button
                            type="button"
                            onClick={() => addStatField(false)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-sky-400 h-7"
                          >
                            + Add Spec Row
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(newProduct.stats || []).map((s, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={s.label}
                                onChange={(e) =>
                                  updateStatField(false, idx, "label", e.target.value)
                                }
                                placeholder="Furnace / Power / VIP"
                                className="w-1/3 bg-secondary/40 border border-border rounded px-2.5 py-1 text-xs font-medium"
                              />
                              <input
                                type="text"
                                value={s.value}
                                onChange={(e) =>
                                  updateStatField(false, idx, "value", e.target.value)
                                }
                                placeholder="FC 5 / 92M / 10"
                                className="flex-1 bg-secondary/40 border border-border rounded px-2.5 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeStatField(false, idx)}
                                className="text-rose-400 hover:text-rose-300 px-1 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-foreground">
                            Key Highlights (Bullet Points)
                          </label>
                          <Button
                            type="button"
                            onClick={() => addHighlightField(false)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-sky-400 h-7"
                          >
                            + Add Highlight
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(newProduct.highlights || []).map((h, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sky-400 text-xs">•</span>
                              <input
                                type="text"
                                value={h}
                                onChange={(e) => updateHighlightField(false, idx, e.target.value)}
                                placeholder="e.g. 6 five-star mythic heroes"
                                className="flex-1 bg-secondary/40 border border-border rounded px-2.5 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeHighlightField(false, idx)}
                                className="text-rose-400 hover:text-rose-300 px-1 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                      <Button type="submit" className="bm-btn bm-btn-primary">
                        Create Account Card
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        variant="outline"
                        className="bm-btn bm-btn-outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* EDIT ACCOUNT MODAL */}
              {editingProduct && (
                <div className="p-6 rounded-xl border-2 border-primary/60 bg-card shadow-2xl space-y-6 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">
                          Edit Account: {editingProduct.code}
                        </h3>
                        <Link
                          to="/accounts/$code"
                          params={{ code: editingProduct.code }}
                          target="_blank"
                          className="text-xs text-sky-400 inline-flex items-center gap-1 hover:underline ml-2"
                        >
                          View on Storefront <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Modify product information, replace cover photo, and manage detail
                        screenshots.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProduct} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Game
                        </label>
                        <select
                          value={editingProduct.game}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              game: e.target.value as GameSlug,
                            })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          {games.map((g) => (
                            <option key={g.slug} value={g.slug}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Badge
                        </label>
                        <input
                          type="text"
                          value={editingProduct.badge}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, badge: e.target.value })
                          }
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-border/60 bg-secondary/10">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                            Original Price (USD)
                          </label>
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                price: Number(e.target.value),
                              })
                            }
                            required
                            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs tabular-nums"
                          />
                        </div>

                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="editHasDiscAdmin"
                              checked={editingProduct.hasDiscount ?? true}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  hasDiscount: e.target.checked,
                                })
                              }
                              className="w-4 h-4 rounded border-border"
                            />
                            <label
                              htmlFor="editHasDiscAdmin"
                              className="text-xs font-semibold text-foreground cursor-pointer"
                            >
                              Gunakan Diskon
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                            Diskon (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingProduct.discountPercent ?? 20}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                discountPercent: Number(e.target.value),
                              })
                            }
                            disabled={!(editingProduct.hasDiscount ?? true)}
                            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs tabular-nums disabled:opacity-50"
                          />
                          <span className="text-[10px] text-sky-400 mt-1 block">
                            Jual:{" "}
                            {formatCurrency(
                              (editingProduct.hasDiscount ?? true)
                                ? Math.round(
                                    editingProduct.price *
                                      (1 - (editingProduct.discountPercent ?? 20) / 100),
                                  )
                                : editingProduct.price,
                            )}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Status
                        </label>
                        <select
                          value={editingProduct.status}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              status: e.target.value as Product["status"],
                            })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="tersedia">Available (Tersedia)</option>
                          <option value="terjual">Sold Out (Terjual)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingProduct.title}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, title: e.target.value })
                          }
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          State / Server
                        </label>
                        <input
                          type="text"
                          value={editingProduct.server || ""}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, server: e.target.value })
                          }
                          placeholder="State #812"
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    {/* Device Cover Photo */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-sky-400" /> Replace Cover Image from Device
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {editingProduct.image ? (
                          <img
                            src={editingProduct.image}
                            alt="Cover"
                            className="w-28 h-20 object-cover rounded-lg border border-border"
                          />
                        ) : (
                          <div className="w-28 h-20 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground bg-secondary/20">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <div>
                          <input
                            type="file"
                            ref={fileCoverEditRef}
                            accept="image/*"
                            onChange={handleUploadCoverEdit}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileCoverEditRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="bm-btn text-xs"
                            disabled={isUploading}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            {isUploading ? "Uploading..." : "Choose Image from Device"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Detail Screenshots */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-foreground flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-400" /> Manage Detail
                          Screenshots ({editingProduct.screenshots?.length || 0})
                        </label>
                      </div>

                      {editingProduct.screenshots && editingProduct.screenshots.length > 0 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1">
                          {editingProduct.screenshots.map((s, idx) => (
                            <div
                              key={idx}
                              className="relative w-24 h-16 rounded-md overflow-hidden border border-border shrink-0 group"
                            >
                              <img
                                src={s}
                                alt={`Screenshot ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    screenshots: editingProduct.screenshots?.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  })
                                }
                                className="absolute top-1 right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete screenshot"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <input
                          type="file"
                          ref={fileScreenshotsEditRef}
                          accept="image/*"
                          multiple
                          onChange={handleUploadScreenshotsEdit}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          onClick={() => fileScreenshotsEditRef.current?.click()}
                          variant="outline"
                          size="sm"
                          className="bm-btn text-xs"
                          disabled={isUploading}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          {isUploading ? "Uploading..." : "Add Screenshots from Device"}
                        </Button>
                      </div>
                    </div>

                    {/* Description & Specs & Highlights */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Account Detailed Description
                        </label>
                        <textarea
                          rows={3}
                          value={editingProduct.description || ""}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, description: e.target.value })
                          }
                          placeholder="Detailed specifications, history, binding credentials..."
                          className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-xs leading-relaxed"
                        />
                      </div>

                      {/* Specs Table */}
                      <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-foreground">
                            Specifications Table
                          </label>
                          <Button
                            type="button"
                            onClick={() => addStatField(true)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-sky-400 h-7"
                          >
                            + Add Spec Row
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {editingProduct.stats.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={s.label}
                                onChange={(e) =>
                                  updateStatField(true, idx, "label", e.target.value)
                                }
                                className="w-1/3 bg-secondary/40 border border-border rounded px-2.5 py-1 text-xs font-medium"
                              />
                              <input
                                type="text"
                                value={s.value}
                                onChange={(e) =>
                                  updateStatField(true, idx, "value", e.target.value)
                                }
                                className="flex-1 bg-secondary/40 border border-border rounded px-2.5 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeStatField(true, idx)}
                                className="text-rose-400 hover:text-rose-300 px-1 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-foreground">
                            Key Highlights
                          </label>
                          <Button
                            type="button"
                            onClick={() => addHighlightField(true)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-sky-400 h-7"
                          >
                            + Add Highlight
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {editingProduct.highlights.map((h, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sky-400 text-xs">•</span>
                              <input
                                type="text"
                                value={h}
                                onChange={(e) => updateHighlightField(true, idx, e.target.value)}
                                className="flex-1 bg-secondary/40 border border-border rounded px-2.5 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeHighlightField(true, idx)}
                                className="text-rose-400 hover:text-rose-300 px-1 text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                      <Button type="submit" className="bm-btn bm-btn-primary">
                        Save Account Changes
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        variant="outline"
                        className="bm-btn bm-btn-outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Accounts Table List */}
              <div className="border border-border/60 rounded-xl overflow-hidden bg-card/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                      <tr>
                        <th className="p-3.5">Listing</th>
                        <th className="p-3.5">Game</th>
                        <th className="p-3.5">Price & Discount</th>
                        <th className="p-3.5">Screenshots</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredProducts.map((p) => {
                        const game = findGame(p.game);
                        const thumb = p.image || game?.image;
                        const screenshotCount = p.screenshots?.length || 0;
                        return (
                          <tr key={p.code} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt={p.title}
                                    className="w-14 h-10 object-cover rounded-md border border-border/60 shrink-0"
                                  />
                                ) : (
                                  <div className="w-14 h-10 rounded-md border border-border/60 bg-secondary/30 flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-sky-400">
                                      {p.code}
                                    </span>
                                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                      {p.badge}
                                    </span>
                                    {p.server && (
                                      <span className="text-[10px] text-muted-foreground">
                                        · {p.server}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-foreground text-sm mt-0.5 line-clamp-1">
                                    {p.title}
                                  </h4>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-xs text-muted-foreground whitespace-nowrap">
                              {game?.name || p.game}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="text-xs">
                                <strong className="text-foreground font-semibold tabular-nums">
                                  {formatCurrency(Math.round(p.price * 0.8))}
                                </strong>
                                <span className="line-through text-muted-foreground ml-1.5 text-[11px] tabular-nums">
                                  {formatCurrency(p.price)}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 whitespace-nowrap text-xs text-muted-foreground">
                              {screenshotCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                                  <ImageIcon className="w-3.5 h-3.5" /> {screenshotCount} images
                                </span>
                              ) : (
                                <span className="text-muted-foreground/60">Cover only</span>
                              )}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleToggleProductStatus(p.code)}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase cursor-pointer hover:opacity-80 transition-opacity ${
                                  p.status === "tersedia"
                                    ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/40"
                                    : "bg-rose-950/70 text-rose-400 border border-rose-800/40"
                                }`}
                                title="Click to toggle status"
                              >
                                {p.status === "tersedia" ? "Available" : "Sold"}
                              </button>
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to="/accounts/$code"
                                  params={{ code: p.code }}
                                  target="_blank"
                                  className="p-1.5 text-muted-foreground hover:text-sky-400 transition-colors"
                                  title="View Product Detail Page"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                                <Button
                                  onClick={() => setEditingProduct(p)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs"
                                >
                                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                                </Button>

                                {confirmDeleteProduct === p.code ? (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      onClick={() => executeDeleteProduct(p.code)}
                                      variant="destructive"
                                      size="sm"
                                      className="h-8 px-2 text-xs"
                                    >
                                      Delete
                                    </Button>
                                    <Button
                                      onClick={() => setConfirmDeleteProduct(null)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => setConfirmDeleteProduct(p.code)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                                    aria-label={`Delete ${p.code}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 3: TOP-UPS */}
          {/* --------------------------------------------------------- */}
          {tab === "topups" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Manage Game Top-Up Packages</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure diamond and coin package tiers, prices, and upload package artwork
                    from your device.
                  </p>
                </div>
                <Button onClick={() => setIsAddingTopUp(true)} className="bm-btn bm-btn-primary">
                  <Plus className="w-4 h-4 mr-1.5" /> Add Top-Up Pack
                </Button>
              </div>

              {/* Filter and Search Bar */}
              <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={topupSearch}
                    onChange={(e) => setTopupSearch(e.target.value)}
                    placeholder="Search packs..."
                    className="w-full bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                <select
                  value={topupGameFilter}
                  onChange={(e) => setTopupGameFilter(e.target.value)}
                  className="bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="all">All Games</option>
                  {games.map((g) => (
                    <option key={g.slug} value={g.slug}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <select
                  value={topupCategoryFilter}
                  onChange={(e) => setTopupCategoryFilter(e.target.value)}
                  className="bg-secondary/40 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="all">All Menus / Categories</option>
                  <option value="Pack ID Top Up">Pack ID Top Up</option>
                  <option value="Frost Star Pack">Frost Star Pack (Whiteout)</option>
                  <option value="Kingdom Star Pack">Kingdom Star Pack (Kingshot)</option>
                </select>
              </div>

              {/* ADD TOP-UP MODAL */}
              {isAddingTopUp && (
                <div className="p-6 rounded-xl border-2 border-primary/60 bg-card shadow-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <h3 className="text-lg font-bold text-foreground">Create Top-Up Package</h3>
                    <button
                      onClick={() => setIsAddingTopUp(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveNewTopUp} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Pack Code *
                        </label>
                        <input
                          type="text"
                          value={newTopUp.code}
                          onChange={(e) => setNewTopUp({ ...newTopUp, code: e.target.value })}
                          placeholder="WOS-TU-NEW"
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Game *
                        </label>
                        <select
                          value={newTopUp.game}
                          onChange={(e) =>
                            setNewTopUp({ ...newTopUp, game: e.target.value as GameSlug })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          {games.map((g) => (
                            <option key={g.slug} value={g.slug}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Pack Name *
                        </label>
                        <input
                          type="text"
                          value={newTopUp.name}
                          onChange={(e) => setNewTopUp({ ...newTopUp, name: e.target.value })}
                          placeholder="Pack $9.99 (2,500 Gems)"
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Price (USD) *
                        </label>
                        <input
                          type="number"
                          value={newTopUp.price}
                          onChange={(e) =>
                            setNewTopUp({ ...newTopUp, price: Number(e.target.value) })
                          }
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Menu / Category *
                        </label>
                        <select
                          value={newTopUp.category || "Pack ID Top Up"}
                          onChange={(e) => setNewTopUp({ ...newTopUp, category: e.target.value })}
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                        >
                          <option value="Pack ID Top Up">Pack ID Top Up</option>
                          {newTopUp.game === "whiteout-survival" && (
                            <option value="Frost Star Pack">Frost Star Pack</option>
                          )}
                          {newTopUp.game === "kingshot" && (
                            <option value="Kingdom Star Pack">Kingdom Star Pack</option>
                          )}
                          {newTopUp.game !== "whiteout-survival" &&
                            newTopUp.game !== "kingshot" && (
                              <>
                                <option value="Frost Star Pack">Frost Star Pack</option>
                                <option value="Kingdom Star Pack">Kingdom Star Pack</option>
                              </>
                            )}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Detail / Items Included
                        </label>
                        <input
                          type="text"
                          value={newTopUp.detail}
                          onChange={(e) => setNewTopUp({ ...newTopUp, detail: e.target.value })}
                          placeholder="Event pack + speedups + gems"
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="newTopUpPop"
                          checked={newTopUp.popular}
                          onChange={(e) => setNewTopUp({ ...newTopUp, popular: e.target.checked })}
                          className="w-4 h-4 rounded border-border"
                        />
                        <label
                          htmlFor="newTopUpPop"
                          className="text-xs font-semibold text-foreground cursor-pointer"
                        >
                          Mark as Best Seller / Popular
                        </label>
                      </div>
                    </div>

                    {/* TopUp Pack Image from Device */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-sky-400" /> Package Image / Icon (Upload
                        from Device)
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {newTopUp.image ? (
                          <img
                            src={newTopUp.image}
                            alt="Pack"
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-secondary/20">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            ref={fileTopupAddRef}
                            accept="image/*"
                            onChange={handleUploadTopUpAdd}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileTopupAddRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="bm-btn text-xs"
                            disabled={isUploading}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Select Icon from Device
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Product Specs & Features */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-4">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Detail Produk & Poin Keunggulan (Product Detail)
                      </h4>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Deskripsi Lengkap Produk (Detailed Description)
                        </label>
                        <textarea
                          rows={2}
                          value={newTopUp.description || ""}
                          onChange={(e) =>
                            setNewTopUp({ ...newTopUp, description: e.target.value })
                          }
                          placeholder="Penjelasan detail paket, bonus gems, garansi, dsb..."
                          className="w-full bg-secondary/30 border border-border rounded-lg p-2.5 text-xs leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                            Estimasi Waktu Pengiriman (Delivery Time)
                          </label>
                          <input
                            type="text"
                            value={newTopUp.deliveryTime || ""}
                            onChange={(e) =>
                              setNewTopUp({ ...newTopUp, deliveryTime: e.target.value })
                            }
                            placeholder="5 - 15 Minutes"
                            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                            Petunjuk / Syarat Top Up (Order Instructions)
                          </label>
                          <input
                            type="text"
                            value={newTopUp.instructions || ""}
                            onChange={(e) =>
                              setNewTopUp({ ...newTopUp, instructions: e.target.value })
                            }
                            placeholder="Kirim Player ID & Server di tiket Discord"
                            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      {/* Dynamic Features List */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                            Poin Detail Produk / Included Items (Bullet Points)
                          </label>
                          <Button
                            type="button"
                            onClick={() => addTopUpFeatureField(false)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-sky-400 h-6"
                          >
                            + Tambah Poin
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {(newTopUp.features || []).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sky-400 text-xs">•</span>
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) =>
                                  updateTopUpFeatureField(false, idx, e.target.value)
                                }
                                placeholder="e.g. 500 Frost Stars loaded directly"
                                className="flex-1 bg-secondary/40 border border-border rounded px-2.5 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeTopUpFeatureField(false, idx)}
                                className="text-rose-400 hover:text-rose-300 px-1 text-xs"
                                title="Remove item"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                      <Button type="submit" className="bm-btn bm-btn-primary">
                        Save Top-Up Package
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsAddingTopUp(false)}
                        variant="outline"
                        className="bm-btn bm-btn-outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* EDIT TOP-UP MODAL */}
              {editingTopUp && (
                <div className="p-6 rounded-xl border-2 border-primary/60 bg-card shadow-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Edit Top-Up: {editingTopUp.code}
                    </h3>
                    <button
                      onClick={() => setEditingTopUp(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateTopUp} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Game
                        </label>
                        <select
                          value={editingTopUp.game}
                          onChange={(e) =>
                            setEditingTopUp({
                              ...editingTopUp,
                              game: e.target.value as GameSlug,
                            })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          {games.map((g) => (
                            <option key={g.slug} value={g.slug}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Pack Name
                        </label>
                        <input
                          type="text"
                          value={editingTopUp.name}
                          onChange={(e) =>
                            setEditingTopUp({ ...editingTopUp, name: e.target.value })
                          }
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Price (USD)
                        </label>
                        <input
                          type="number"
                          value={editingTopUp.price}
                          onChange={(e) =>
                            setEditingTopUp({
                              ...editingTopUp,
                              price: Number(e.target.value),
                            })
                          }
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs tabular-nums"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="editTopUpPop"
                          checked={editingTopUp.popular}
                          onChange={(e) =>
                            setEditingTopUp({ ...editingTopUp, popular: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-border"
                        />
                        <label
                          htmlFor="editTopUpPop"
                          className="text-xs font-semibold text-foreground cursor-pointer"
                        >
                          Best Seller / Popular
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Menu / Category *
                        </label>
                        <select
                          value={editingTopUp.category || "Pack ID Top Up"}
                          onChange={(e) =>
                            setEditingTopUp({ ...editingTopUp, category: e.target.value })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                        >
                          <option value="Pack ID Top Up">Pack ID Top Up</option>
                          {editingTopUp.game === "whiteout-survival" && (
                            <option value="Frost Star Pack">Frost Star Pack</option>
                          )}
                          {editingTopUp.game === "kingshot" && (
                            <option value="Kingdom Star Pack">Kingdom Star Pack</option>
                          )}
                          {editingTopUp.game !== "whiteout-survival" &&
                            editingTopUp.game !== "kingshot" && (
                              <>
                                <option value="Frost Star Pack">Frost Star Pack</option>
                                <option value="Kingdom Star Pack">Kingdom Star Pack</option>
                              </>
                            )}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Detail Description
                        </label>
                        <input
                          type="text"
                          value={editingTopUp.detail}
                          onChange={(e) =>
                            setEditingTopUp({ ...editingTopUp, detail: e.target.value })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    {/* Device Image for Edit Top-Up */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-sky-400" /> Package Image / Icon from Device
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {editingTopUp.image ? (
                          <img
                            src={editingTopUp.image}
                            alt="Pack"
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-secondary/20">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            ref={fileTopupEditRef}
                            accept="image/*"
                            onChange={handleUploadTopUpEdit}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileTopupEditRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="bm-btn text-xs"
                            disabled={isUploading}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Replace Icon from Device
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Product Specs & Features for Edit */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-4">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Detail Produk & Poin Keunggulan (Product Detail)
                      </h4>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Deskripsi Lengkap Produk (Detailed Description)
                        </label>
                        <textarea
                          rows={2}
                          value={editingTopUp.description || ""}
                          onChange={(e) =>
                            setEditingTopUp({ ...editingTopUp, description: e.target.value })
                          }
                          placeholder="Penjelasan detail paket, bonus gems, garansi, dsb..."
                          className="w-full bg-secondary/30 border border-border rounded-lg p-2.5 text-xs leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                            Estimasi Waktu Pengiriman (Delivery Time)
                          </label>
                          <input
                            type="text"
                            value={editingTopUp.deliveryTime || ""}
                            onChange={(e) =>
                              setEditingTopUp({ ...editingTopUp, deliveryTime: e.target.value })
                            }
                            placeholder="5 - 15 Minutes"
                            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                            Petunjuk / Syarat Top Up (Order Instructions)
                          </label>
                          <input
                            type="text"
                            value={editingTopUp.instructions || ""}
                            onChange={(e) =>
                              setEditingTopUp({ ...editingTopUp, instructions: e.target.value })
                            }
                            placeholder="Kirim Player ID & Server di tiket Discord"
                            className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      {/* Dynamic Features List */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                            Poin Detail Produk / Included Items (Bullet Points)
                          </label>
                          <Button
                            type="button"
                            onClick={() => addTopUpFeatureField(true)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-sky-400 h-6"
                          >
                            + Tambah Poin
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {(editingTopUp.features || []).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-sky-400 text-xs">•</span>
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) => updateTopUpFeatureField(true, idx, e.target.value)}
                                placeholder="e.g. 500 Frost Stars loaded directly"
                                className="flex-1 bg-secondary/40 border border-border rounded px-2.5 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => removeTopUpFeatureField(true, idx)}
                                className="text-rose-400 hover:text-rose-300 px-1 text-xs"
                                title="Remove item"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                      <Button type="submit" className="bm-btn bm-btn-primary">
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setEditingTopUp(null)}
                        variant="outline"
                        className="bm-btn bm-btn-outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Top-Ups Table List */}
              <div className="border border-border/60 rounded-xl overflow-hidden bg-card/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/40 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                      <tr>
                        <th className="p-3.5">Code & Pack</th>
                        <th className="p-3.5">Game</th>
                        <th className="p-3.5">Menu / Category</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Popular</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredTopUps.map((t) => {
                        const game = findGame(t.game);
                        return (
                          <tr key={t.code} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                {t.image ? (
                                  <img
                                    src={t.image}
                                    alt={t.name}
                                    className="w-10 h-10 object-cover rounded border shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded border bg-secondary/30 flex items-center justify-center shrink-0 text-muted-foreground">
                                    <CreditCard className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <strong className="font-semibold text-foreground text-sm block">
                                    {t.name}
                                  </strong>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {t.code} · {t.detail}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-xs text-muted-foreground whitespace-nowrap">
                              {game?.name || t.game}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  t.category === "Frost Star Pack"
                                    ? "bg-cyan-950/70 text-cyan-300 border-cyan-500/30"
                                    : t.category === "Kingdom Star Pack"
                                      ? "bg-amber-950/70 text-amber-300 border-amber-500/30"
                                      : "bg-blue-950/70 text-blue-300 border-blue-500/30"
                                }`}
                              >
                                {t.category || "Pack ID Top Up"}
                              </span>
                            </td>
                            <td className="p-3.5 text-xs font-semibold tabular-nums text-foreground whitespace-nowrap">
                              {formatCurrency(t.price)}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              {t.popular && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-400 border border-amber-800/40 uppercase">
                                  Best Seller
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  onClick={() => setPreviewTopUp(t)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-950/40"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                                </Button>
                                <Link
                                  to="/services/$service/$game/$code"
                                  params={{ service: "top-up", game: t.game, code: t.code }}
                                  target="_blank"
                                  className="h-8 px-1.5 text-xs text-muted-foreground hover:text-sky-400 inline-flex items-center gap-1"
                                  title="View live page"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <Button
                                  onClick={() => setEditingTopUp(t)}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2.5 text-xs"
                                >
                                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                                </Button>
                                {confirmDeleteTopUp === t.code ? (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      onClick={() => executeDeleteTopUp(t.code)}
                                      variant="destructive"
                                      size="sm"
                                      className="h-8 px-2 text-xs"
                                    >
                                      Delete
                                    </Button>
                                    <Button
                                      onClick={() => setConfirmDeleteTopUp(null)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => setConfirmDeleteTopUp(t.code)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-rose-400 hover:text-rose-300"
                                    aria-label={`Delete ${t.code}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIVE PRODUCT DETAIL MODAL PREVIEW FOR ADMIN */}
              {previewTopUp && (
                <TopUpProductDetailModal
                  pack={previewTopUp}
                  onClose={() => setPreviewTopUp(null)}
                />
              )}
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 4: MIDDLEWARE & SERVICES CRUD */}
          {/* --------------------------------------------------------- */}
          {tab === "services" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Manage Middleware & Service Cards
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    CRUD service cards shown on the homepage and /services. Upload custom icons and
                    manage escrow fees.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleResetServices}
                    variant="outline"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    title="Reset back to default Middleman, Jual-Beli, Top-Up cards"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
                  </Button>
                  <Button
                    onClick={() => setIsAddingService(true)}
                    className="bm-btn bm-btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Add Service Card
                  </Button>
                </div>
              </div>

              {/* ADD SERVICE MODAL */}
              {isAddingService && (
                <div className="p-6 rounded-xl border-2 border-primary/60 bg-card shadow-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <h3 className="text-lg font-bold text-foreground">Create Service Card</h3>
                    <button
                      onClick={() => setIsAddingService(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveNewService} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Service Slug *
                        </label>
                        <input
                          type="text"
                          value={newService.slug}
                          onChange={(e) => setNewService({ ...newService, slug: e.target.value })}
                          placeholder="middleman-vip"
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                          placeholder="VIP Middleman Escrow"
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Fee / Pricing Rate
                        </label>
                        <input
                          type="text"
                          value={newService.fee}
                          onChange={(e) => setNewService({ ...newService, fee: e.target.value })}
                          placeholder="5% min. $2"
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={newService.tagline}
                          onChange={(e) =>
                            setNewService({ ...newService, tagline: e.target.value })
                          }
                          placeholder="Calm transactions, both sides protected."
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Intro Summary
                        </label>
                        <input
                          type="text"
                          value={newService.intro}
                          onChange={(e) => setNewService({ ...newService, intro: e.target.value })}
                          placeholder="BlueMask acts as the go-between for buyer and seller."
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    {/* Device Image for Service */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-sky-400" /> Service Card Icon / Banner from
                        Device
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {newService.image ? (
                          <img
                            src={newService.image}
                            alt="Service"
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-secondary/20">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            ref={fileServiceAddRef}
                            accept="image/*"
                            onChange={handleUploadServiceAdd}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileServiceAddRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="bm-btn text-xs"
                            disabled={isUploading}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Image from Device
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                      <Button type="submit" className="bm-btn bm-btn-primary">
                        Publish Service Card
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsAddingService(false)}
                        variant="outline"
                        className="bm-btn bm-btn-outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* EDIT SERVICE MODAL */}
              {editingService && (
                <div className="p-6 rounded-xl border-2 border-primary/60 bg-card shadow-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Edit Service Card: {editingService.name}
                    </h3>
                    <button
                      onClick={() => setEditingService(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateService} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Service Name
                        </label>
                        <input
                          type="text"
                          value={editingService.name}
                          onChange={(e) =>
                            setEditingService({ ...editingService, name: e.target.value })
                          }
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Fee Rate
                        </label>
                        <input
                          type="text"
                          value={editingService.fee || ""}
                          onChange={(e) =>
                            setEditingService({ ...editingService, fee: e.target.value })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={editingService.tagline}
                        onChange={(e) =>
                          setEditingService({ ...editingService, tagline: e.target.value })
                        }
                        className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                        Intro Text
                      </label>
                      <textarea
                        rows={2}
                        value={editingService.intro}
                        onChange={(e) =>
                          setEditingService({ ...editingService, intro: e.target.value })
                        }
                        className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-xs leading-relaxed"
                      />
                    </div>

                    {/* Device Image for Edit Service */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-sky-400" /> Replace Service Card Icon from
                        Device
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {editingService.image ? (
                          <img
                            src={editingService.image}
                            alt="Service"
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-secondary/20">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            ref={fileServiceEditRef}
                            accept="image/*"
                            onChange={handleUploadServiceEdit}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileServiceEditRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="bm-btn text-xs"
                            disabled={isUploading}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Replace Image from Device
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                      <Button type="submit" className="bm-btn bm-btn-primary">
                        Save Service Changes
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setEditingService(null)}
                        variant="outline"
                        className="bm-btn bm-btn-outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Services Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesList.map((s) => (
                  <article
                    key={s.slug}
                    className="p-5 rounded-xl border border-border/60 bg-card/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
                          {s.image ? (
                            <img
                              src={s.image}
                              alt={s.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Shield className="w-6 h-6 text-sky-400" />
                          )}
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                          /{s.slug}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-foreground mb-1">{s.name}</h3>
                      <p className="text-xs font-medium text-sky-400 mb-2">{s.tagline}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                        {s.intro}
                      </p>

                      {s.fee && (
                        <div className="text-xs mb-4 p-2 rounded bg-secondary/30 border border-border/40 font-mono text-muted-foreground">
                          Fee: <strong className="text-foreground">{s.fee}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <Link
                        to="/services"
                        target="_blank"
                        className="text-xs text-muted-foreground hover:text-sky-400 inline-flex items-center gap-1"
                      >
                        View Live <ExternalLink className="w-3 h-3" />
                      </Link>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setEditingService(s)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        {confirmDeleteService === s.slug ? (
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => executeDeleteService(s.slug)}
                              variant="destructive"
                              size="sm"
                              className="h-8 px-2 text-xs"
                            >
                              Delete
                            </Button>
                            <Button
                              onClick={() => setConfirmDeleteService(null)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-1.5 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setConfirmDeleteService(s.slug)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-rose-400 hover:text-rose-300"
                            aria-label={`Delete ${s.slug}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB: TESTIMONIALS */}
          {/* --------------------------------------------------------- */}
          {tab === "testimonials" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Manage Home Page & Service Testimonials
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add, edit, or delete customer testimonials and upload testimonial images/avatars
                    from your device.
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddingTestimonial(true)}
                  className="bm-btn bm-btn-primary"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add New Testimonial
                </Button>
              </div>

              {/* CREATE TESTIMONIAL MODAL */}
              {isAddingTestimonial && (
                <div className="p-6 rounded-xl border-2 border-primary/60 bg-card shadow-2xl space-y-6 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Create Testimonial</h3>
                      <p className="text-xs text-muted-foreground">
                        Customer quote, author name, role, game, and optional image/component
                        upload.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingTestimonial(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveNewTestimonial} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          value={newTestimonial.name}
                          onChange={(e) =>
                            setNewTestimonial({ ...newTestimonial, name: e.target.value })
                          }
                          placeholder="Daffa"
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Role *
                        </label>
                        <select
                          value={newTestimonial.role}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              role: e.target.value as "Buyer" | "Seller",
                            })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="Buyer">Buyer</option>
                          <option value="Seller">Seller</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Date
                        </label>
                        <input
                          type="text"
                          value={newTestimonial.date}
                          onChange={(e) =>
                            setNewTestimonial({ ...newTestimonial, date: e.target.value })
                          }
                          placeholder="Oct 2026"
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Game Association
                        </label>
                        <select
                          value={newTestimonial.game}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              game: e.target.value as GameSlug | "all",
                            })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="all">All Games</option>
                          {games.map((g) => (
                            <option key={g.slug} value={g.slug}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Service Association
                        </label>
                        <select
                          value={newTestimonial.service}
                          onChange={(e) =>
                            setNewTestimonial({
                              ...newTestimonial,
                              service: e.target.value as Service["slug"],
                            })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="middleman">Middleman</option>
                          <option value="jual-beli-akun">Buy & Sell Accounts</option>
                          <option value="top-up">Top Up</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                        Testimonial Quote *
                      </label>
                      <textarea
                        rows={3}
                        value={newTestimonial.quote}
                        onChange={(e) =>
                          setNewTestimonial({ ...newTestimonial, quote: e.target.value })
                        }
                        placeholder="My first time buying an account..."
                        required
                        className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-xs leading-relaxed"
                      />
                    </div>

                    {/* Device Image for Testimonial */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-sky-400" /> Testimonial Image / Avatar
                        Component from Device
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {newTestimonial.image ? (
                          <img
                            src={newTestimonial.image}
                            alt="Testimonial Preview"
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-secondary/20">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            ref={fileTestimonialAddRef}
                            accept="image/*"
                            onChange={handleUploadTestimonialAdd}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileTestimonialAddRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="bm-btn text-xs"
                            disabled={isUploading}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Image from Device
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                      <Button type="submit" className="bm-btn bm-btn-primary">
                        Publish Testimonial
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsAddingTestimonial(false)}
                        variant="outline"
                        className="bm-btn bm-btn-outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* EDIT TESTIMONIAL MODAL */}
              {editingTestimonial && (
                <div className="p-6 rounded-xl border-2 border-primary/60 bg-card shadow-2xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Edit Testimonial: {editingTestimonial.name}
                    </h3>
                    <button
                      onClick={() => setEditingTestimonial(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateTestimonial} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editingTestimonial.name}
                          onChange={(e) =>
                            setEditingTestimonial({ ...editingTestimonial, name: e.target.value })
                          }
                          required
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Role
                        </label>
                        <select
                          value={editingTestimonial.role}
                          onChange={(e) =>
                            setEditingTestimonial({
                              ...editingTestimonial,
                              role: e.target.value as "Buyer" | "Seller",
                            })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="Buyer">Buyer</option>
                          <option value="Seller">Seller</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                          Date
                        </label>
                        <input
                          type="text"
                          value={editingTestimonial.date}
                          onChange={(e) =>
                            setEditingTestimonial({ ...editingTestimonial, date: e.target.value })
                          }
                          className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1.5">
                        Quote
                      </label>
                      <textarea
                        rows={3}
                        value={editingTestimonial.quote}
                        onChange={(e) =>
                          setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })
                        }
                        required
                        className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-xs leading-relaxed"
                      />
                    </div>

                    {/* Device Image for Edit Testimonial */}
                    <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                      <label className="text-xs font-bold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-sky-400" /> Replace Testimonial Image from
                        Device
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        {editingTestimonial.image ? (
                          <img
                            src={editingTestimonial.image}
                            alt="Testimonial"
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded border border-dashed flex items-center justify-center text-muted-foreground bg-secondary/20">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            ref={fileTestimonialEditRef}
                            accept="image/*"
                            onChange={handleUploadTestimonialEdit}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileTestimonialEditRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="bm-btn text-xs"
                            disabled={isUploading}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Replace Image from Device
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                      <Button type="submit" className="bm-btn bm-btn-primary">
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setEditingTestimonial(null)}
                        variant="outline"
                        className="bm-btn bm-btn-outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Testimonials List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonialsList.map((t) => (
                  <div
                    key={t.id || t.name}
                    className="p-5 rounded-xl border border-border/60 bg-card/60 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {t.image && (
                        <div className="w-full h-32 rounded-lg overflow-hidden border border-border/40">
                          <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                        <span>
                          {t.service} · {t.game}
                        </span>
                        <span>{t.date}</span>
                      </div>
                      <blockquote className="text-xs italic text-foreground leading-relaxed">
                        "{t.quote}"
                      </blockquote>
                      <div className="text-xs font-semibold text-sky-400">
                        {t.name}{" "}
                        <span className="text-muted-foreground font-normal">({t.role})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                        ★★★★★ Rated
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setEditingTestimonial(t)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        {confirmDeleteTestimonial === t.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => executeDeleteTestimonial(t.id!)}
                              variant="destructive"
                              size="sm"
                              className="h-8 px-2 text-xs"
                            >
                              Delete
                            </Button>
                            <Button
                              onClick={() => setConfirmDeleteTestimonial(null)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-1.5 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setConfirmDeleteTestimonial(t.id!)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-rose-400 hover:text-rose-300"
                            aria-label={`Delete ${t.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* TAB 5: SETTINGS */}
          {/* --------------------------------------------------------- */}
          {tab === "settings" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Store Contact & Discord Channels
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customer orders and tickets from all product and service cards redirect to these
                  official channels.
                </p>
              </div>

              <form
                onSubmit={handleSaveSettings}
                className="p-6 rounded-xl border border-border/60 bg-card/60 space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                    Official Discord Server Link
                  </label>
                  <input
                    type="url"
                    value={settings.discordLink}
                    onChange={(e) => setSettings({ ...settings, discordLink: e.target.value })}
                    placeholder="https://discord.gg/WHRzebh8pz"
                    required
                    className="w-full bg-secondary/40 border border-border rounded-lg p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                    Official WhatsApp Support Number
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp || ""}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    placeholder="+62 821-2780-6072"
                    className="w-full bg-secondary/40 border border-border rounded-lg p-2.5 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="bm-btn bm-btn-primary">
                    Save Store Channels
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
