import { useDisclosure } from "@mantine/hooks";
import { Drawer, Button, DrawerProps } from "@mantine/core";

export function Sidebar(props: DrawerProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Authentication">
        {props.children}
      </Drawer>

      <Button onClick={open}>Open Drawer</Button>
    </>
  );
}
