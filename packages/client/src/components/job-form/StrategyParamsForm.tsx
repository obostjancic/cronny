import { FieldSchema, StrategySchema } from "@cronny/types";
import {
  Autocomplete,
  MultiSelect,
  NumberInput,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import type { StrategyParamValue, StrategyParamValues } from "./types";
import { ExtractedFilters, ParsedGeoData, parseAndCleanUrl } from "./urlGeoParser";

interface UrlExtractionResult {
  geo?: ParsedGeoData;
  cleanedUrl: string;
  fieldName: string;
  extractedParams: string[];
  extractedFilters?: ExtractedFilters;
}

interface StrategyParamsFormProps {
  schema: StrategySchema;
  values: StrategyParamValues;
  onChange: (values: StrategyParamValues) => void;
  onUrlExtracted?: (result: UrlExtractionResult) => void;
  errors?: Record<string, string>;
}

interface FieldInputProps {
  field: FieldSchema;
  value: StrategyParamValue;
  onChange: (value: StrategyParamValue) => void;
  error?: string;
}

export function StrategyParamsForm({
  schema,
  values,
  onChange,
  onUrlExtracted,
  errors,
}: StrategyParamsFormProps) {
  const handleFieldChange = (fieldName: string, value: StrategyParamValue, fieldType: string) => {
    onChange({ ...values, [fieldName]: value });

    // Try to extract data from URL fields and clean the URL
    if (fieldType === "url" && typeof value === "string" && value && onUrlExtracted) {
      const result = parseAndCleanUrl(value);
      if (result && result.extractedParams.length > 0) {
        onUrlExtracted({
          geo: result.geo,
          cleanedUrl: result.cleanedUrl,
          fieldName,
          extractedParams: result.extractedParams,
          extractedFilters: result.extractedFilters,
        });
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {schema.fields.map((field) => (
        <FieldInput
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(value) => handleFieldChange(field.name, value, field.type)}
          error={errors?.[field.name]}
        />
      ))}
    </div>
  );
}

function FieldInput({ field, value, onChange, error }: FieldInputProps) {
  switch (field.type) {
    case "url":
      return (
        <TextInput
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          value={getStringValue(value)}
          onChange={(e) => onChange(e.currentTarget.value)}
          error={error}
          type="url"
        />
      );

    case "text":
      return (
        <TextInput
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          value={getStringValue(value)}
          onChange={(e) => onChange(e.currentTarget.value)}
          error={error}
        />
      );

    case "textarea":
      return (
        <Textarea
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          value={getStringValue(value)}
          onChange={(e) => onChange(e.currentTarget.value)}
          error={error}
          autosize
          minRows={3}
          maxRows={10}
        />
      );

    case "number":
      return (
        <NumberInput
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          value={getNumberValue(value)}
          onChange={(val) => onChange(normalizeNumberValue(val))}
          error={error}
          min={field.min}
          max={field.max}
          step={field.integer ? 1 : undefined}
          allowDecimal={!field.integer}
          decimalScale={field.integer ? 0 : undefined}
        />
      );

    case "date":
      return (
        <DateInput
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          value={getDateValue(value)}
          onChange={(date) => onChange(date?.toISOString())}
          error={error}
        />
      );

    case "select":
      return (
        <Select
          label={field.label}
          placeholder={field.placeholder || "Select an option"}
          description={field.description}
          required={field.required}
          value={getStringValue(value) || null}
          onChange={(val) => onChange(val)}
          error={error}
          data={field.options || []}
          clearable
        />
      );

    case "multiselect":
      return (
        <MultiSelect
          label={field.label}
          placeholder={field.placeholder || "Select options"}
          description={field.description}
          required={field.required}
          value={getStringArrayValue(value)}
          onChange={(vals) => onChange(vals)}
          error={error}
          data={field.options || []}
        />
      );

    case "combobox":
      return (
        <Autocomplete
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          value={getStringValue(value)}
          onChange={(val) => onChange(val)}
          error={error}
          data={field.options?.map((option) => option.value) || []}
        />
      );

    default:
      return null;
  }
}

function getStringValue(value: StrategyParamValue): string {
  return typeof value === "string" ? value : "";
}

function getNumberValue(value: StrategyParamValue): string | number {
  if (typeof value === "number" || typeof value === "string") return value;
  return "";
}

function normalizeNumberValue(value: string | number): StrategyParamValue {
  if (value === "") return undefined;
  if (typeof value === "number") return value;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getStringArrayValue(value: StrategyParamValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string");
}

function getDateValue(value: StrategyParamValue): Date | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}
