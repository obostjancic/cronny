import type { Job, JobDetails, UnsavedJob } from "@cronny/types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { queryClient } from "../utils/queryClient";
import { fetchJson } from "./utils";

const JOBS_URL = "/api/jobs";
const RESULTS_URL = "/api/jobs";

export function invalidateGetResults(jobId: number | string) {
  queryClient.invalidateQueries({ queryKey: [RESULTS_URL, jobId, "results"] });
}

export function invalidateGetJobs() {
  queryClient.invalidateQueries({ queryKey: [JOBS_URL] });
}

export function invalidateGetJob(jobId: number | string) {
  queryClient.invalidateQueries({ queryKey: [JOBS_URL, String(jobId)] });
}

export function useGetJobs() {
  return useSuspenseQuery({
    queryKey: [JOBS_URL],
    queryFn: async (): Promise<Job[]> => {
      return (await fetchJson(JOBS_URL)) as Job[];
    },
  });
}

export function useGetJob(jobId: number | string) {
  return useSuspenseQuery({
    queryKey: [JOBS_URL, jobId],
    queryFn: async (): Promise<JobDetails> => {
      return (await fetchJson(`${JOBS_URL}/${jobId}`)) as JobDetails;
    },
  });
}

export function usePostJob() {
  return useMutation({
    mutationFn: async (data: UnsavedJob): Promise<Job> => {
      return (await fetchJson(JOBS_URL, {
        method: "POST",
        data: data,
      })) as Job;
    },
    onSettled: () => {
      invalidateGetJobs();
    },
  });
}

export function usePatchJob(jobId: number | string) {
  return useMutation({
    mutationFn: async (data: Partial<Job>): Promise<Job> => {
      return (await fetchJson(`${JOBS_URL}/${jobId}`, {
        method: "PATCH",
        data: data,
      })) as Job;
    },
    onSettled: (data) => {
      if (data) {
        invalidateGetJob(data.id);
        invalidateGetJobs();
        invalidateGetResults(data.id);
      }
    },
  });
}
