import { JobWithTiming } from "@cronny/types";
import { ActionIcon, Badge, Button, Group, Paper, Table, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import ReactTimeago from "react-timeago";
import { useGetJobs, usePostJob } from "../api/useJobs";
import useOpenJSONInNewTab from "../hooks/useOpenJSONinNewTab";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const jobs = useGetJobs();
  const postJob = usePostJob();
  const openJSONInNewTab = useOpenJSONInNewTab();

  const jobsList = (jobs.data as JobWithTiming[]) ?? [];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Jobs" }]}
        actions={
          <Button
            component={Link}
            to="/jobs/new"
            size="compact-sm"
            leftSection={<IconPlus size={14} />}
          >
            New Job
          </Button>
        }
      />

      <Paper p={0} style={{ overflowX: "auto" }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Strategy</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Last Run</Table.Th>
              <Table.Th>Next Run</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {jobsList.map((job) => (
              <Table.Tr key={job.id}>
                <Table.Td>
                  <Link
                    to="/jobs/$jobId"
                    params={{ jobId: String(job.id) }}
                    style={{ textDecoration: "none", color: "var(--mantine-color-teal-4)", fontWeight: 500, fontSize: "var(--mantine-font-size-sm)" }}
                  >
                    {job.name}
                  </Link>
                </Table.Td>
                <Table.Td>
                  <Badge>{job.strategy}</Badge>
                </Table.Td>
                <Table.Td>
                  {job.enabled ? (
                    <Badge color="green">Active</Badge>
                  ) : (
                    <Badge color="orange">Paused</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {job.lastRun ? <ReactTimeago date={job.lastRun} /> : "Never"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {job.nextRun ? <ReactTimeago date={job.nextRun} /> : "\u2014"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View JSON">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => openJSONInNewTab(job)}
                      >
                        <Text size="xs" fw={500}>{"{}"}</Text>
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Duplicate">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          postJob.mutate(
                            { ...job, id: undefined, enabled: false },
                            {
                              onSuccess: () => {
                                notifications.show({
                                  title: "Success",
                                  message: `Duplicated "${job.name}"`,
                                  autoClose: 2000,
                                });
                              },
                              onError: (error) => {
                                notifications.show({
                                  title: "Error",
                                  message: error.message || "Failed to duplicate job",
                                  color: "red",
                                });
                              },
                            }
                          );
                        }}
                      >
                        <IconCopy size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}
