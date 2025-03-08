import { Button, Flex, Table } from "@mantine/core";
import { IconCancel, IconCheck } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetJobs, usePostJob } from "../api/useJobs";
import useOpenJSONInNewTab from "../hooks/useOpenJSONinNewTab";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const job = useGetJobs();
  const postJob = usePostJob();

  const openJSONInNewTab = useOpenJSONInNewTab();

  return (
    <div className="p-2">
      <Table stickyHeader striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Id</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Strategy</Table.Th>
            <Table.Th>Enabled</Table.Th>
            <Table.Th>Schedule</Table.Th>
            <Table.Th>Raw</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {job.data?.map((job) => (
            <Table.Tr>
              <Table.Td>{job.id}</Table.Td>
              <Table.Td>
                <Link to={`/jobs/${job.id}`} key={job.id}>
                  {job.name}
                </Link>
              </Table.Td>
              <Table.Td>{job.strategy}</Table.Td>
              <Table.Td>
                <Flex align="center">
                  {job.enabled ? <IconCheck /> : <IconCancel />}
                </Flex>
              </Table.Td>
              <Table.Td>{job.cron}</Table.Td>
              <Table.Td>
                <Button
                  variant="transparent"
                  size="xs"
                  onClick={() => {
                    openJSONInNewTab(job);
                  }}
                >
                  JSON
                </Button>
              </Table.Td>
              <Table.Td>
                <Button
                  variant="transparent"
                  size="xs"
                  onClick={() => {
                    postJob.mutate({
                      ...job,
                      id: undefined,
                      enabled: false,
                    });
                  }}
                >
                  Duplicate
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
