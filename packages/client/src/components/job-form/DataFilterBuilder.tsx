import { DataFilter } from "@cronny/types";
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface DataFilterBuilderProps {
  filters: DataFilter[];
  onChange: (filters: DataFilter[]) => void;
}

const PROPERTY_OPTIONS = [
  { value: "price", label: "Price" },
  { value: "size", label: "Size (m²)" },
  { value: "rooms", label: "Rooms" },
  { value: "title", label: "Title" },
  { value: "address", label: "Address" },
];

export function DataFilterBuilder({
  filters,
  onChange,
}: DataFilterBuilderProps) {
  const addFilter = () => {
    onChange([...filters, { prop: "price" }]);
  };

  const removeFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<DataFilter>) => {
    onChange(
      filters.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Text fw={500} size="sm">
          Data Filters
        </Text>
        <Button
          variant="light"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={addFilter}
        >
          Add Filter
        </Button>
      </Group>

      {filters.length === 0 && (
        <Text size="sm" c="dimmed">
          No filters configured. Results will not be filtered by data properties.
        </Text>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {filters.map((filter, index) => (
          <FilterRow
            key={`${filter.prop}-${index}`}
            filter={filter}
            onChange={(updates) => updateFilter(index, updates)}
            onRemove={() => removeFilter(index)}
          />
        ))}
      </div>
    </Paper>
  );
}

interface FilterRowProps {
  filter: DataFilter;
  onChange: (updates: Partial<DataFilter>) => void;
  onRemove: () => void;
}

function FilterRow({ filter, onChange, onRemove }: FilterRowProps) {
  const isNumericProp = ["price", "size", "rooms"].includes(filter.prop);

  return (
    <Group gap="xs" wrap="nowrap">
      <Select
        size="xs"
        value={filter.prop}
        onChange={(value) => onChange({ prop: value || "price", value: undefined, min: undefined, max: undefined })}
        data={PROPERTY_OPTIONS}
        w={120}
      />
      {isNumericProp ? (
        <>
          <NumberInput
            size="xs"
            placeholder="Min"
            value={filter.min ?? ""}
            onChange={(value) => onChange({ min: value === "" ? undefined : (value as number), value: undefined })}
            style={{ flex: 1 }}
          />
          <NumberInput
            size="xs"
            placeholder="Max"
            value={filter.max ?? ""}
            onChange={(value) => onChange({ max: value === "" ? undefined : (value as number), value: undefined })}
            style={{ flex: 1 }}
          />
        </>
      ) : (
        <TextInput
          size="xs"
          placeholder="Value (use % for wildcards)"
          value={(filter.value as string) || ""}
          onChange={(e) => onChange({ value: e.currentTarget.value })}
          style={{ flex: 1 }}
        />
      )}
      <Checkbox
        size="xs"
        label="Exclude"
        checked={filter.negate || false}
        onChange={(e) => onChange({ negate: e.currentTarget.checked })}
      />
      <ActionIcon
        variant="subtle"
        color="red"
        size="sm"
        onClick={onRemove}
      >
        <IconTrash size={14} />
      </ActionIcon>
    </Group>
  );
}
