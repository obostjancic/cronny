import { JobDetails, UnsavedJob } from "@cronny/types";
import {
  Button,
  Checkbox,
  Group,
  JsonInput,
  JsonInputProps,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { usePatchJob, usePostJob } from "../api/useJobs";
import { formatJSON } from "../utils/json";

type JobFormProps = {
  initialValues?: Partial<JobDetails>;
  onSubmit: () => void;
  isEdit?: boolean;
};

const JobForm = ({ initialValues, onSubmit, isEdit = false }: JobFormProps) => {
  const form = useForm({
    initialValues: initialValues || {
      id: undefined,
      strategy: "",
      name: "",
      enabled: false,
      cron: "",
      params: null,
      notify: null,
    },
  });

  const theme = useMantineTheme();

  const patchJob = usePatchJob(initialValues?.id ?? "");

  const postJob = usePostJob();

  const handleFormSubmit = async (values: Partial<JobDetails>) => {
    if (isEdit && initialValues?.id) {
      patchJob.mutate(values);
      notifications.show({
        title: "Success",
        message: "Job updated",
        autoClose: 2000,
      });
    } else {
      postJob.mutate(values as UnsavedJob);
      notifications.show({
        title: "Success",
        message: "Job created",
        autoClose: 2000,
      });
    }
    onSubmit();
  };

  const isLoading = patchJob.isPending || postJob.isPending;

  return (
    <form
      onSubmit={form.onSubmit(handleFormSubmit)}
      style={{
        display: "flex",
        gap: theme.spacing.xs,
        flexDirection: "column",
      }}
    >
      <TextInput
        label="Strategy"
        placeholder="Strategy"
        required
        {...form.getInputProps("strategy")}
      />

      <TextInput
        label="Name"
        placeholder="Name"
        required
        {...form.getInputProps("name")}
      />

      <Checkbox
        label="Enabled"
        {...form.getInputProps("enabled", { type: "checkbox" })}
      />

      <TextInput
        label="Cron"
        placeholder="Cron"
        required
        {...form.getInputProps("cron")}
      />

      <JSONInput
        label="Params"
        placeholder="{}"
        formatOnBlur
        autosize
        maxRows={10}
        {...form.getInputProps("params")}
      />

      <JSONInput
        label="Notify"
        placeholder="{}"
        formatOnBlur
        autosize
        maxRows={10}
        {...form.getInputProps("notify")}
      />

      <Group mt="md">
        <Button disabled={isLoading} type="submit">
          {isEdit ? "Save" : "Create Job"}
        </Button>
      </Group>
    </form>
  );
};

const JSONInput = (props: JsonInputProps) => {
  const [rawJson, setRawJson] = useState(formatJSON(props.value));

  const handleJsonChange = (value: string) => {
    setRawJson(value);
    try {
      const parsedValue = JSON.parse(value);
      props.onChange?.(parsedValue);
    } catch {
      // Invalid JSON, do not update form state
    }
  };

  return <JsonInput {...props} onChange={handleJsonChange} value={rawJson} />;
};

export default JobForm;