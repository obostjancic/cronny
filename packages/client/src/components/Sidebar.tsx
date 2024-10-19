import { Button, Drawer, DrawerProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

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
