import { JSONObject } from "@cronny/types";
import { CodeHighlight } from "@mantine/code-highlight";
import { Flex, Table } from "@mantine/core";
import { ExpandableRow } from "./ExpandableRow";
import { formatJSON } from "../utils/json";

export function ResultsTable({ rows }: { rows: JSONObject[] }) {
  if (!rows || rows.length === 0) {
    return <div>No results</div>;
  }

  const firstRow = rows[0];

  const allColumns = ["title", "size", "price", "url"];

  const columns = allColumns.filter((column) => firstRow[column] !== undefined);

  return (
    <Flex gap="md" pt="xs">
      <Table stickyHeader striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column}>{column}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows
            .sort((a, b) => (a["title"]! > b["title"]! ? 1 : -1))
            .map((row) => (
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
                      <Table.Td key={column}>
                        <a
                          href={(row[column] as string) ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Link
                        </a>
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
