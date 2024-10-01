import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient";

import "./App.css";

const router = createRouter({ routeTree, defaultPreload: "intent" });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
