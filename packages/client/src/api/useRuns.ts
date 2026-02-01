import type { Run } from "@cronny/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { invalidateGetJob, invalidateGetResults } from "./useJobs";
import { fetchJson } from "./utils";

const RUNS_URL = "/api/jobs";

export function useGetRun(jobId: number | string, runId: number | string) {
  return useSuspenseQuery({
    queryKey: [RUNS_URL, jobId, "runs", runId],
    queryFn: async (): Promise<Run> => {
      return (await fetchJson(`${RUNS_URL}/${jobId}/runs/${runId}`)) as Run;
    },
  });
}

export function usePostRun() {
  return useMutation({
    mutationFn: async (jobId: number): Promise<Run> => {
      return (await fetchJson(`${RUNS_URL}/${jobId}/runs`, {
        method: "POST",
      })) as Run;
    },
    onSettled: (data) => {
      if (data) {
        invalidateGetJob(data.jobId);
        invalidateGetResults(data.jobId);
      }
    },
  });
}
