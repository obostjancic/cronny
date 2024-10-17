import type { Job, UnsavedJob } from "@cronny/types";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { invalidateGetJobs } from "./useGetJobs";
import { fetchJson } from "./utils";

export function usePostJob(options?: MutationOptions<Job, Error, UnsavedJob>) {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchJson(`/api/jobs`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSettled: (...args) => {
      invalidateGetJobs();
      options?.onSettled?.(...args);
    },
    ...options,
  });
}
