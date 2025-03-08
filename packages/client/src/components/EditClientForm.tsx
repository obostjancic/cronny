import { Client } from "@cronny/types";
import {
  Button,
  Group,
  MultiSelect,
  Stack,
  Switch,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { usePatchClient, usePostClient } from "../api/useClients";
import { useGetJobs } from "../api/useJobs";

type EditClientFormProps = {
  initialValues: Partial<Client> | null;
  onSubmit: () => void;
};

interface FormValues {
  name: string;
  allowedJobs: string[];
  enabled: boolean;
}

export function EditClientForm({
  initialValues,
  onSubmit,
}: EditClientFormProps): JSX.Element {
  const form = useForm<FormValues>({
    initialValues: initialValues
      ? {
          name: initialValues.name ?? "",
          allowedJobs: initialValues.allowedJobs?.map(String) ?? [],

          enabled: initialValues.enabled ?? false,
        }
      : {
          name: "",
          allowedJobs: [],
          enabled: false,
        },
  });

  const { data: jobs = [] } = useGetJobs();
  const createClient = usePostClient();
  const updateClient = usePatchClient(initialValues?.id ?? 0);

  const jobSelectData = jobs.map((job) => ({
    value: job.id.toString(),
    label: `${job.name} (${job.strategy})`,
  }));

  const handleSubmit = async (values: FormValues) => {
    const submitData = {
      name: values.name,
      allowedJobs: values.allowedJobs.map(Number),
      enabled: values.enabled,
    };

    try {
      if (initialValues?.id) {
        await updateClient.mutateAsync(submitData);
        notifications.show({
          title: "Success",
          message: "Client updated successfully",
          color: "green",
        });
      } else {
        await createClient.mutateAsync(submitData);
        notifications.show({
          title: "Success",
          message: "Client created successfully",
          color: "green",
        });
      }
      onSubmit();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save client",
        color: "red",
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="Enter client name"
          required
          {...form.getInputProps("name")}
        />
        <MultiSelect
          label="Allowed Jobs"
          placeholder="Select jobs"
          data={jobSelectData}
          searchable
          {...form.getInputProps("allowedJobs")}
        />
        <Switch
          label="Enabled"
          {...form.getInputProps("enabled", { type: "checkbox" })}
        />
        <Group mt="md">
          <Button
            type="submit"
            loading={createClient.isPending || updateClient.isPending}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
