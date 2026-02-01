import type { Client } from "@cronny/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
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

export function useGetClients() {
  return useSuspenseQuery({
    queryKey: [CLIENTS_URL],
    queryFn: async (): Promise<Client[]> => {
      return (await fetchJson(CLIENTS_URL)) as Client[];
    },
  });
}

export function useGetClient(id: number) {
  return useSuspenseQuery({
    queryKey: [CLIENTS_URL, id],
    queryFn: async (): Promise<Client> => {
      return (await fetchJson(`${CLIENTS_URL}/${id}`)) as Client;
    },
  });
}

export function usePostClient() {
  return useMutation({
    mutationFn: async (data: CreateClientInput): Promise<Client> => {
      return (await fetchJson(CLIENTS_URL, {
        method: "POST",
        data: data,
      })) as Client;
    },
    onSettled: () => {
      invalidateGetClients();
    },
  });
}

export function usePatchClient(id: number) {
  return useMutation({
    mutationFn: async (data: UpdateClientInput): Promise<Client> => {
      return (await fetchJson(`${CLIENTS_URL}/${id}`, {
        method: "PATCH",
        data: data,
      })) as Client;
    },
    onSettled: (data) => {
      if (data) {
        invalidateGetClient(data.id);
        invalidateGetClients();
      }
    },
  });
}
