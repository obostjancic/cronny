import { Run } from "@cronny/types";
import { useMutation, type QueryOptions } from "@tanstack/react-query";
import { fetchJson } from "./utils";

export function usePostRun(options?: QueryOptions<Run, Error>) {
  return useMutation({
    mutationFn: async (jobId: number) => {
      return await fetchJson(`/api/jobs/${jobId}/runs`, {
        method: "POST",
      });
    },
    ...options,
  });
}
