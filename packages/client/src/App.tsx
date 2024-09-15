import { createTheme, MantineProvider } from "@mantine/core";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";
import { queryClient } from "./utils/queryClient";

import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/notifications/styles.css";

import "./App.css";

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

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
