import { Button, Container, Flex, Modal, rem } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCancel, IconCheck, IconEdit } from "@tabler/icons-react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetClient } from "../../api/useClients";
import { useGetJobs } from "../../api/useJobs";
import { EditClientForm } from "../../components/EditClientForm";

export const Route = createFileRoute("/clients/$clientId")({
  component: ClientDetailsPage,
});

const iconStyle = { width: rem(16), height: rem(16) };

function ClientDetailsPage() {
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const { data: client } = useGetClient(+clientId);
  const [opened, { open, close }] = useDisclosure(false);
  const { data: jobs = [] } = useGetJobs();

  return (
    <Container fluid p={0}>
      <a href="/clients">Clients</a>
      <Flex gap="md" pb="xs" align="center" wrap="wrap">
        <h3>Client {client.name}</h3>
        <Button variant="transparent" size="sm" pl={0} pr={0} onClick={open}>
          <IconEdit style={iconStyle} /> Edit
        </Button>
      </Flex>

      <Flex gap="md" pb="xs" align="center" wrap="wrap" justify="space-between">
        <Flex align="center" gap="xs">
          Status:
          {client.enabled ? (
            <IconCheck style={iconStyle} />
          ) : (
            <IconCancel style={iconStyle} />
          )}
        </Flex>

        <div>
          API Key: <code>{client.apiKey}</code>
        </div>
        <div>
          Allowed Jobs:
          {client.allowedJobs?.map((jobId) => {
            const job = jobs.find((j) => j.id === jobId);

            if (!job) {
              return null;
            }

            return <div key={jobId}>{job.name}</div>;
          })}
        </div>
      </Flex>

      <Modal
        opened={opened}
        onClose={close}
        title={`Client ${client.name}`}
        size="lg"
      >
        <EditClientForm initialValues={client} onSubmit={close} />
      </Modal>
    </Container>
  );
}
