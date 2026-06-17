import {
  DataFilter,
  GeoFilterType,
  getStrategySchema,
  JobDetails,
  JSONObject,
  JSONValue,
  NotificationConfig,
  Notify,
  UnsavedJob,
} from "@cronny/types";
import {
  Accordion,
  Button,
  Checkbox,
  Group,
  JsonInput,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState, useEffect } from "react";
import { usePatchJob, usePostJob } from "../../api/useJobs";
import { formatJSON } from "../../utils/json";
import { DataFilterBuilder } from "./DataFilterBuilder";
import { GeoFilterSection } from "./GeoFilterSection";
import { NotifyConfigForm } from "./NotifyConfigForm";
import { StrategyParamsForm } from "./StrategyParamsForm";
import type { NotifyConfig, StrategyParamValue, StrategyParamValues } from "./types";
import { StrategySelector } from "./StrategySelector";
import type { ExtractedFilters, ParsedGeoData } from "./urlGeoParser";

interface JobFormProps {
  initialValues?: Partial<JobDetails>;
  onSubmit: () => void;
  isEdit?: boolean;
}

interface FormValues {
  strategy: string;
  name: string;
  enabled: boolean;
  cron: string;
  strategyParams: StrategyParamValues;
  dataFilters: DataFilter[];
  geoFilterType: GeoFilterType;
  polygonPoints: [number, number][];
  radiusCenter: [number, number] | null;
  radius: number;
  maxResults: number;
  notifyConfigs: NotifyConfig[];
}

interface UrlExtractionResult {
  geo?: ParsedGeoData;
  cleanedUrl: string;
  fieldName: string;
  extractedParams: string[];
  extractedFilters?: ExtractedFilters;
}

function parseInitialValues(
  initialValues?: Partial<JobDetails>
): FormValues {
  const params = initialValues?.params ?? {};
  const filtersRaw = params.filters;
  const filters = Array.isArray(filtersRaw) ? filtersRaw.filter(isJSONObject) : [];

  const coordsFilter = filters.find(
    (filter) => filter.prop === "coordinates"
  );
  const dataFilters = filters
    .filter((filter) => filter.prop !== "coordinates")
    .map(toDataFilter)
    .filter(isDefined);

  let geoFilterType: GeoFilterType = "none";
  let polygonPoints: [number, number][] = [];
  let radiusCenter: [number, number] | null = null;
  let radius = 5;

  if (isJSONObject(coordsFilter?.value)) {
    const points = toPointList(coordsFilter.value.points);
    const center = toPoint(coordsFilter.value.center);

    if (points) {
      geoFilterType = "polygon";
      polygonPoints = points;
    } else if (center) {
      geoFilterType = "radius";
      radiusCenter = center;
      radius = typeof coordsFilter.value.radius === "number" ? coordsFilter.value.radius : radius;
    }
  }

  const strategyParams = toStrategyParamValues(params);

  const notify = initialValues?.notify;
  const notifyConfigs: NotifyConfig[] = [];

  if (notify) {
    if (notify.onSuccess) {
      notifyConfigs.push({
        type: notify.onSuccess.transport,
        trigger: "onSuccess",
        onResultChangeOnly: notify.onSuccess.onResultChangeOnly,
        ...notify.onSuccess.params,
      });
    }
    if (notify.onFailure) {
      notifyConfigs.push({
        type: notify.onFailure.transport,
        trigger: "onFailure",
        ...notify.onFailure.params,
      });
    }
  }

  return {
    strategy: initialValues?.strategy || "",
    name: initialValues?.name || "",
    enabled: initialValues?.enabled || false,
    cron: initialValues?.cron || "",
    maxResults: initialValues?.maxResults ?? 100,
    strategyParams,
    dataFilters,
    geoFilterType,
    polygonPoints,
    radiusCenter,
    radius,
    notifyConfigs,
  };
}

