import type { Result } from "@cronny/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { invalidateGetJob, invalidateGetResults } from "./useJobs";
import { fetchJson } from "./utils";

const RESULTS_URL = "/api/jobs";

export function useGetResults(jobId: number | string) {
  return useSuspenseQuery({
    queryKey: [RESULTS_URL, jobId, "results"],
    queryFn: async (): Promise<Result[]> => {
      return (await fetchJson(`${RESULTS_URL}/${jobId}/results`)) as Result[];
    },
  });
}

export function usePatchResult() {
  return useMutation({
    mutationFn: async (data: Partial<Result>): Promise<Result> => {
      return (await fetchJson(`/api/results/${data.id}`, {
        method: "PATCH",
        data: data,
      })) as Result;
    },
    onSuccess: (data: Result) => {
      if (data) {
        invalidateGetJob(data.jobId);
        invalidateGetResults(data.jobId);
      }
    },
  });
}

export function useDeleteResults() {
  return useMutation({
    mutationFn: async (jobId: number): Promise<void> => {
      await fetchJson(`${RESULTS_URL}/${jobId}/results`, {
        method: "DELETE",
      });
    },
    onSettled: (_data, _error, jobId) => {
      if (jobId) {
        invalidateGetJob(jobId);
        invalidateGetResults(jobId);
      }
    },
  });
}
