import type { Result } from "@cronny/types";
import {
  useMutation,
  useSuspenseQuery,
  type MutationOptions,
  type QueryOptions,
} from "@tanstack/react-query";
import { invalidateGetJob } from "./useJobs";
import { fetchJson } from "./utils";

const RESULTS_URL = "/api/jobs";

export function useGetResults(
  jobId: number | string,
  options?: QueryOptions<Result[], Error>
) {
  return useSuspenseQuery<Result[], Error>({
    queryKey: [RESULTS_URL, jobId, "results"],
    queryFn: async () => {
      return await fetchJson(`${RESULTS_URL}/${jobId}/results`);
    },
    ...options,
  });
}

export function usePatchResult(
  options?: MutationOptions<Result, Error, Partial<Result>>
) {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchJson(
        `${RESULTS_URL}/${data.jobId}/results/${data.id}`,
        {
          method: "PATCH",
          data: data,
        }
      );
    },
    onSettled: (...args) => {
      const data = args[0];
      if (data) {
        invalidateGetJob(data.jobId);
      }
      options?.onSettled?.(...args);
    },
    ...options,
  });
}

export function useDeleteResults(
  options?: MutationOptions<Result, Error, number>
) {
  return useMutation({
    mutationFn: async (jobId) => {
      return await fetchJson(`${RESULTS_URL}/${jobId}/results`, {
        method: "DELETE",
      });
    },
    onSettled: (...args) => {
      if (args[2]) {
        invalidateGetJob(args[2]);
      }
      options?.onSettled?.(...args);
    },
    ...options,
  });
}
