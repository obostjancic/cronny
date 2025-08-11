import type { Client } from "@cronny/types";
import {
  useMutation,
  useSuspenseQuery,
  type MutationOptions,
  type QueryOptions,
} from "@tanstack/react-query";
import { queryClient } from "../utils/queryClient";
import { fetchJson } from "./utils";

interface CreateClientInput {
  name: string;
  allowedJobs: number[];
}

interface UpdateClientInput extends Partial<CreateClientInput> {
  enabled?: boolean;
}

const CLIENTS_URL = "/api/clients";

export function invalidateGetClients() {
  queryClient.invalidateQueries({ queryKey: [CLIENTS_URL] });
}

export function invalidateGetClient(id: number) {
  queryClient.invalidateQueries({ queryKey: [CLIENTS_URL, id] });
}

export function useGetClients(options?: QueryOptions<Client[], Error>) {
  return useSuspenseQuery<Client[], Error>({
    queryKey: [CLIENTS_URL],
    queryFn: async () => {
      return await fetchJson(CLIENTS_URL) as Client[];
    },
    ...options,
  });
}

export function useGetClient(
  id: number,
  options?: QueryOptions<Client, Error>
) {
  return useSuspenseQuery<Client, Error>({
    queryKey: [CLIENTS_URL, id],
    queryFn: async () => {
      return await fetchJson(`${CLIENTS_URL}/${id}`) as Client;
    },
    ...options,
  });
}

export function usePostClient(
  options?: MutationOptions<Client, Error, CreateClientInput>
) {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchJson(CLIENTS_URL, {
        method: "POST",
        data: data,
      }) as Client;
    },
    onSettled: (...args) => {
      invalidateGetClients();
      options?.onSettled?.(...args);
    },
    ...options,
  });
}

export function usePatchClient(
  id: number,
  options?: MutationOptions<Client, Error, UpdateClientInput>
) {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchJson(`${CLIENTS_URL}/${id}`, {
        method: "PATCH",
        data: data,
      }) as Client;
    },
    onSettled: (...args) => {
      const data = args[0];
      if (data) {
        invalidateGetClient(data.id);
        invalidateGetClients();
      }
      options?.onSettled?.(...args);
    },
    ...options,
  });
}
