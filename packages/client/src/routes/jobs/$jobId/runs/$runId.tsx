import { CodeHighlight } from "@mantine/code-highlight";
import { Container, Flex, Table } from "@mantine/core";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetRuns } from "../../../../api/useGetRuns";
import { formatDateTime, formatDuration } from "../../../../utils/date/date";
import { formatJSON } from "../../../../utils/json";
import { ExpandableRow } from "../../../../components/ExpandableRow";

export const Route = createFileRoute("/jobs/$jobId/runs/$runId")({
  component: () => <RunDetails />,
});

function RunDetails() {
  const { jobId, runId } = useParams({ from: "/jobs/$jobId/runs/$runId" });
  const runs = useGetRuns(jobId);
  const run = runs.data?.find((run) => run.id === Number(runId));

  if (!run) {
    return <div>Run not found</div>;
  }

  if (!run.results) {
    return <div>No results</div>;
  }

  return (
    <Container fluid>
      <h3>
        Run {run.id} of job <a href={`/jobs/${jobId}/runs`}>{jobId}</a>
      </h3>
      <Flex gap="md" pb="xs" align="center" justify="space-between">
        <div>Start: {formatDateTime(run.start)}</div>
        <div>Duration {formatDuration(run.start, run.end)}</div>
        <div>Status: {run.status}</div>
      </Flex>
      <Flex gap="md" pt="xs">
        <Table stickyHeader striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Link</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {run.results
              .sort((a, b) => (a["title"]! > b["title"]! ? 1 : -1))
              .map((result) => (
                <ExpandableRow
                  key={result.id as string}
                  details={
                    <CodeHighlight
                      withCopyButton
                      language="json"
                      code={formatJSON(result)}
                      contentEditable={false}
                    />
                  }
                >
                  <Table.Td>{`${result["title"]}`}</Table.Td>
                  <Table.Td>
                    <a
                      href={(result.url as string) ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Link
                    </a>
                  </Table.Td>
                </ExpandableRow>
              ))}
          </Table.Tbody>
        </Table>
      </Flex>
    </Container>
  );
}
