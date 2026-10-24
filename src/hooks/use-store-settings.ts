import { useEffect, useState } from "react";
import { getStoreSettingsFromDB } from "@/lib/db";
import type { StoreSettings } from "@/lib/admin-store";

const EMPTY_SETTINGS: StoreSettings = {
  discordLink: "",
  whatsapp: "",
  discordUsers: [],
};

export function useStoreSettings(): StoreSettings {
  const [settings, setSettings] = useState(EMPTY_SETTINGS);

  useEffect(() => {
    let isMounted = true;
    const loadSettings = () => {
      void getStoreSettingsFromDB().then(
        (stored) => {
          if (isMounted) setSettings(stored);
        },
        (error: unknown) => {
          console.error("Failed to load store settings from PostgreSQL:", error);
        },
      );
    };
    loadSettings();
    window.addEventListener("store-settings-changed", loadSettings);
    return () => {
      isMounted = false;
      window.removeEventListener("store-settings-changed", loadSettings);
    };
  }, []);

  return settings;
}
