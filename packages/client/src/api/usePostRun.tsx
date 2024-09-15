import type { Run } from "@cronny/types";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { fetchJson } from "./utils";
import { invalidateGetJob } from "./useGetJob";

export function usePostRun(options?: MutationOptions<Run, Error, number>) {
  return useMutation({
    mutationFn: async (jobId) => {
      return await fetchJson(`/api/jobs/${jobId}/runs`, {
        method: "POST",
      });
    },
    onSettled: (...args) => {
      console.log(args);
      const data = args[0];
      if (data) {
        invalidateGetJob(data.jobId);
      }
      options?.onSettled?.(...args);
    },
    ...options,
  });
}
