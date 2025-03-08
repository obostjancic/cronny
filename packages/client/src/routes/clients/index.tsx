import { Client } from "@cronny/types";
import {
  Button,
  Card,
  Container,
  Flex,
  Group,
  Modal,
  rem,
  Table,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCancel, IconCheck, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useGetClients } from "../../api/useClients";
import { useGetJobs } from "../../api/useJobs";
import { EditClientForm } from "../../components/EditClientForm";

export const Route = createFileRoute("/clients/")({
  component: Clients,
});

const iconStyle = { width: rem(16), height: rem(16) };

function Clients() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { data: clients = [] } = useGetClients();
  const { data: jobs = [] } = useGetJobs();
  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title>Clients</Title>
        <Button variant="transparent" leftSection={<IconPlus />} onClick={open}>
          Add Client
        </Button>
      </Group>

      <Card>
        <Table stickyHeader striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>API Key</Table.Th>
              <Table.Th>Allowed Jobs</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {clients.map((client) => (
              <Table.Tr key={client.id}>
                <Table.Td>
                  <Link to={`/clients/${client.id}`}>{client.name}</Link>
                </Table.Td>
                <Table.Td>
                  <code>{client.apiKey}</code>
                </Table.Td>
                <Table.Td>
                  {client.allowedJobs?.map((jobId) => {
                    const job = jobs.find((j) => j.id === jobId);

                    if (!job) {
                      return null;
                    }

                    return <div key={jobId}>{job.name}</div>;
                  })}
                </Table.Td>
                <Table.Td>
                  <Flex align="center" gap="xs">
                    {client.enabled ? (
                      <IconCheck style={iconStyle} />
                    ) : (
                      <IconCancel style={iconStyle} />
                    )}
                  </Flex>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          close();
          setEditingClient(null);
        }}
        title={editingClient ? `Client ${editingClient.name}` : "New Client"}
        size="lg"
      >
        <EditClientForm initialValues={editingClient} onSubmit={close} />
      </Modal>
    </Container>
  );
}
