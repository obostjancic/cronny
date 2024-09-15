import { JSONObject } from "@cronny/types";
import { CodeHighlight } from "@mantine/code-highlight";
import { Flex, Table } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import ReactTimeago from "react-timeago";
import useSortableData from "../hooks/useSortableData";
import { formatJSON } from "../utils/json";
import { ExpandableRow } from "./ExpandableRow";

const indicator = (direction?: string) => {
  if (!direction) {
    return "";
  }

  return direction === "ascending" ? "▲" : "▼";
};

export function ResultsTable({ rows }: { rows: JSONObject[] }) {
  const { items, requestSort, sortConfig } = useSortableData(rows, {
    key: "title",
    direction: "ascending",
  });

  if (!rows || rows.length === 0) {
    return <div>No results</div>;
  }

  const firstRow = rows[0];

  const allColumns = ["title", "createdAt", "size", "price", "url"];

  const columns = allColumns.filter((column) => firstRow[column] !== undefined);
  return (
    <Flex gap="md" pt="xs">
      <Table stickyHeader striped highlightOnHover withTableBorder>
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
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((row) => (
            <ExpandableRow
              key={row.id as string}
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
                  <Table.Td key={column}>{row[column]?.toString()}</Table.Td>
                );
              })}
            </ExpandableRow>
          ))}
        </Table.Tbody>
      </Table>
    </Flex>
  );
}
