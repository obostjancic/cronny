import {
  Button,
  Container,
  Flex,
  Modal,
  rem,
  Tabs,
} from "@mantine/core";
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
import ReactTimeago from "react-timeago";
import { useGetJob } from "../../../api/useJobs";
import { useDeleteResults } from "../../../api/useResults";
import { usePostRun } from "../../../api/useRuns";
import JobForm from "../../../components/JobForm";
import { ResultsTable } from "../../../components/ResultsTable";

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
  const deleteResults = useDeleteResults();

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
          Last run: <ReactTimeago date={runs[0]?.start} />
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
          <Button
            variant="transparent"
            size="sm"
            pr={0}
            onClick={async () => {
              if (confirm("Are you sure you want to clear the reuslts?")) {
                await deleteResults.mutate(job.id);
                notifications.show({
                  title: "Success",
                  message: "Cleared results",
                  autoClose: 2000,
                });
              }
            }}
          >
            Clear
          </Button>
        </div>
      </Flex>

      <Modal
        opened={opened}
        onClose={close}
        title={`Job ${job.name}`}
        size="90%"
      >
        <JobForm initialValues={job} onSubmit={close} isEdit={true} />
      </Modal>

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

