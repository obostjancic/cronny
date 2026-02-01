import { STRATEGY_SCHEMAS, StrategyCategory } from "@cronny/types";
import { Select, Text } from "@mantine/core";
import { useMemo } from "react";

interface StrategySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const categoryLabels: Record<StrategyCategory, string> = {
  "real-estate": "Real Estate",
  utility: "Utility",
  news: "News",
};

const categoryOrder: StrategyCategory[] = ["real-estate", "utility", "news"];

export function StrategySelector({
  value,
  onChange,
  error,
}: StrategySelectorProps) {
  const groupedOptions = useMemo(() => {
    const groups: { group: string; items: { value: string; label: string; description: string }[] }[] = [];

    for (const category of categoryOrder) {
      const strategies = STRATEGY_SCHEMAS.filter((s) => s.category === category);
      if (strategies.length > 0) {
        groups.push({
          group: categoryLabels[category],
          items: strategies.map((s) => ({
            value: s.id,
            label: s.name,
            description: s.description,
          })),
        });
      }
    }

    return groups;
  }, []);

  const selectedStrategy = STRATEGY_SCHEMAS.find((s) => s.id === value);

  return (
    <div>
      <Select
        label="Strategy"
        placeholder="Select a strategy"
        data={groupedOptions}
        value={value}
        onChange={(v) => onChange(v || "")}
        error={error}
        required
        searchable
        allowDeselect={false}
      />
      {selectedStrategy && (
        <Text size="xs" c="dimmed" mt={4}>
          {selectedStrategy.description}
        </Text>
      )}
    </div>
  );
}
