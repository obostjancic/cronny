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
  integer?: boolean;
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

const MODEL_OPTIONS: SelectOption[] = [
  { value: "poolside/laguna-xs.2:free", label: "poolside/laguna-xs.2:free" },
  { value: "google/gemma-3-27b-it:free", label: "google/gemma-3-27b-it:free" },
  { value: "google/gemma-3-27b-it", label: "google/gemma-3-27b-it" },
  { value: "google/gemma-3-12b-it:free", label: "google/gemma-3-12b-it:free" },
  { value: "google/gemma-3-12b-it", label: "google/gemma-3-12b-it" },
  { value: "anthropic/claude-3.5-sonnet", label: "anthropic/claude-3.5-sonnet" },
  { value: "anthropic/claude-3-haiku", label: "anthropic/claude-3-haiku" },
  { value: "openai/gpt-4o-mini", label: "openai/gpt-4o-mini" },
  { value: "openai/gpt-4o", label: "openai/gpt-4o" },
  { value: "meta-llama/llama-3.1-8b-instruct:free", label: "meta-llama/llama-3.1-8b-instruct:free" },
];

const MODEL_FIELDS: FieldSchema[] = [
  {
    name: "model",
    label: "Model Slug",
    type: "combobox",
    required: false,
    placeholder: "poolside/laguna-xs.2:free",
    description: "Primary OpenRouter model slug, leave empty for the default",
    options: MODEL_OPTIONS,
  },
  {
    name: "fallbackModel",
    label: "Fallback Model Slug",
    type: "combobox",
    required: false,
    placeholder: "google/gemma-3-27b-it",
    description: "Fallback OpenRouter model slug used when the primary model fails",
    options: MODEL_OPTIONS,
  },
];

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
    id: "appointments",
    name: "ID Austria Appointments",
    description:
      "Monitor open appointment slots at id-austria.info (passport, police, Finanzamt)",
    category: "utility",
    fields: [
      {
        name: "provider",
        label: "Provider",
        type: "select",
        required: false,
        defaultValue: "finanzamt",
        description: "Which agency's appointments to track",
        options: [
          { value: "all", label: "All providers" },
          { value: "magistrate", label: "Magistrate (Vienna Passservice)" },
          { value: "police", label: "Police (Polizeikommissariat)" },
          {
            value: "finanzamt",
            label: "Finanzamt (tax office — for foreigners)",
          },
        ],
      },
    ],
    supportsFilters: true,
    supportsGeoFilters: false,
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
        name: "charOutputLength",
        label: "Character Output Length",
        type: "number",
        required: false,
        min: 1,
        integer: true,
        placeholder: "280",
        description: "Maximum character length for the generated output, leave empty for no limit. Items that exceed it are skipped",
      },
      ...MODEL_FIELDS,
    ],
    supportsFilters: false,
    supportsGeoFilters: false,
  },
  {
    id: "standard-rss",
    name: "DerStandard News with AI",
    description: "Fetch and process news articles from derstandard.at with AI",
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
        name: "charOutputLength",
        label: "Character Output Length",
        type: "number",
        required: false,
        min: 1,
        integer: true,
        placeholder: "280",
        description: "Maximum character length for the generated output, leave empty for no limit. Items that exceed it are skipped",
      },
      ...MODEL_FIELDS,
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
