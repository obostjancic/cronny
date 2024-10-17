import { JobDetails } from "@cronny/types";
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
  Tabs,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCancel,
  IconCheck,
  IconClockCancel,
  IconEyeOff,
  IconFilterOff,
  IconPencil,
} from "@tabler/icons-react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import ReactTimeago from "react-timeago";
import { useGetJob } from "../../../api/useGetJob";
import { usePatchJob } from "../../../api/usePatchJob";
import { usePostRun } from "../../../api/usePostRun";
import { ResultsTable } from "../../../components/ResultsTable";
import { formatJSON } from "../../../utils/json";

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
    <Container fluid p={0}>
      <a href="/">Jobs</a>
      <Flex gap="md" pb="xs" align="center" wrap="wrap">
        <h3>Job {job.name}</h3>
        <Button variant="transparent" size="sm" pl={0} pr={0} onClick={open}>
          <IconPencil style={iconStyle} /> Edit
        </Button>
      </Flex>

      <Flex gap="md" pb="xs" align="center" wrap="wrap" justify="space-between">
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
            pr={0}
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
        position="left"
        title={`Job ${job.name}`}
      >
        <EditJobForm initialValues={job} onSubmit={close} />
      </Drawer>

      <ResultsTable
        rows={results
          .filter((r) => !r.isHidden && r.status === "active")
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
                .filter((r) => r.isHidden)
                .map((r) => ({ ...r.data, ...r }))}
            />
          </Tabs.Panel>
          <Tabs.Panel value="filtered">
            <ResultsTable
              rows={results
                .filter((r) => !r.isHidden && r.status === "filtered")
                .map((r) => ({ ...r.data, ...r }))}
            />
          </Tabs.Panel>
          <Tabs.Panel value="expired">
            <ResultsTable
              rows={results
                .filter((r) => !r.isHidden && r.status === "expired")
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

  const theme = useMantineTheme();

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
