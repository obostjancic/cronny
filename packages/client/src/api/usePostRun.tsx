import type { Run } from "@cronny/types";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { invalidateGetJob } from "./useGetJob";
import { fetchJson } from "./utils";

export function usePostRun(options?: MutationOptions<Run, Error, number>) {
  return useMutation({
    mutationFn: async (jobId) => {
      return await fetchJson(`/api/jobs/${jobId}/runs`, {
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
