export type FieldType =
  | "url"
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "combobox";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: SelectOption[];
  min?: number;
  max?: number;
  defaultValue?: string | number | boolean | string[];
}

export type StrategyCategory = "real-estate" | "utility" | "news";

export interface StrategySchema {
  id: string;
  name: string;
  description: string;
  category: StrategyCategory;
  fields: FieldSchema[];
  supportsFilters?: boolean;
  supportsGeoFilters?: boolean;
}

export const STRATEGY_SCHEMAS: StrategySchema[] = [
  {
    id: "standard",
    name: "DerStandard Immo",
    description: "Search real estate listings on derstandard.at",
    category: "real-estate",
    fields: [
      {
        name: "url",
        label: "Search URL",
        type: "url",
        required: true,
        placeholder: "https://immobilien.derstandard.at/suche/...",
        description: "The search URL from derstandard.at immobilien",
      },
    ],
    supportsFilters: true,
    supportsGeoFilters: true,
  },
  {
    id: "willhaben-immo",
    name: "Willhaben Immo",
    description: "Search real estate listings on willhaben.at",
    category: "real-estate",
    fields: [
      {
        name: "url",
        label: "Search URL",
        type: "url",
        required: true,
        placeholder: "https://www.willhaben.at/iad/immobilien/...",
        description: "The search URL from willhaben.at immobilien",
      },
    ],
    supportsFilters: true,
    supportsGeoFilters: true,
  },
  {
    id: "immoscout",
    name: "ImmoScout24",
    description: "Search real estate listings on immobilienscout24.at",
    category: "real-estate",
    fields: [
      {
        name: "url",
        label: "API URL",
        type: "url",
        required: true,
        placeholder: "https://www.immobilienscout24.at/...",
        description: "The API URL from ImmoScout24",
      },
    ],
    supportsFilters: true,
    supportsGeoFilters: true,
  },
  {
    id: "olx",
    name: "OLX.ba",
    description: "Search real estate listings on olx.ba",
    category: "real-estate",
    fields: [
      {
        name: "url",
        label: "Search URL",
        type: "url",
        required: true,
        placeholder: "https://www.olx.ba/pretraga...",
        description: "The search URL from OLX.ba",
      },
    ],
    supportsFilters: true,
    supportsGeoFilters: true,
  },
  {
    id: "immo",
    name: "Multi-Source Immo",
    description:
      "Aggregate listings from multiple sources (Willhaben, ImmoScout, DerStandard)",
    category: "real-estate",
    fields: [
      {
        name: "sources.willhaben.url",
        label: "Willhaben URL",
        type: "url",
        required: false,
        placeholder: "https://www.willhaben.at/iad/immobilien/...",
        description: "Optional Willhaben search URL",
      },
      {
        name: "sources.immoscout.url",
        label: "ImmoScout URL",
        type: "url",
        required: false,
        placeholder: "https://www.immobilienscout24.at/...",
        description: "Optional ImmoScout24 API URL",
      },
      {
        name: "sources.standard.url",
        label: "DerStandard URL",
        type: "url",
        required: false,
        placeholder: "https://immobilien.derstandard.at/...",
        description: "Optional DerStandard search URL",
      },
    ],
    supportsFilters: true,
    supportsGeoFilters: true,
  },
  {
    id: "grillzone",
    name: "Vienna Grill Reservations",
    description: "Check availability for Vienna public grill areas",
    category: "utility",
    fields: [
      {
        name: "from",
        label: "From Date",
        type: "date",
        required: true,
        description: "Start date for availability check",
      },
      {
        name: "to",
        label: "To Date",
        type: "date",
        required: true,
        description: "End date for availability check",
      },
      {
        name: "areas",
        label: "Grill Areas",
        type: "multiselect",
        required: true,
        description: "Select the grill areas to check",
        options: [
          { value: "1", label: "Area 1 - Donauinsel Nord" },
          { value: "2", label: "Area 2 - Donauinsel Mitte" },
          { value: "3", label: "Area 3 - Donauinsel Süd" },
          { value: "4", label: "Area 4 - Prater" },
          { value: "5", label: "Area 5 - Alte Donau" },
        ],
      },
    ],
    supportsFilters: false,
    supportsGeoFilters: false,
  },
  {
    id: "klix-rss",
    name: "Klix News with AI",
    description: "Fetch and process news articles from klix.ba with AI",
    category: "news",
    fields: [
      {
        name: "systemPrompt",
        label: "AI System Prompt",
        type: "textarea",
        required: true,
        placeholder: "You are a helpful assistant that summarizes news...",
        description: "The system prompt for AI processing of articles",
      },
      {
        name: "model",
        label: "AI Model",
        type: "combobox",
        required: false,
        placeholder: "google/gemma-3-27b-it:free",
        description: "OpenRouter model ID (leave empty for default)",
        options: [
          { value: "google/gemma-3-27b-it:free", label: "Gemma 3 27B (Free)" },
          { value: "google/gemma-3-27b-it", label: "Gemma 3 27B" },
          { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
          { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku" },
          { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
          { value: "openai/gpt-4o", label: "GPT-4o" },
          { value: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (Free)" },
        ],
      },
    ],
    supportsFilters: false,
    supportsGeoFilters: false,
  },
  {
    id: "willhaben",
    name: "Willhaben Generic",
    description: "Search generic listings on willhaben.at",
    category: "utility",
    fields: [
      {
        name: "url",
        label: "Search URL",
        type: "url",
        required: true,
        placeholder: "https://www.willhaben.at/iad/...",
        description: "The search URL from willhaben.at",
      },
    ],
    supportsFilters: false,
    supportsGeoFilters: false,
  },
];

export function getStrategySchema(strategyId: string): StrategySchema | undefined {
  return STRATEGY_SCHEMAS.find((s) => s.id === strategyId);
}

export function getStrategiesByCategory(
  category: StrategyCategory
): StrategySchema[] {
  return STRATEGY_SCHEMAS.filter((s) => s.category === category);
}

export interface DataFilter {
  prop: string;
  value?: string | number | string[];
  min?: number;
  max?: number;
  negate?: boolean;
}

export type GeoFilterType = "none" | "radius" | "polygon";

export interface RadiusGeoFilter {
  type: "radius";
  center: [number, number];
  radius: number;
}

export interface PolygonGeoFilter {
  type: "polygon";
  points: [number, number][];
}

export type GeoFilter = RadiusGeoFilter | PolygonGeoFilter;
