import { Button, Collapse, Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export function Collapsible({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure(false);

  if (!children) {
    return null;
  }
  return (
    <Container fluid p={0} mt="sm">
      <Button variant="transparent" size="sm" onClick={toggle}>
        {opened ? "Hide" : "Show"} {title}
      </Button>

      <Collapse in={opened}>{children}</Collapse>
    </Container>
  );
}
