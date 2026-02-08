import { Result } from "@cronny/types";
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
  IconClockCancel,
  IconEyeOff,
  IconFilterOff,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import ReactTimeago from "react-timeago";
import { useDeleteJob, useGetJob } from "../../../api/useJobs";
import { useDeleteResults } from "../../../api/useResults";
import { usePostRun } from "../../../api/useRuns";
import { JobFormV2 } from "../../../components/job-form";
import { ResultsTable } from "../../../components/ResultsTable";

export const Route = createFileRoute("/jobs/$jobId/")({
  component: () => <JobDetailsPage />,
});

const iconStyle = { width: rem(16), height: rem(16) };

function JobDetailsPage() {
  const { jobId } = useParams({ from: "/jobs/$jobId/" });
  const { data: jobDetails } = useGetJob(jobId);
  const navigate = useNavigate();

  const { results, runs, ...job } = jobDetails;

  const postRun = usePostRun();
  const deleteResults = useDeleteResults();
  const deleteJob = useDeleteJob();

  const [opened, { open, close }] = useDisclosure(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${job.name}"? This cannot be undone.`)) {
      await deleteJob.mutateAsync(job.id);
      notifications.show({
        title: "Deleted",
        message: `Job "${job.name}" has been deleted`,
        autoClose: 2000,
      });
      navigate({ to: "/" });
    }
  };

  return (
    <Container fluid p={0}>
      <a href="/">Jobs</a>
      <Flex gap="md" pb="xs" align="center" wrap="wrap">
        <h3>Job {job.name}</h3>
        <Button variant="transparent" size="sm" pl={0} pr={0} onClick={open}>
          <IconPencil style={iconStyle} /> Edit
        </Button>
        <Button variant="transparent" size="sm" pl={0} pr={0} color="red" onClick={handleDelete}>
          <IconTrash style={iconStyle} /> Delete
        </Button>
      </Flex>

      <Flex gap="md" pb="xs" align="center" wrap="wrap" justify="space-between">
        <Flex align="center" gap="xs">
          {job.enabled ? (
            <>
              <IconPlayerPlay style={iconStyle} color="green" />
              Active
            </>
          ) : (
            <>
              <IconPlayerPause style={iconStyle} color="orange" />
              Paused
            </>
          )}
        </Flex>

        <div>Strategy: {job.strategy}</div>
        <div>Schedule: {job.cron}</div>
        <div>
          Last run: {runs[0]?.start ? <ReactTimeago date={runs[0].start} /> : "Never"}
          {jobDetails.nextRun && (
            <> | Next: <ReactTimeago date={jobDetails.nextRun} /></>
          )}
          <Button
            variant="transparent"
            size="sm"
            pr={0}
            loading={postRun.isPending}
            onClick={() => {
              postRun.mutate(job.id, {
                onSuccess: () => {
                  notifications.show({
                    title: "Success",
                    message: "Run has been started",
                    autoClose: 2000,
                  });
                },
                onError: (error) => {
                  notifications.show({
                    title: "Error",
                    message: error.message || "Failed to start run",
                    color: "red",
                  });
                },
              });
            }}
          >
            Run
          </Button>
          <Button
            variant="transparent"
            size="sm"
            pr={0}
            loading={deleteResults.isPending}
            onClick={() => {
              if (confirm("Are you sure you want to clear the results?")) {
                deleteResults.mutate(job.id, {
                  onSuccess: () => {
                    notifications.show({
                      title: "Success",
                      message: "Cleared results",
                      autoClose: 2000,
                    });
                  },
                  onError: (error) => {
                    notifications.show({
                      title: "Error",
                      message: error.message || "Failed to clear results",
                      color: "red",
                    });
                  },
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
        <JobFormV2 initialValues={job} onSubmit={close} isEdit={true} />
      </Modal>

      <ResultsTable
        rows={results
          .filter((r: Result) => !r.isHidden && r.status === "active")
          .map((r: Result) => ({ ...r.data, ...r }))}
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
                .filter((r: Result) => r.isHidden)
                .map((r: Result) => ({ ...r.data, ...r }))}
            />
          </Tabs.Panel>
          <Tabs.Panel value="filtered">
            <ResultsTable
              rows={results
                .filter((r: Result) => !r.isHidden && r.status === "filtered")
                .map((r: Result) => ({ ...r.data, ...r }))}
            />
          </Tabs.Panel>
          <Tabs.Panel value="expired">
            <ResultsTable
              rows={results
                .filter((r: Result) => !r.isHidden && r.status === "expired")
                .map((r: Result) => ({ ...r.data, ...r }))}
            />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Container>
  );
}
