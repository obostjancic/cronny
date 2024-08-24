import { Table } from "@mantine/core";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useGetJobs } from "../api/useGetJobs";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const job = useGetJobs();

  return (
    <div className="p-2">
      <Table striped highlightOnHover withTableBorder>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Strategy</th>
            <th>Schedule</th>
          </tr>
        </thead>
        <tbody>
          {job.data?.map((job) => (
            <tr key={job.jobId}>
              <td>
                <Link to={`/jobs/${job.jobId}/runs`} key={job.jobId}>
                  {job.jobId}
                </Link>
              </td>
              <td>{job.name}</td>
              <td>{job.strategy}</td>
              <td>
                {job.cron} {job.interval}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
