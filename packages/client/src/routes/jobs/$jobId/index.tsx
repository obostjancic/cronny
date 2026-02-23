import { Result } from "@cronny/types";
import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Modal,
  Paper,
  rem,
  Tabs,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconClockCancel,
  IconEyeOff,
  IconFilterOff,
  IconPencil,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import ReactTimeago, { Formatter } from "react-timeago";

const shortFormatter: Formatter = (value, unit, suffix) => {
  const unitMap: Record<string, string> = {
    second: "s",
    minute: "m",
    hour: "h",
    day: "d",
    week: "w",
    month: "mo",
    year: "y",
  };
  const short = unitMap[unit] || unit;
  return suffix === "ago" ? `${value}${short} ago` : `${value}${short}`;
};

import { useDeleteJob, useGetJob } from "../../../api/useJobs";
import { useDeleteResults } from "../../../api/useResults";
import { usePostRun } from "../../../api/useRuns";
import { JobForm } from "../../../components/job-form";
import { PageHeader } from "../../../components/PageHeader";
import { ResultsTable } from "../../../components/ResultsTable";
import { StatCard } from "../../../components/StatCard";

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

  const activeResults = results.filter((r: Result) => !r.isHidden && r.status === "active");
  const hiddenResults = results.filter((r: Result) => r.isHidden);
  const filteredResults = results.filter((r: Result) => !r.isHidden && r.status === "filtered");
  const expiredResults = results.filter((r: Result) => !r.isHidden && r.status === "expired");

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Jobs", to: "/" },
          { label: job.name },
        ]}
        actions={
          <Group gap="xs">
            <Tooltip label="Edit job">
              <ActionIcon variant="subtle" size="md" onClick={open}>
                <IconPencil style={iconStyle} />
              </ActionIcon>
            </Tooltip>
            <Button
              size="compact-sm"
              leftSection={<IconPlayerPlay size={14} />}
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
              Run Now
            </Button>
            <Button
              size="compact-sm"
              variant="subtle"
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
              Clear Results
            </Button>
            <Tooltip label="Delete job">
              <ActionIcon variant="subtle" color="red" size="md" onClick={handleDelete}>
                <IconTrash style={iconStyle} />
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      />

      {/* Stat cards */}
      <Flex gap="md" mb="lg" wrap="wrap">
        <StatCard label="Status">
          {job.enabled ? (
            <Badge color="green">Active</Badge>
          ) : (
            <Badge color="orange">Paused</Badge>
          )}
        </StatCard>
        <StatCard label="Strategy">
          <Badge>{job.strategy}</Badge>
        </StatCard>
        <StatCard label="Schedule">
          {job.cron}
        </StatCard>
        <StatCard label="Last Run">
          {runs[0]?.start ? (
            <ReactTimeago date={runs[0].start} formatter={shortFormatter} />
          ) : (
            "Never"
          )}
        </StatCard>
        {jobDetails.nextRun && (
          <StatCard label="Next Run">
            <ReactTimeago date={jobDetails.nextRun} formatter={shortFormatter} />
          </StatCard>
        )}
      </Flex>

      {/* Active results */}
      <ResultsTable
        rows={activeResults.map((r: Result) => ({ ...r.data, ...r }))}
        label="Active Results"
      />

      {/* Secondary results tabs */}
      <Paper p={0} mt="xl" style={{ overflow: "hidden" }}>
        <Tabs defaultValue="hidden">
          <Tabs.List>
            <Tabs.Tab
              value="hidden"
              leftSection={<IconEyeOff style={iconStyle} />}
            >
              Hidden ({hiddenResults.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="filtered"
              leftSection={<IconFilterOff style={iconStyle} />}
            >
              Filtered ({filteredResults.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="expired"
              leftSection={<IconClockCancel style={iconStyle} />}
            >
              Expired ({expiredResults.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="hidden" p="sm">
            <ResultsTable rows={hiddenResults.map((r: Result) => ({ ...r.data, ...r }))} />
          </Tabs.Panel>
          <Tabs.Panel value="filtered" p="sm">
            <ResultsTable rows={filteredResults.map((r: Result) => ({ ...r.data, ...r }))} />
          </Tabs.Panel>
          <Tabs.Panel value="expired" p="sm">
            <ResultsTable rows={expiredResults.map((r: Result) => ({ ...r.data, ...r }))} />
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Modal opened={opened} onClose={close} title={`Edit: ${job.name}`} size="90%">
        <JobForm initialValues={job} onSubmit={close} isEdit={true} />
      </Modal>
    </div>
  );
}
