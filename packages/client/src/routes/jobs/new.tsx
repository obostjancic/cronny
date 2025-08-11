import { Container, Flex } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import JobForm from "../../components/JobForm";

export const Route = createFileRoute("/jobs/new")({
  component: () => <NewJobPage />,
});

function NewJobPage() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Navigate back to jobs list after creation
    navigate({ to: "/" });
  };

  return (
    <Container fluid p={0}>
      <a href="/">Jobs</a>
      <Flex gap="md" pb="xs" align="center" wrap="wrap">
        <h3>Create New Job</h3>
      </Flex>

      <JobForm onSubmit={handleSubmit} isEdit={false} />
    </Container>
  );
}