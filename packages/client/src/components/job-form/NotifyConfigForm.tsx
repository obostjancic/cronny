import { ActionIcon, Button, Checkbox, Group, Paper, Select, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface NotifyConfig {
  type: string;
  trigger?: string;
  [key: string]: any;
}

interface NotifyConfigFormProps {
  value: NotifyConfig[];
  onChange: (configs: NotifyConfig[]) => void;
}

const NOTIFY_TYPES = [
  { value: "slack", label: "Slack" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "file", label: "File" },
  { value: "email", label: "Email" },
  { value: "telegram", label: "Telegram" },
  { value: "webhook", label: "Webhook" },
];

const TRIGGER_OPTIONS = [
  { value: "onSuccess", label: "On Success" },
  { value: "onFailure", label: "On Failure" },
];

export function NotifyConfigForm({ value, onChange }: NotifyConfigFormProps) {
  const configs = value || [];

  const addConfig = () => {
    onChange([...configs, { type: "slack", trigger: "onSuccess" }]);
  };

  const removeConfig = (index: number) => {
    onChange(configs.filter((_, i) => i !== index));
  };

  const updateConfig = (index: number, updates: Partial<NotifyConfig>) => {
    onChange(
      configs.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  };

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Text fw={500} size="sm">
          Notifications
        </Text>
        <Button
          variant="light"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={addConfig}
        >
          Add Notification
        </Button>
      </Group>

      {configs.length === 0 && (
        <Text size="sm" c="dimmed">
          No notifications configured.
        </Text>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {configs.map((config, index) => (
          <NotifyConfigRow
            key={index}
            config={config}
            onChange={(updates) => updateConfig(index, updates)}
            onRemove={() => removeConfig(index)}
          />
        ))}
      </div>
    </Paper>
  );
}

interface NotifyConfigRowProps {
  config: NotifyConfig;
  onChange: (updates: Partial<NotifyConfig>) => void;
  onRemove: () => void;
}

function NotifyConfigRow({ config, onChange, onRemove }: NotifyConfigRowProps) {
  return (
    <Paper p="sm" withBorder style={{ backgroundColor: "var(--mantine-color-dark-7)" }}>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Select
            size="xs"
            value={config.type}
            onChange={(value) => onChange({ type: value || "slack" })}
            data={NOTIFY_TYPES}
            w={120}
          />
          <Select
            size="xs"
            value={config.trigger || "onSuccess"}
            onChange={(value) => onChange({ trigger: value || "onSuccess" })}
            data={TRIGGER_OPTIONS}
            w={120}
          />
          {config.trigger === "onSuccess" && (
            <Checkbox
              size="xs"
              label="Only on new results"
              checked={config.onResultChangeOnly || false}
              onChange={(e) => onChange({ onResultChangeOnly: e.currentTarget.checked })}
            />
          )}
        </Group>
        <ActionIcon variant="subtle" color="red" size="sm" onClick={onRemove}>
          <IconTrash size={14} />
        </ActionIcon>
      </Group>

      {config.type === "slack" && (
        <TextInput
          size="xs"
          label="Webhook URL"
          placeholder="https://hooks.slack.com/services/..."
          value={config.webhook || ""}
          onChange={(e) => onChange({ webhook: e.currentTarget.value })}
        />
      )}

      {config.type === "whatsapp" && (
        <>
          <TextInput
            size="xs"
            label="Phone Number"
            placeholder="+43..."
            value={config.phone || ""}
            onChange={(e) => onChange({ phone: e.currentTarget.value })}
            mb="xs"
          />
          <TextInput
            size="xs"
            label="API Key"
            placeholder="Your WhatsApp API key"
            value={config.apiKey || ""}
            onChange={(e) => onChange({ apiKey: e.currentTarget.value })}
          />
        </>
      )}

      {config.type === "file" && (
        <TextInput
          size="xs"
          label="File Path"
          placeholder="/path/to/output.json"
          value={config.path || ""}
          onChange={(e) => onChange({ path: e.currentTarget.value })}
        />
      )}

      {config.type === "email" && (
        <>
          <TextInput
            size="xs"
            label="To Email"
            placeholder="user@example.com"
            value={config.to || ""}
            onChange={(e) => onChange({ to: e.currentTarget.value })}
            mb="xs"
          />
          <TextInput
            size="xs"
            label="Subject"
            placeholder="Job notification"
            value={config.subject || ""}
            onChange={(e) => onChange({ subject: e.currentTarget.value })}
          />
        </>
      )}

      {config.type === "telegram" && (
        <>
          <TextInput
            size="xs"
            label="Chat ID"
            placeholder="123456789"
            value={config.chatId || ""}
            onChange={(e) => onChange({ chatId: e.currentTarget.value })}
            mb="xs"
          />
          <TextInput
            size="xs"
            label="Bot Token"
            placeholder="Your Telegram bot token"
            value={config.botToken || ""}
            onChange={(e) => onChange({ botToken: e.currentTarget.value })}
          />
        </>
      )}

      {config.type === "webhook" && (
        <TextInput
          size="xs"
          label="Webhook URL"
          placeholder="https://..."
          value={config.url || ""}
          onChange={(e) => onChange({ url: e.currentTarget.value })}
        />
      )}
    </Paper>
  );
}
