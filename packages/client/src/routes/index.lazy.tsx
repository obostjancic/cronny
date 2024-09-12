import { CodeHighlight } from "@mantine/code-highlight";
import { Table } from "@mantine/core";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useGetJobs } from "../api/useGetJobs";
import { ExpandableRow } from "../components/ExpandableRow";
import { formatJSON } from "../utils/json";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const job = useGetJobs();

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
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {job.data?.map((job) => (
            <ExpandableRow
              key={job.id}
              details={
                <CodeHighlight
                  withCopyButton
                  language="json"
                  code={formatJSON(job)}
                  contentEditable={false}
                />
              }
            >
              <Table.Td>{job.id}</Table.Td>
              <Table.Td>
                <Link to={`/jobs/${job.id}`} key={job.id}>
                  {job.name}
                </Link>
              </Table.Td>
              <Table.Td>{job.strategy}</Table.Td>
              <Table.Td>{job.enabled ? "✔️" : "x"}</Table.Td>
              <Table.Td>{job.cron}</Table.Td>
            </ExpandableRow>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
