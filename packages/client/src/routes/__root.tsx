import { AppShell, Flex, Group, Loader, Text, UnstyledButton } from "@mantine/core";
import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

function NavLink({ to, label }: { to: string; label: string }) {
  const router = useRouterState();
  const isActive = router.location.pathname === to ||
    (to !== "/" && router.location.pathname.startsWith(to));

  return (
    <UnstyledButton
      component={Link}
      to={to}
      py="xs"
      px="sm"
      style={{
        borderBottom: isActive ? "2px solid var(--mantine-color-teal-6)" : "2px solid transparent",
        color: isActive ? "var(--mantine-color-teal-4)" : "var(--mantine-color-dimmed)",
        fontWeight: isActive ? 600 : 400,
        fontSize: "var(--mantine-font-size-sm)",
        transition: "all 150ms ease",
      }}
    >
      {label}
    </UnstyledButton>
  );
}

function RootLayout() {
  return (
    <AppShell header={{ height: 48 }} padding={{ base: "md", sm: "xl" }}>
      <AppShell.Header
        style={{
          backgroundColor: "var(--mantine-color-dark-8)",
          borderBottom: "1px solid var(--mantine-color-dark-4)",
        }}
      >
        <Flex h="100%" align="center" px={{ base: "md", sm: "xl" }} gap="lg">
          <Text fw={700} size="sm" c="teal.4" mr="md">
            CRONNY
          </Text>
          <Group gap={0}>
            <NavLink to="/" label="Jobs" />
            <NavLink to="/clients" label="Clients" />
          </Group>
        </Flex>
      </AppShell.Header>

      <AppShell.Main>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Suspense fallback={<Loader size="sm" />}>
            <Outlet />
          </Suspense>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
