import type { Client } from "@cronny/types";

type Variables = {
  client: Client;
};

declare module "hono" {
  interface ContextVariableMap extends Variables {}
}
