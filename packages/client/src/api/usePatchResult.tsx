import type { Result } from "@cronny/types";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { fetchJson } from "./utils";

export function usePatchResult(
  options?: MutationOptions<Result, Error, Partial<Result>>
) {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchJson(`/api/results/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    ...options,
  });
}