function transformToJobPayload(
  values: FormValues
): Omit<UnsavedJob, "id"> {
  const filters: JSONObject[] = values.dataFilters.map(toDataFilterParam);

  if (values.geoFilterType === "polygon" && values.polygonPoints.length >= 3) {
    filters.push({
      prop: "coordinates",
      value: { points: values.polygonPoints },
    });
  } else if (values.geoFilterType === "radius" && values.radiusCenter) {
    filters.push({
      prop: "coordinates",
      value: { center: values.radiusCenter, radius: values.radius },
    });
  }

  const params = toJsonObject(values.strategyParams);

  if (filters.length > 0) {
    params.filters = filters;
  }

  let notify: Notify | null = null;

  if (values.notifyConfigs.length > 0) {
    notify = {};
    for (const config of values.notifyConfigs) {
      const { type, trigger, onResultChangeOnly, ...rest } = config;
      const notificationConfig: NotificationConfig = {
        transport: type,
        params: toJsonObject(rest),
        ...(onResultChangeOnly === true && { onResultChangeOnly }),
      };
      if (trigger === "onFailure") {
        notify.onFailure = notificationConfig;
      } else {
        notify.onSuccess = notificationConfig;
      }
    }
  }

  return {
    strategy: values.strategy,
    name: values.name,
    enabled: values.enabled,
    cron: values.cron,
    params: Object.keys(params).length > 0 ? params : null,
    notify,
    maxResults: values.maxResults,
  };
}

