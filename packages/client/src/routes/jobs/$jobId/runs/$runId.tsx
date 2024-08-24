import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useGetRuns } from "../../../../api/useGetRuns";
import { JsonInput, Table } from "@mantine/core";
import { formatJSON } from "../../../../utils/json";

export const Route = createFileRoute("/jobs/$jobId/runs/$runId")({
  component: () => <RunDetails />,
});

function RunDetails() {
  const { jobId, runId } = useParams({ from: "/jobs/$jobId/runs/$runId" });
  const runs = useGetRuns(jobId);
  const run = runs.data?.find((run) => run.id === Number(runId));

  return (
    <div>
      <h1>
        Run {run?.id} of job {jobId}
      </h1>
      <Table striped highlightOnHover withTableBorder>
        <thead>
          <tr>
            <th>Results</th>
          </tr>
        </thead>
        <tbody>
          {runs.data?.map((run) => (
            <tr key={run.id}>
              <td>
                <JsonInput
                  value={formatJSON(run.results as any)}
                  formatOnBlur
                  maxRows={3}
                  autosize
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
