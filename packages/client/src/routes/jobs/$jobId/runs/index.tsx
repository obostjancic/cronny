import { Container, Flex, Table } from "@mantine/core";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useGetRuns } from "../../../../api/useGetRuns";
import { formatDateTime, formatDuration } from "../../../../utils/date/date";
import { ExpandableRow } from "../../../../components/ExpandableRow";
import { CodeHighlight } from "@mantine/code-highlight";
import { formatJSON } from "../../../../utils/json";

export const Route = createFileRoute("/jobs/$jobId/runs/")({
  component: () => <JobDetails />,
});

function JobDetails() {
  const { jobId } = useParams({ from: "/jobs/$jobId/runs/" });
  const runs = useGetRuns(jobId);

  return (
    <Container fluid>
      <h1>Job {jobId}</h1>
      <Table stickyHeader striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Id</Table.Th>
            <Table.Th>Start</Table.Th>
            <Table.Th>Duration</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>No. of results</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {runs.data?.map((run) => (
            <ExpandableRow
              key={run.id}
              details={
                <Flex gap="md" direction="column">
                  <CodeHighlight
                    withCopyButton
                    language="json"
                    code={formatJSON(run.config)}
                    contentEditable={false}
                  />
                  <CodeHighlight
                    withCopyButton
                    language="json"
                    code={formatJSON(run.results)}
                    contentEditable={false}
                  />
                </Flex>
              }
            >
              <Table.Td>
                <Link to={`/jobs/${jobId}/runs/${run.id}`} key={run.id}>
                  {run.id}
                </Link>
              </Table.Td>
              <Table.Td>{formatDateTime(run.start)}</Table.Td>
              <Table.Td>{formatDuration(run.start, run.end)}</Table.Td>
              <Table.Td>{run.status}</Table.Td>
              <Table.Td>{run.results?.length}</Table.Td>
            </ExpandableRow>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
