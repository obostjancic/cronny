import type { JSONObject, Run } from "@cronny/types";
import { CodeHighlight } from "@mantine/code-highlight";
import { Button, Collapse, Container, Flex, Table } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetRun } from "../../../../api/useGetRun";
import { ExpandableRow } from "../../../../components/ExpandableRow";
import { formatDateTime, formatDuration } from "../../../../utils/date/date";
import { formatJSON } from "../../../../utils/json";
import { useGetJob } from "../../../../api/useGetJob";

export const Route = createFileRoute("/jobs/$jobId/runs/$runId")({
  component: () => <RunDetails />,
});

function RunDetails() {
  const { jobId, runId } = useParams({ from: "/jobs/$jobId/runs/$runId" });
  const { data: job } = useGetJob(jobId);
  const { data: run } = useGetRun(jobId, runId);

  if (!run) {
    return <div>Run not found</div>;
  }

  if (!run.data) {
    return <div>No results</div>;
  }

  return (
    <Container fluid>
      <h3>
        Run {run.id} of job <a href={`/jobs/${jobId}`}>{job.name}</a>
      </h3>
      <Flex gap="md" pb="xs" align="center" justify="space-between">
        <div>Start: {formatDateTime(run.start)}</div>
        <div>Duration {formatDuration(run.start, run.end)}</div>
        <div>Status: {run.status}</div>
      </Flex>
      <ResultsTable rows={run.data} />

      <FilteredResults run={run} />
    </Container>
  );
}

function FilteredResults({ run }: { run: Run }) {
  const filteredResults = run.meta?.filteredResults as JSONObject[];
  const [opened, { toggle }] = useDisclosure(false);

  if (!filteredResults) {
    return null;
  }
  return (
    <Container fluid p={0} mt="sm">
      <Button variant="transparent" size="sm" onClick={toggle}>
        {opened ? "Hide" : "Show"} filtered results
      </Button>

      <Collapse in={opened}>
        <ResultsTable rows={filteredResults} />
      </Collapse>
    </Container>
  );
}

function ResultsTable({ rows }: { rows: JSONObject[] }) {
  if (!rows || rows.length === 0) {
    return <div>No results</div>;
  }

  const firstRow = rows[0];

  const allColumns = ["title", "size", "price", "url"];

  const columns = allColumns.filter((column) => firstRow[column] !== undefined);

  return (
    <Flex gap="md" pt="xs">
      <Table stickyHeader striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column}>{column}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows
            .sort((a, b) => (a["title"]! > b["title"]! ? 1 : -1))
            .map((row) => (
              <ExpandableRow
                key={row.id as string}
                details={
                  <CodeHighlight
                    withCopyButton
                    language="json"
                    code={formatJSON(row)}
                    contentEditable={false}
                  />
                }
              >
                {columns.map((column) => {
                  if (column === "url") {
                    return (
                      <Table.Td key={column}>
                        <a
                          href={(row[column] as string) ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Link
                        </a>
                      </Table.Td>
                    );
                  }

                  return (
                    <Table.Td key={column}>{row[column]?.toString()}</Table.Td>
                  );
                })}
              </ExpandableRow>
            ))}
        </Table.Tbody>
      </Table>
    </Flex>
  );
}
