import {
  ActionIcon,
  Badge,
  Button,
  CopyButton,
  Group,
  Modal,
  Paper,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetClients } from "../../api/useClients";
import { useGetJobs } from "../../api/useJobs";
import { EditClientForm } from "../../components/EditClientForm";
import { PageHeader } from "../../components/PageHeader";

export const Route = createFileRoute("/clients/")({
  component: Clients,
});

function Clients() {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: clients = [] } = useGetClients();
  const { data: jobs = [] } = useGetJobs();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Clients" }]}
        actions={
          <Button
            size="compact-sm"
            leftSection={<IconPlus size={14} />}
            onClick={open}
          >
            Add Client
          </Button>
        }
      />

      <Paper p={0} style={{ overflow: "hidden" }}>
        <Table>
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
                  <Link
                    to="/clients/$clientId"
                    params={{ clientId: String(client.id) }}
                    style={{ textDecoration: "none", color: "var(--mantine-color-teal-4)", fontWeight: 500, fontSize: "var(--mantine-font-size-sm)" }}
                  >
                    {client.name}
                  </Link>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Text size="xs" c="dimmed" ff="monospace">
                      {client.apiKey.slice(0, 12)}...
                    </Text>
                    <CopyButton value={client.apiKey}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? "Copied" : "Copy API key"}>
                          <ActionIcon variant="subtle" size="sm" onClick={copy}>
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {client.allowedJobs?.map((jobId) => {
                      const job = jobs.find((j) => j.id === jobId);
                      if (!job) return null;
                      return (
                        <Badge key={jobId} size="xs">
                          {job.name}
                        </Badge>
                      );
                    })}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {client.enabled ? (
                    <Badge color="green">Active</Badge>
                  ) : (
                    <Badge color="gray">Disabled</Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title="New Client" size="lg">
        <EditClientForm initialValues={null} onSubmit={close} />
      </Modal>
    </div>
  );
}
