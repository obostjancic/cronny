import {
  Button,
  Checkbox,
  Container,
  Drawer,
  Flex,
  Group,
  JsonInput,
  JsonInputProps,
  rem,
  Select,
  Tabs,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  IconClockCancel,
  IconEyeOff,
  IconFilterOff,
  IconCancel,
  IconCheck,
} from "@tabler/icons-react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetJob } from "../../../api/useGetJob";
import { ResultsTable } from "../../../components/ResultsTable";
import { JobDetails } from "@cronny/types";
import { usePatchJob } from "../../../api/usePatchJob";
import { notifications } from "@mantine/notifications";
import ReactTimeago from "react-timeago";
import { usePostRun } from "../../../api/usePostRun";
import { formatJSON } from "../../../utils/json";
import { useState } from "react";

export const Route = createFileRoute("/jobs/$jobId/")({
  component: () => <JobDetailsPage />,
});

const iconStyle = { width: rem(16), height: rem(16) };

function JobDetailsPage() {
  const { jobId } = useParams({ from: "/jobs/$jobId/" });
  const {
    data: { results, runs, ...job },
  } = useGetJob(jobId);

  const postRun = usePostRun();

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Container fluid>
      <a href="/">Jobs</a>
      <Flex gap="md" pb="xs" align="center" justify="space-between">
        <h3>Job {job.name}</h3>
        <Button variant="transparent" size="sm" onClick={open}>
          Edit
        </Button>
      </Flex>

      <Flex gap="md" pb="xs" align="center" justify="space-between">
        <Flex align="center" gap="xs">
          Enabled:
          {job.enabled ? (
            <IconCheck style={iconStyle} />
          ) : (
            <IconCancel style={iconStyle} />
          )}
        </Flex>

        <div>Strategy: {job.strategy}</div>
        <div>Schedule: {job.cron}</div>
        <div>
          Last run: <ReactTimeago date={runs[0].start} />
          <Button
            variant="transparent"
            size="sm"
            onClick={async () => {
              await postRun.mutate(job.id);
              notifications.show({
                title: "Success",
                message: "Run has been started",
                autoClose: 2000,
              });
            }}
          >
            Run
          </Button>
        </div>
      </Flex>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        title={`Job ${job.name}`}
      >
        <EditJobForm initialValues={job} onSubmit={close} />
      </Drawer>

      <ResultsTable
        rows={results
          .filter((r) => r.status === "active")
          .map((r) => ({ ...r.data, ...r }))}
      />
      <Container fluid p={0} pt="xl">
        <Tabs defaultValue="hidden">
          <Tabs.List>
            <Tabs.Tab
              value="hidden"
              leftSection={<IconEyeOff style={iconStyle} />}
            >
              Hidden
            </Tabs.Tab>
            <Tabs.Tab
              value="filtered"
              leftSection={<IconFilterOff style={iconStyle} />}
            >
              Filtered
            </Tabs.Tab>
            <Tabs.Tab
              value="expired"
              leftSection={<IconClockCancel style={iconStyle} />}
            >
              Expired
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="hidden">
            <ResultsTable
              rows={results
                .filter((r) => r.status === "hidden")
                .map((r) => ({ ...r.data, ...r }))}
            />
          </Tabs.Panel>
          <Tabs.Panel value="filtered">
            <ResultsTable
              rows={results
                .filter((r) => r.status === "filtered")
                .map((r) => ({ ...r.data, ...r }))}
            />
          </Tabs.Panel>
          <Tabs.Panel value="expired">
            <ResultsTable
              rows={results
                .filter((r) => r.status === "expired")
                .map((r) => ({ ...r.data, ...r }))}
            />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Container>
  );
}

type EditJobFormProps = {
  initialValues: Partial<JobDetails>;
  onSubmit: () => void;
};

const EditJobForm = ({ initialValues, onSubmit }: EditJobFormProps) => {
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

  const patchJob = usePatchJob({
    onSuccess: () => {
      console.log("Job updated");
    },
  });

  const handleFormSubmit = async (values: Partial<JobDetails>) => {
    await patchJob.mutate(values);
    onSubmit();
    notifications.show({
      title: "Success",
      message: "Job updated",
      autoClose: 2000,
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
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
        <Button disabled={patchJob.isPending} type="submit">
          Save
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

export default EditJobForm;
