import { JSONObject, Result } from "@cronny/types";
import { CodeHighlight } from "@mantine/code-highlight";
import { Container, Flex, Table, Text, Button } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import ReactTimeago from "react-timeago";
import useSortableData from "../hooks/useSortableData";
import { formatJSON } from "../utils/json";
import { ExpandableRow } from "./ExpandableRow";
import { usePatchResult } from "../api/usePatchResult";
import { useParams } from "@tanstack/react-router";
import { invalidateGetJob } from "../api/useGetJob";

const indicator = (direction?: string) => {
  if (!direction) {
    return "";
  }

  return direction === "ascending" ? "▲" : "▼";
};

export function ResultsTable({ rows }: { rows: (Result & JSONObject)[] }) {
  const { items, requestSort, sortConfig } = useSortableData(rows, {
    key: "createdAt",
    direction: "descending",
  });

  const patchResult = usePatchResult();

  if (!rows || rows.length === 0) {
    return <Flex p="md">No results</Flex>;
  }

  const firstRow = rows[0];

  const allColumns = ["url", "title", "createdAt", "size", "price"];

  const columns = allColumns.filter((column) => firstRow[column] !== undefined);
  return (
    <Container p={0} pt="xs" fluid>
      <Table striped stickyHeader highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column} onClick={() => requestSort(column)}>
                {column}
                &nbsp;
                {indicator(
                  sortConfig?.key === column ? sortConfig.direction : undefined
                )}
              </Table.Th>
            ))}
            <Table.Th>actions</Table.Th>
            <Table.Th>details</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((row) => (
            <ExpandableRow
              key={row.id}
              details={
                <CodeHighlight
                  withCopyButton
                  language="json"
                  code={formatJSON(row)}
                  contentEditable={false}
                />
              }
            >
              {columns.map((column) => {
                if (column === "url") {
                  return (
                    <Table.Td key={column} pt="sm">
                      <a
                        href={(row[column] as string) ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <IconExternalLink />
                      </a>
                    </Table.Td>
                  );
                }
                if (column === "createdAt") {
                  return (
                    <Table.Td key={column}>
                      <ReactTimeago date={row[column] as string} />
                    </Table.Td>
                  );
                }

                return (
                  <Table.Td key={column} maw="300px">
                    <Text truncate="end" size="sm">
                      {row[column]?.toString()}
                    </Text>
                  </Table.Td>
                );
              })}
              <Table.Td>
                <ChangeResultStateButton
                  onClick={patchResult.mutate}
                  row={row}
                />
              </Table.Td>
            </ExpandableRow>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
function ChangeResultStateButton(props: {
  onClick: (data: Partial<Result>) => void;
  row: Result;
}) {
  const { jobId } = useParams({ from: "/jobs/$jobId/" });
  const label = props.row.isHidden ? "Show" : "Hide";

  return (
    <Button
      disabled={props.row.status === "expired" && !props.row.isHidden}
      variant="transparent"
      size="xs"
      onClick={async () => {
        await props.onClick({
          id: props.row.id,
          isHidden: !props.row.isHidden,
        });
        invalidateGetJob(jobId);
      }}
    >
      {label}
    </Button>
  );
}
