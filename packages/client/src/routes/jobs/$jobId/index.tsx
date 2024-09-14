import { Button, Collapse, Container, Flex } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetJob } from "../../../api/useGetJob";
import { ResultsTable } from "../../../components/ResultsTable";

export const Route = createFileRoute("/jobs/$jobId/")({
  component: () => <JobDetails />,
});

function JobDetails() {
  const { jobId } = useParams({ from: "/jobs/$jobId/" });
  const {
    data: { results, ...job },
  } = useGetJob(jobId);

  return (
    <Container fluid>
      <Flex gap="md" pb="xs" align="center" justify="space-between">
        <h3>Job {job.name}</h3>
        <a href="/">Jobs</a>
      </Flex>
      <ResultsTable
        rows={results
          .filter((r) => r.status === "active")
          .map((r) => ({ ...r, ...r.data }))}
      />
      <Collapsible title="Filtered results">
        <ResultsTable
          rows={results
            .filter((r) => r.status === "filtered")
            .map((r) => ({ ...r, ...r.data }))}
        />
      </Collapsible>
      <Collapsible title="Hidden results">
        <ResultsTable
          rows={results
            .filter((r) => r.status === "hidden")
            .map((r) => ({ ...r, ...r.data }))}
        />
      </Collapsible>
      <Collapsible title="Expired results">
        <ResultsTable
          rows={results
            .filter((r) => r.status === "expired")
            .map((r) => ({ ...r, ...r.data }))}
        />
      </Collapsible>
    </Container>
  );
}

function Collapsible({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure(false);

  if (!children) {
    return null;
  }
  return (
    <Container fluid p={0} mt="sm">
      <Button variant="transparent" size="sm" onClick={toggle}>
        {opened ? "Hide" : "Show"} {title}
      </Button>

      <Collapse in={opened}>{children}</Collapse>
    </Container>
  );
}
