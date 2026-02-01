import {
  DataFilter,
  GeoFilterType,
  getStrategySchema,
  JobDetails,
  Notify,
  UnsavedJob,
} from "@cronny/types";
import {
  Accordion,
  Button,
  Checkbox,
  Divider,
  Group,
  JsonInput,
  Stack,
  Switch,
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
import { StrategySelector } from "./StrategySelector";
import { ParsedGeoData } from "./urlGeoParser";

interface JobFormV2Props {
  initialValues?: Partial<JobDetails>;
  onSubmit: () => void;
  isEdit?: boolean;
}

interface NotifyConfig {
  type: string;
  [key: string]: any;
}

interface FormValues {
  strategy: string;
  name: string;
  enabled: boolean;
  cron: string;
  strategyParams: Record<string, any>;
  dataFilters: DataFilter[];
  geoFilterType: GeoFilterType;
  polygonPoints: [number, number][];
  radiusCenter: [number, number] | null;
  radius: number;
  notifyConfigs: NotifyConfig[];
}

function parseInitialValues(
  initialValues?: Partial<JobDetails>
): FormValues {
  const params = (initialValues?.params || {}) as Record<string, any>;
  const filtersRaw = params.filters;
  const filters = Array.isArray(filtersRaw) ? filtersRaw : [];

  const coordsFilter = filters.find(
    (f: any) => f.prop === "coordinates"
  );
  const dataFilters = filters.filter(
    (f: any) => f.prop !== "coordinates"
  ) as DataFilter[];

  let geoFilterType: GeoFilterType = "none";
  let polygonPoints: [number, number][] = [];
  let radiusCenter: [number, number] | null = null;
  let radius = 5;

  if (coordsFilter?.value) {
    if ("points" in coordsFilter.value) {
      geoFilterType = "polygon";
      polygonPoints = coordsFilter.value.points;
    } else if ("center" in coordsFilter.value) {
      geoFilterType = "radius";
      radiusCenter = coordsFilter.value.center;
      radius = coordsFilter.value.radius;
    }
  }

  const strategyParams: Record<string, any> = { ...params };
  delete strategyParams.filters;

  const notify = initialValues?.notify;
  const notifyConfigs: NotifyConfig[] = [];

  if (notify) {
    if (notify.onSuccess) {
      notifyConfigs.push({
        type: notify.onSuccess.transport,
        trigger: "onSuccess",
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
  const filters: any[] = [...values.dataFilters];

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

  const params: Record<string, any> = { ...values.strategyParams };

  if (filters.length > 0) {
    params.filters = filters;
  }

  let notify: Notify | null = null;

  if (values.notifyConfigs.length > 0) {
    notify = {};
    for (const config of values.notifyConfigs) {
      const { type, trigger, ...rest } = config;
      const notificationConfig = {
        transport: type as any,
        params: rest,
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
  };
}

export function JobFormV2({
  initialValues,
  onSubmit,
  isEdit = false,
}: JobFormV2Props) {
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

  const handleGeoExtracted = (geo: ParsedGeoData) => {
    if (geo.type === "polygon" && geo.polygon) {
      form.setFieldValue("geoFilterType", "polygon");
      form.setFieldValue("polygonPoints", geo.polygon);
      notifications.show({
        title: "Geo data extracted",
        message: `Extracted ${geo.polygon.length}-point polygon from URL`,
        autoClose: 3000,
      });
    } else if (geo.type === "radius" && geo.center) {
      form.setFieldValue("geoFilterType", "radius");
      form.setFieldValue("radiusCenter", geo.center);
      if (geo.radius) {
        form.setFieldValue("radius", geo.radius);
      }
      notifications.show({
        title: "Geo data extracted",
        message: "Extracted radius filter from URL",
        autoClose: 3000,
      });
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    let payload: any;

    if (advancedMode) {
      try {
        payload = {
          strategy: values.strategy,
          name: values.name,
          enabled: values.enabled,
          cron: values.cron,
          params: rawParams ? JSON.parse(rawParams) : null,
          notify: rawNotify ? JSON.parse(rawNotify) : null,
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

    if (isEdit && initialValues?.id) {
      patchJob.mutate(payload);
      notifications.show({
        title: "Success",
        message: "Job updated",
        autoClose: 2000,
      });
    } else {
      postJob.mutate(payload as UnsavedJob);
      notifications.show({
        title: "Success",
        message: "Job created",
        autoClose: 2000,
      });
    }
    onSubmit();
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
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Form Mode
          </Text>
          <Switch
            label="Advanced (JSON)"
            checked={advancedMode}
            onChange={(e) => setAdvancedMode(e.currentTarget.checked)}
          />
        </Group>

        <Divider />

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
          label="Enabled"
          {...form.getInputProps("enabled", { type: "checkbox" })}
        />

        <TextInput
          label="Cron Expression"
          placeholder="0 9 * * *"
          description="Standard cron expression (minute hour day month weekday)"
          required
          {...form.getInputProps("cron")}
        />

        <Divider label="Strategy Parameters" labelPosition="left" />

        {advancedMode ? (
          <>
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
          </>
        ) : (
          <>
            {selectedSchema ? (
              <StrategyParamsForm
                schema={selectedSchema}
                values={form.values.strategyParams}
                onChange={(values) =>
                  form.setFieldValue("strategyParams", values)
                }
                onGeoExtracted={supportsGeo ? handleGeoExtracted : undefined}
              />
            ) : (
              <Text size="sm" c="dimmed">
                Select a strategy to configure parameters
              </Text>
            )}

            {selectedSchema && (supportsFilters || supportsGeo) && (
              <Accordion variant="separated" defaultValue="">
                {supportsFilters && (
                  <Accordion.Item value="filters">
                    <Accordion.Control>Data Filters</Accordion.Control>
                    <Accordion.Panel>
                      <DataFilterBuilder
                        filters={form.values.dataFilters}
                        onChange={(filters) =>
                          form.setFieldValue("dataFilters", filters)
                        }
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
                        onFilterTypeChange={(type) =>
                          form.setFieldValue("geoFilterType", type)
                        }
                        onPolygonChange={(points) =>
                          form.setFieldValue("polygonPoints", points)
                        }
                        onRadiusCenterChange={(center) =>
                          form.setFieldValue("radiusCenter", center)
                        }
                        onRadiusChange={(radius) =>
                          form.setFieldValue("radius", radius)
                        }
                      />
                    </Accordion.Panel>
                  </Accordion.Item>
                )}

                <Accordion.Item value="notify">
                  <Accordion.Control>Notifications</Accordion.Control>
                  <Accordion.Panel>
                    <NotifyConfigForm
                      value={form.values.notifyConfigs}
                      onChange={(configs) =>
                        form.setFieldValue("notifyConfigs", configs)
                      }
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            )}

            {selectedSchema && !supportsFilters && !supportsGeo && (
              <Accordion variant="separated" defaultValue="">
                <Accordion.Item value="notify">
                  <Accordion.Control>Notifications</Accordion.Control>
                  <Accordion.Panel>
                    <NotifyConfigForm
                      value={form.values.notifyConfigs}
                      onChange={(configs) =>
                        form.setFieldValue("notifyConfigs", configs)
                      }
                    />
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            )}
          </>
        )}

        <Group mt="md">
          <Button disabled={isLoading} type="submit">
            {isEdit ? "Save" : "Create Job"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
