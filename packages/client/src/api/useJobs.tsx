import type { Job, JobDetails, UnsavedJob } from "@cronny/types";
import {
  useMutation,
  useSuspenseQuery,
  type MutationOptions,
  type QueryOptions,
} from "@tanstack/react-query";
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

export function useGetJobs(options?: QueryOptions<Job[], Error>) {
  return useSuspenseQuery<Job[], Error>({
    queryKey: [JOBS_URL],
    queryFn: async () => {
      return await fetchJson(JOBS_URL) as Job[];
    },
    ...options,
  });
}

export function useGetJob(
  jobId: number | string,
  options?: QueryOptions<JobDetails, Error>
) {
  return useSuspenseQuery<JobDetails, Error>({
    queryKey: [JOBS_URL, jobId],
    queryFn: async () => {
      return await fetchJson(`${JOBS_URL}/${jobId}`) as JobDetails;
    },
    ...options,
  });
}

export function usePostJob(options?: MutationOptions<Job, Error, UnsavedJob>) {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchJson(JOBS_URL, {
        method: "POST",
        data: data,
      }) as Job;
    },
    onSettled: (...args) => {
      invalidateGetJobs();
      options?.onSettled?.(...args);
    },
    ...options,
  });
}

export function usePatchJob(
  jobId: number | string,
  options?: MutationOptions<Job, Error, Partial<Job>>
) {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchJson(`${JOBS_URL}/${jobId}`, {
        method: "PATCH",
        data: data,
      }) as Job;
    },
    onSettled: (...args) => {
      const data = args[0];
      if (data) {
        invalidateGetJob(data.id);
        invalidateGetJobs();
        invalidateGetResults(data.id);
      }
      options?.onSettled?.(...args);
    },
    ...options,
  });
}
