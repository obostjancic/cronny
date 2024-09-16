import { Button, Container, Table } from "@mantine/core";
import { useState } from "react";

export const ExpandableRow = ({
  details,
  children,
}: {
  details: React.ReactNode;
  children: React.ReactNode[];
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Table.Tr>
        {children}
        <Table.Td>
          <Button variant="transparent" size="xs" onClick={toggleExpand}>
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </Table.Td>
      </Table.Tr>
      {isExpanded && (
        <Table.Tr>
          <Table.Td colSpan={children.length + 1}>
            <Container>{details}</Container>
          </Table.Td>
        </Table.Tr>
      )}
    </>
  );
};
