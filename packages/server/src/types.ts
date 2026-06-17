import type { Client } from "@cronny/types";

declare module "hono" {
  interface ContextVariableMap {
    client: Client;
  }
}
