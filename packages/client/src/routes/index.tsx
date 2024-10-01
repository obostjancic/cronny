import { Job } from "@cronny/types";
import { createFileRoute } from "@tanstack/react-router";
import { useGetJobs } from "../api/useGetJobs";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const job = useGetJobs();

  return (
    <div className="p-2">
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Strategy</th>
            <th>Enabled</th>
            <th>Schedule</th>
          </tr>
        </thead>
        <tbody>
          {job.data?.map((job: Job) => (
            <tr key={job.id}>
              <td>{job.id}</td>
              <td>{job.name}</td>
              <td>{job.strategy}</td>
              <td>
                <div>{job.enabled}</div>
              </td>
              <td>{job.cron}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
