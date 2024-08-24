import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useGetRuns } from "../../../../api/useGetRuns";
import { JsonInput, Table } from "@mantine/core";
import { formatJSON } from "../../../../utils/json";

export const Route = createFileRoute("/jobs/$jobId/runs/")({
  component: () => <JobDetails />,
});

function JobDetails() {
  const { jobId } = useParams({ from: "/jobs/$jobId/runs/" });
  const runs = useGetRuns(jobId);

  return (
    <div>
      <h1>Job {jobId}</h1>
      <Table striped highlightOnHover withTableBorder>
        <thead>
          <tr>
            <th>Id</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Config</th>
            <th>Results</th>
          </tr>
        </thead>
        <tbody>
          {runs.data?.map((run) => (
            <tr key={run.id}>
              <td>
                <Link to={`/jobs/${jobId}/runs/${run.id}`} key={run.id}>
                  {run.id}
                </Link>
              </td>
              <td>{run.start}</td>
              <td>{run.end}</td>
              <td>{run.status}</td>
              <td>
                <JsonInput
                  value={formatJSON(run.config)}
                  formatOnBlur
                  maxRows={3}
                  autosize
                />
              </td>
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
