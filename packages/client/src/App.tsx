import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "./App.css";
import { withErrorBoundary } from "./components/ErrorBoundary";
import { routeTree } from "./routeTree.gen";
import { initializeAuth, isInitialized } from "./utils/auth";
import { queryClient } from "./utils/queryClient";

import "@mantine/code-highlight/styles.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const router = createRouter({ routeTree, defaultPreload: "intent" });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const theme = createTheme({
  /** Put your mantine theme override here */
  fontFamily: "monospace",
  defaultRadius: "md",
  // colors: "dark",
});

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth().finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isInitialized()) {
    return <div>Please log in</div>;
  }

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default withErrorBoundary(AppContent);
