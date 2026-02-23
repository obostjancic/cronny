import { JSONObject, Result } from "@cronny/types";
import { ActionIcon, Button, Center, Group, Paper, Table, Text, Tooltip } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconArrowsSort, IconExternalLink } from "@tabler/icons-react";
import ReactTimeago from "react-timeago";
import { usePatchResult } from "../api/useResults";
import useOpenJSONInNewTab from "../hooks/useOpenJSONinNewTab";
import useSortableData from "../hooks/useSortableData";
import { formatDate } from "../utils/date/date";
import { formatPrice, formatNumber } from "../utils/format";

const COLUMN_LABELS: Record<string, string> = {
  url: "Link",
  area: "Area",
  day: "Day",
  category: "Category",
  title: "Title",
  createdAt: "Created",
  size: "Size",
  price: "Price",
};

function SortIndicator({ column, sortConfig }: { column: string; sortConfig: { key: string | number; direction: string } | null }) {
  if (sortConfig?.key !== column) {
    return <IconArrowsSort size={14} style={{ opacity: 0.3 }} />;
  }
  return sortConfig.direction === "ascending"
    ? <IconArrowUp size={14} />
    : <IconArrowDown size={14} />;
}

interface ResultsTableProps {
  rows: (Result & JSONObject)[];
  label?: string;
}

export function ResultsTable({ rows, label }: ResultsTableProps) {
  const { items, requestSort, sortConfig } = useSortableData(rows, {
    key: "createdAt",
    direction: "descending",
  });

  const openJSONInNewTab = useOpenJSONInNewTab();
  const patchResult = usePatchResult();

  if (!rows || rows.length === 0) {
    return (
      <Paper p="xl">
        <Center>
          <Text size="sm" c="dimmed">No results</Text>
        </Center>
      </Paper>
    );
  }

  const allColumns = ["url", "area", "day", "category", "title", "createdAt", "size", "price"];
  const columns = allColumns.filter((column) => rows.some((row) => row[column] !== undefined));

  return (
    <div>
      {label && (
        <Group gap="xs" mb="sm">
          <Text size="sm" fw={600}>{label}</Text>
          <Text size="xs" c="dimmed">({rows.length})</Text>
        </Group>
      )}
      <Paper p={0} style={{ overflow: "hidden" }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column}
                  onClick={() => requestSort(column)}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <Group gap={4} wrap="nowrap">
                    {COLUMN_LABELS[column] || column}
                    <SortIndicator column={column} sortConfig={sortConfig} />
                  </Group>
                </Table.Th>
              ))}
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((row) => (
              <Table.Tr key={row.id}>
                {columns.map((column) => {
                  if (column === "url") {
                    return (
                      <Table.Td key={column}>
                        <Tooltip label="Open listing">
                          <ActionIcon
                            component="a"
                            href={(row[column] as string) ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            variant="subtle"
                            size="sm"
                          >
                            <IconExternalLink size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    );
                  }
                  if (column === "title") {
                    const url = row["url"] as string | undefined;
                    return (
                      <Table.Td key={column}>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            <Text size="sm">{row[column]?.toString()}</Text>
                          </a>
                        ) : (
                          <Text size="sm">{row[column]?.toString()}</Text>
                        )}
                        {row["text"] && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {row["text"]?.toString()}
                          </Text>
                        )}
                      </Table.Td>
                    );
                  }
                  if (column === "createdAt") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm"><ReactTimeago date={row[column] as string} /></Text>
                      </Table.Td>
                    );
                  }
                  if (column === "day") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm">{formatDate(row[column] as string)}</Text>
                      </Table.Td>
                    );
                  }
                  if (column === "price") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm">{formatPrice(row[column] as number)}</Text>
                      </Table.Td>
                    );
                  }
                  if (column === "size") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm">{formatNumber(row[column] as number)} m²</Text>
                      </Table.Td>
                    );
                  }
                  return (
                    <Table.Td key={column} maw="300px">
                      <Text truncate="end" size="sm">{row[column]?.toString()}</Text>
                    </Table.Td>
                  );
                })}
                <Table.Td>
                  <Group gap={4}>
                    <ChangeResultStateButton onClick={patchResult.mutate} row={row} />
                    <Tooltip label="View JSON">
                      <ActionIcon variant="subtle" size="sm" onClick={() => openJSONInNewTab(row)}>
                        <Text size="xs" fw={500}>{"{}"}</Text>
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}

function ChangeResultStateButton(props: {
  onClick: (data: Partial<Result>) => void;
  row: Result;
}) {
  const label = props.row.isHidden ? "Show" : "Hide";

  return (
    <Button
      disabled={props.row.status === "expired" && !props.row.isHidden}
      variant="subtle"
      size="compact-xs"
      onClick={() => {
        props.onClick({
          id: props.row.id,
          jobId: props.row.jobId,
          isHidden: !props.row.isHidden,
        });
      }}
    >
      {label}
    </Button>
  );
}
