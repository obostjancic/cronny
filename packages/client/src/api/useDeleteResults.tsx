import type { Run } from "@cronny/types";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { invalidateGetJob } from "./useGetJob";
import { fetchJson } from "./utils";

export function useDeleteResults(
  options?: MutationOptions<Run, Error, number>
) {
  return useMutation({
    mutationFn: async (jobId) => {
      return await fetchJson(`/api/jobs/${jobId}/runs`, {
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
