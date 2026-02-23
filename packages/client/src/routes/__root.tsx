import { Container, Flex, Loader } from "@mantine/core";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <Container fluid p="md">
      <Flex component="nav" gap="md" mb="md" align="center">
        <Link to="/" style={{ fontWeight: 600 }}>
          Jobs
        </Link>
        <Link to="/clients" style={{ fontWeight: 600 }}>
          Clients
        </Link>
      </Flex>
      <Suspense fallback={<Loader size="sm" />}>
        <Outlet />
      </Suspense>
    </Container>
  );
}
