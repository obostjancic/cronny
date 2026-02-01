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
import { ParsedGeoData, parseAndCleanUrl } from "./urlGeoParser";

interface UrlExtractionResult {
  geo?: ParsedGeoData;
  cleanedUrl: string;
  fieldName: string;
  extractedParams: string[];
}

interface StrategyParamsFormProps {
  schema: StrategySchema;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onUrlExtracted?: (result: UrlExtractionResult) => void;
  errors?: Record<string, string>;
}

export function StrategyParamsForm({
  schema,
  values,
  onChange,
  onUrlExtracted,
  errors,
}: StrategyParamsFormProps) {
  const handleFieldChange = (fieldName: string, value: any, fieldType: string) => {
    onChange({ ...values, [fieldName]: value });

    // Try to extract data from URL fields and clean the URL
    if (fieldType === "url" && value && onUrlExtracted) {
      const result = parseAndCleanUrl(value);
      if (result && result.extractedParams.length > 0) {
        onUrlExtracted({
          geo: result.geo,
          cleanedUrl: result.cleanedUrl,
          fieldName,
          extractedParams: result.extractedParams,
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

interface FieldInputProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  error?: string;
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
          value={value || ""}
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
          value={value || ""}
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
          value={value || ""}
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
          value={value ?? ""}
          onChange={(val) => onChange(val)}
          error={error}
          min={field.min}
          max={field.max}
        />
      );

    case "date":
      return (
        <DateInput
          label={field.label}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          value={value ? new Date(value) : null}
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
          value={value || null}
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
          value={value || []}
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
          value={value || ""}
          onChange={(val) => onChange(val)}
          error={error}
          data={field.options?.map((o) => ({ value: o.value, label: o.label })) || []}
        />
      );

    default:
      return null;
  }
}
