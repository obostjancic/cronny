import {
  ActionIcon,
  Badge,
  CopyButton,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconPencil } from "@tabler/icons-react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetClient } from "../../api/useClients";
import { useGetJobs } from "../../api/useJobs";
import { EditClientForm } from "../../components/EditClientForm";
import { PageHeader } from "../../components/PageHeader";

export const Route = createFileRoute("/clients/$clientId")({
  component: ClientDetailsPage,
});

function ClientDetailsPage() {
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const { data: client } = useGetClient(+clientId);
  const [opened, { open, close }] = useDisclosure(false);
  const { data: jobs = [] } = useGetJobs();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Clients", to: "/clients" },
          { label: client.name },
        ]}
        actions={
          <Tooltip label="Edit client">
            <ActionIcon variant="subtle" size="md" onClick={open}>
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
        }
      />

      <Stack gap="md">
        <Paper p="md">
          <Group justify="space-between" mb="sm">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Status</Text>
            {client.enabled ? (
              <Badge color="green">Active</Badge>
            ) : (
              <Badge color="gray">Disabled</Badge>
            )}
          </Group>

          <Group justify="space-between" mb="sm">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>API Key</Text>
            <Group gap={4}>
              <Text size="sm" ff="monospace">{client.apiKey}</Text>
              <CopyButton value={client.apiKey}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy"}>
                    <ActionIcon variant="subtle" size="sm" onClick={copy}>
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Group>

          <Group justify="space-between" align="flex-start">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Allowed Jobs</Text>
            <Group gap={4}>
              {client.allowedJobs?.map((jobId) => {
                const job = jobs.find((j) => j.id === jobId);
                if (!job) return null;
                return <Badge key={jobId} size="xs">{job.name}</Badge>;
              })}
              {(!client.allowedJobs || client.allowedJobs.length === 0) && (
                <Text size="sm" c="dimmed">None</Text>
              )}
            </Group>
          </Group>
        </Paper>
      </Stack>

      <Modal opened={opened} onClose={close} title={`Edit: ${client.name}`} size="lg">
        <EditClientForm initialValues={client} onSubmit={close} />
      </Modal>
    </div>
  );
}
