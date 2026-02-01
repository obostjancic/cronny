import { Container, Flex } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JobFormV2 } from "../../components/job-form";

export const Route = createFileRoute("/jobs/new")({
  component: () => <NewJobPage />,
});

function NewJobPage() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate({ to: "/" });
  };

  return (
    <Container fluid p={0}>
      <a href="/">Jobs</a>
      <Flex gap="md" pb="xs" align="center" wrap="wrap">
        <h3>Create New Job</h3>
      </Flex>

      <JobFormV2 onSubmit={handleSubmit} isEdit={false} />
    </Container>
  );
}