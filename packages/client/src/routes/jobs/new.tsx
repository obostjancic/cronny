import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JobFormV2 } from "../../components/job-form";
import { PageHeader } from "../../components/PageHeader";

export const Route = createFileRoute("/jobs/new")({
  component: () => <NewJobPage />,
});

function NewJobPage() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate({ to: "/" });
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Jobs", to: "/" },
          { label: "New Job" },
        ]}
      />
      <JobFormV2 onSubmit={handleSubmit} isEdit={false} />
    </div>
  );
}