export function JobForm({
  initialValues,
  onSubmit,
  isEdit = false,
}: JobFormProps) {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [rawParams, setRawParams] = useState(
    formatJSON(initialValues?.params)
  );
  const [rawNotify, setRawNotify] = useState(
    formatJSON(initialValues?.notify)
  );

  const form = useForm<FormValues>({
    initialValues: parseInitialValues(initialValues),
    validate: {
      strategy: (value) => (value ? null : "Strategy is required"),
      name: (value) => (value ? null : "Name is required"),
      cron: (value) => (value ? null : "Cron expression is required"),
    },
  });

  const selectedSchema = getStrategySchema(form.values.strategy);
  const supportsGeo = selectedSchema?.supportsGeoFilters ?? false;
  const supportsFilters = selectedSchema?.supportsFilters ?? false;

  const patchJob = usePatchJob(initialValues?.id ?? "");
  const postJob = usePostJob();

  const handleUrlExtracted = (result: UrlExtractionResult) => {
    // URL is kept as-is (not cleaned) - platform will filter by its params
    // We just notify the user about detected filters
    const detectedItems: string[] = [];

    if (result.geo) {
      detectedItems.push("location filter");
    }
    if (result.extractedFilters) {
      const { priceMin, priceMax, sizeMin, sizeMax, roomsMin, roomsMax } = result.extractedFilters;
      if (priceMin !== undefined || priceMax !== undefined) {
        detectedItems.push(`price ${priceMin ?? ""}–${priceMax ?? ""}`);
      }
      if (sizeMin !== undefined || sizeMax !== undefined) {
        detectedItems.push(`size ${sizeMin ?? ""}–${sizeMax ?? ""}`);
      }
      if (roomsMin !== undefined || roomsMax !== undefined) {
        detectedItems.push(`rooms ${roomsMin ?? ""}–${roomsMax ?? ""}`);
      }
    }

    if (detectedItems.length > 0) {
      notifications.show({
        title: "URL contains filters",
        message: `Detected: ${detectedItems.join(", ")}. Platform will apply these filters.`,
        autoClose: 4000,
      });
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    let payload: Omit<UnsavedJob, "id">;

    if (advancedMode) {
      try {
        payload = {
          strategy: values.strategy,
          name: values.name,
          enabled: values.enabled,
          cron: values.cron,
          params: parseOptionalJsonObject(rawParams),
          notify: parseOptionalNotify(rawNotify),
          maxResults: values.maxResults,
        };
      } catch {
        notifications.show({
          title: "Error",
          message: "Invalid JSON in params or notify",
          color: "red",
        });
        return;
      }
    } else {
      payload = transformToJobPayload(values);
    }

    const mutationCallbacks = {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: isEdit ? "Job updated" : "Job created",
          autoClose: 2000,
        });
        onSubmit();
      },
      onError: (error: Error) => {
        notifications.show({
          title: "Error",
          message: error.message || (isEdit ? "Failed to update job" : "Failed to create job"),
          color: "red",
        });
      },
    };

    if (isEdit && initialValues?.id) {
      patchJob.mutate(payload, mutationCallbacks);
    } else {
      postJob.mutate(payload, mutationCallbacks);
    }
  };

  const isLoading = patchJob.isPending || postJob.isPending;

  useEffect(() => {
    if (!advancedMode) {
      const payload = transformToJobPayload(form.values);
      setRawParams(formatJSON(payload.params));
      setRawNotify(formatJSON(payload.notify));
    }
  }, [advancedMode, form.values]);

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack gap="lg">
        <Group justify="flex-end">
          <SegmentedControl
            size="xs"
            value={advancedMode ? "json" : "ui"}
            onChange={(v) => setAdvancedMode(v === "json")}
            data={[
              { label: "UI", value: "ui" },
              { label: "JSON", value: "json" },
            ]}
          />
        </Group>

        <Paper p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb="sm">
            Job Configuration
          </Text>
          <Stack gap="md">
            <StrategySelector
              value={form.values.strategy}
              onChange={(value) => {
                form.setFieldValue("strategy", value);
                form.setFieldValue("strategyParams", {});
              }}
              error={form.errors.strategy as string}
            />
            <TextInput
              label="Name"
              placeholder="Job name"
              required
              {...form.getInputProps("name")}
            />
            <Checkbox
              label="Paused"
              checked={!form.values.enabled}
              onChange={(e) => form.setFieldValue("enabled", !e.currentTarget.checked)}
            />
            <TextInput
              label="Cron Expression"
              placeholder="0 9 * * *"
              description="Standard cron expression (minute hour day month weekday)"
              required
              {...form.getInputProps("cron")}
            />
            <NumberInput
              label="Max Results"
              description="Maximum number of results to keep per run"
              min={1}
              max={1000}
              {...form.getInputProps("maxResults")}
            />
          </Stack>
        </Paper>

        <Paper p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb="sm">
            Strategy Parameters
          </Text>
          {advancedMode ? (
            <Stack gap="md">
              <JsonInput
                label="Params (JSON)"
                placeholder="{}"
                formatOnBlur
                autosize
                minRows={4}
                maxRows={15}
                value={rawParams}
                onChange={setRawParams}
              />
              <JsonInput
                label="Notify (JSON)"
                placeholder="{}"
                formatOnBlur
                autosize
                minRows={4}
                maxRows={10}
                value={rawNotify}
                onChange={setRawNotify}
              />
            </Stack>
          ) : (
            <>
              {selectedSchema ? (
                <StrategyParamsForm
                  schema={selectedSchema}
                  values={form.values.strategyParams}
                  onChange={(values) => form.setFieldValue("strategyParams", values)}
                  onUrlExtracted={supportsGeo ? handleUrlExtracted : undefined}
                />
              ) : (
                <Text size="sm" c="dimmed">
                  Select a strategy to configure parameters
                </Text>
              )}
            </>
          )}
        </Paper>

        {!advancedMode && selectedSchema && (supportsFilters || supportsGeo) && (
          <Accordion variant="separated" defaultValue="">
            {supportsFilters && (
              <Accordion.Item value="filters">
                <Accordion.Control>Data Filters</Accordion.Control>
                <Accordion.Panel>
                  <DataFilterBuilder
                    filters={form.values.dataFilters}
                    onChange={(filters) => form.setFieldValue("dataFilters", filters)}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            )}

            {supportsGeo && (
              <Accordion.Item value="geo">
                <Accordion.Control>Geographic Filter</Accordion.Control>
                <Accordion.Panel>
                  <GeoFilterSection
                    filterType={form.values.geoFilterType}
                    polygonPoints={form.values.polygonPoints}
                    radiusCenter={form.values.radiusCenter}
                    radius={form.values.radius}
                    onFilterTypeChange={(type) => form.setFieldValue("geoFilterType", type)}
                    onPolygonChange={(points) => form.setFieldValue("polygonPoints", points)}
                    onRadiusCenterChange={(center) => form.setFieldValue("radiusCenter", center)}
                    onRadiusChange={(radius) => form.setFieldValue("radius", radius)}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            )}

            <Accordion.Item value="notify">
              <Accordion.Control>Notifications</Accordion.Control>
              <Accordion.Panel>
                <NotifyConfigForm
                  value={form.values.notifyConfigs}
                  onChange={(configs) => form.setFieldValue("notifyConfigs", configs)}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}

        {!advancedMode && selectedSchema && !supportsFilters && !supportsGeo && (
          <Accordion variant="separated" defaultValue="">
            <Accordion.Item value="notify">
              <Accordion.Control>Notifications</Accordion.Control>
              <Accordion.Panel>
                <NotifyConfigForm
                  value={form.values.notifyConfigs}
                  onChange={(configs) => form.setFieldValue("notifyConfigs", configs)}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}

        <Paper
          p="md"
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderTop: "1px solid var(--mantine-color-dark-4)",
            backgroundColor: "var(--mantine-color-dark-7)",
          }}
        >
          <Group justify="flex-end">
            <Button disabled={isLoading} type="submit">
              {isEdit ? "Save Changes" : "Create Job"}
            </Button>
          </Group>
        </Paper>
      </Stack>
    </form>
  );
}

