import type { Run } from "@cronny/types";
import {
  useMutation,
  useSuspenseQuery,
  type MutationOptions,
  type QueryOptions,
} from "@tanstack/react-query";
import { invalidateGetJob } from "./useJobs";
import { fetchJson } from "./utils";

const RUNS_URL = "/api/jobs";

export function useGetRun(
  jobId: number | string,
  runId: number | string,
  options?: QueryOptions<Run, Error>
) {
  return useSuspenseQuery<Run, Error>({
    queryKey: [RUNS_URL, jobId, "runs", runId],
    queryFn: async () => {
      return await fetchJson(`${RUNS_URL}/${jobId}/runs/${runId}`);
    },
    ...options,
  });
}

export function usePostRun(options?: MutationOptions<Run, Error, number>) {
  return useMutation({
    mutationFn: async (jobId) => {
      return await fetchJson(`${RUNS_URL}/${jobId}/runs`, {
        method: "POST",
      });
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
