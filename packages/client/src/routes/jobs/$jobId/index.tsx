import { Container, Flex, Table } from "@mantine/core";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useGetJob } from "../../../api/useGetJob";
import { formatDateTime, formatDuration } from "../../../utils/date/date";
import { ExpandableRow } from "../../../components/ExpandableRow";
import { CodeHighlight } from "@mantine/code-highlight";
import { formatJSON } from "../../../utils/json";

export const Route = createFileRoute("/jobs/$jobId/")({
  component: () => <JobDetails />,
});

function JobDetails() {
  const { jobId } = useParams({ from: "/jobs/$jobId/" });
  const {
    data: { runs, ...job },
  } = useGetJob(jobId);

  return (
    <Container fluid>
      <Flex gap="md" pb="xs" align="center" justify="space-between">
        <h3>Job {jobId}</h3>
        <a href="/">Jobs</a>
      </Flex>
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
          {runs.map((run) => (
            <ExpandableRow
              key={run.id}
              details={
                <Flex gap="md" p="xs" direction="column">
                  <CodeHighlight
                    withCopyButton
                    language="json"
                    code={formatJSON(job)}
                    contentEditable={false}
                  />
                  <CodeHighlight
                    withCopyButton
                    language="json"
                    code={formatJSON(run.data)}
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
              <Table.Td>{run.data?.length}</Table.Td>
            </ExpandableRow>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
