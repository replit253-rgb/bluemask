import { getProcessConfigFn, saveProcessConfigFn } from "./pg-server-fn";

export interface ProcessStep {
  id: string;
  title: string;
  text: string;
}

export interface ProcessConfig {
  eyebrow: string;
  title: string;
  steps: ProcessStep[];
}

export const DEFAULT_BUY_SELL_PROCESS_CONFIG: ProcessConfig = {
  eyebrow: "(01) Process",
  title: "How it works.",
  steps: [
    {
      id: "tell-us-what-you-need",
      title: "Tell us what you need",
      text: "Describe the account you're looking for or the one you want to sell.",
    },
    {
      id: "pick-an-offer",
      title: "Pick an offer",
      text: "The team helps match you with available offers.",
    },
    {
      id: "agree-on-a-price",
      title: "Agree on a price",
      text: "Details and price are discussed directly with the team.",
    },
    {
      id: "handover",
      title: "Handover",
      text: "The deal is processed safely, with middleman support if needed.",
    },
  ],
};

function normalizeProcessConfig(value: unknown): ProcessConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_BUY_SELL_PROCESS_CONFIG;
  }

  const stored = value as Partial<ProcessConfig>;
  const steps = Array.isArray(stored.steps)
    ? stored.steps.filter(
        (step): step is ProcessStep =>
          !!step &&
          typeof step === "object" &&
          typeof step.id === "string" &&
          typeof step.title === "string" &&
          typeof step.text === "string",
      )
    : DEFAULT_BUY_SELL_PROCESS_CONFIG.steps;

  return {
    eyebrow:
      typeof stored.eyebrow === "string"
        ? stored.eyebrow
        : DEFAULT_BUY_SELL_PROCESS_CONFIG.eyebrow,
    title:
      typeof stored.title === "string" ? stored.title : DEFAULT_BUY_SELL_PROCESS_CONFIG.title,
    steps,
  };
}

export async function getProcessConfig(): Promise<ProcessConfig> {
  return normalizeProcessConfig(await getProcessConfigFn());
}

export async function saveProcessConfig(config: ProcessConfig): Promise<void> {
  await saveProcessConfigFn({ data: config });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("buy-sell-process-changed"));
  }
}
