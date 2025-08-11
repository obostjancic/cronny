import type { Result } from "@cronny/types";
import {
  useMutation,
  useSuspenseQuery,
  type MutationOptions,
  type QueryOptions,
} from "@tanstack/react-query";
import { invalidateGetJob, invalidateGetResults } from "./useJobs";
import { fetchJson } from "./utils";

const RESULTS_URL = "/api/jobs";

export function useGetResults(
  jobId: number | string,
  options?: QueryOptions<Result[], Error>
) {
  return useSuspenseQuery<Result[], Error>({
    queryKey: [RESULTS_URL, jobId, "results"],
    queryFn: async () => {
      return await fetchJson(`${RESULTS_URL}/${jobId}/results`) as Result[];
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
        `/api/results/${data.id}`,
        {
          method: "PATCH",
          data: data,
        }
      ) as Result;
    },
    onSuccess: (data: Result) => {
      if (data) {
        invalidateGetJob(data.jobId);
        invalidateGetResults(data.jobId);
      }
    },
    onSettled: (data: Result | undefined, error: Error | null, variables: Partial<Result>, context: unknown) => {
      options?.onSettled?.(data, error, variables, context);
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
      }) as Result;
    },
    onSettled: (...args) => {
      if (args[2]) {
        invalidateGetJob(args[2]);
        invalidateGetResults(args[2]);
      }
      options?.onSettled?.(...args);
    },
    ...options,
  });
}
