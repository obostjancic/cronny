import { Table as MantineTable, TableProps } from "@mantine/core";

export const Table = (props: TableProps) => (
  <MantineTable
    stickyHeader
    striped
    highlightOnHover
    withTableBorder
    {...props}
  />
);