function toDataFilter(filter: JSONObject): DataFilter | null {
  if (typeof filter.prop !== "string") return null;

  const dataFilter: DataFilter = { prop: filter.prop };

  if (isDataFilterValue(filter.value)) {
    dataFilter.value = filter.value;
  }
  if (typeof filter.min === "number") {
    dataFilter.min = filter.min;
  }
  if (typeof filter.max === "number") {
    dataFilter.max = filter.max;
  }
  if (typeof filter.negate === "boolean") {
    dataFilter.negate = filter.negate;
  }

  return dataFilter;
}

function toDataFilterParam(filter: DataFilter): JSONObject {
  const param: JSONObject = { prop: filter.prop };

  if (filter.value !== undefined) {
    param.value = filter.value;
  }
  if (filter.min !== undefined) {
    param.min = filter.min;
  }
  if (filter.max !== undefined) {
    param.max = filter.max;
  }
  if (filter.negate !== undefined) {
    param.negate = filter.negate;
  }

  return param;
}

function toStrategyParamValues(params: JSONObject): StrategyParamValues {
  const values: StrategyParamValues = {};

  for (const [key, value] of Object.entries(params)) {
    if (key === "filters") continue;
    if (isStrategyParamValue(value)) {
      values[key] = value;
    }
  }

  return values;
}

function toJsonObject(values: Record<string, JSONValue | undefined>): JSONObject {
  const object: JSONObject = {};

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) {
      object[key] = value;
    }
  }

  return object;
}

function parseOptionalJsonObject(value: string): JSONObject | null {
  if (!value.trim()) return null;

  const parsed: unknown = JSON.parse(value);
  if (!isJSONObject(parsed)) {
    throw new Error("Expected JSON object");
  }

  return parsed;
}

function parseOptionalNotify(value: string): Notify | null {
  if (!value.trim()) return null;
  return JSON.parse(value) as Notify;
}

function isStrategyParamValue(value: JSONValue): value is Exclude<StrategyParamValue, undefined> {
  if (typeof value === "string") return true;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  if (value === null) return true;

  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isDataFilterValue(value: unknown): value is DataFilter["value"] {
  if (typeof value === "string") return true;
  if (typeof value === "number") return true;

  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isJSONObject(value: unknown): value is JSONObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPoint(value: JSONValue | undefined): [number, number] | null {
  if (!Array.isArray(value)) return null;
  if (value.length !== 2) return null;

  const [lat, lng] = value;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  return [lat, lng];
}

function toPointList(value: JSONValue | undefined): [number, number][] | null {
  if (!Array.isArray(value)) return null;

  const points = value.map(toPoint).filter(isDefined);
  return points.length === value.length ? points : null;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
