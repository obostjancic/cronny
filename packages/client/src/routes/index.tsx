import { JobWithTiming } from "@cronny/types";
import { Badge, Button, Flex, Table } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createFileRoute, Link } from "@tanstack/react-router";
import ReactTimeago from "react-timeago";
import { useGetJobs, usePostJob } from "../api/useJobs";
import useOpenJSONInNewTab from "../hooks/useOpenJSONinNewTab";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const jobs = useGetJobs();
  const postJob = usePostJob();

  const openJSONInNewTab = useOpenJSONInNewTab();

  return (
    <div className="p-2">
      <Flex justify="space-between" align="center" mb="md">
        <h2>Jobs</h2>
        <Button variant="transparent" component={Link} to="/jobs/new">
          Add New Job
        </Button>
      </Flex>
      <Table stickyHeader highlightOnHover>
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
          {(jobs.data as JobWithTiming[])?.map((job) => (
            <Table.Tr key={job.id}>
              <Table.Td>
                <Link to="/jobs/$jobId" params={{ jobId: String(job.id) }}>
                  {job.name}
                </Link>
              </Table.Td>
              <Table.Td>{job.strategy}</Table.Td>
              <Table.Td>
                {job.enabled ? (
                  <Badge color="green" variant="light">Active</Badge>
                ) : (
                  <Badge color="orange" variant="light">Paused</Badge>
                )}
              </Table.Td>
              <Table.Td>
                {job.lastRun ? <ReactTimeago date={job.lastRun} /> : "Never"}
              </Table.Td>
              <Table.Td>
                {job.nextRun ? <ReactTimeago date={job.nextRun} /> : "-"}
              </Table.Td>
              <Table.Td>
                <Flex gap="xs">
                  <Button
                    variant="transparent"
                    size="xs"
                    onClick={() => openJSONInNewTab(job)}
                  >
                    JSON
                  </Button>
                  <Button
                    variant="transparent"
                    size="xs"
                    onClick={() => {
                      postJob.mutate(
                        {
                          ...job,
                          id: undefined,
                          enabled: false,
                        },
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
                    Duplicate
                  </Button>
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
