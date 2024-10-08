import type { Job } from "@cronny/types";
import { MutationOptions, useMutation } from "@tanstack/react-query";
import { invalidateGetJob } from "./useGetJob";
import { fetchJson } from "./utils";

export function usePatchJob(
  options?: MutationOptions<Job, Error, Partial<Job>>
) {
  return useMutation({
    mutationFn: async (data) => {
      return await fetchJson(`/api/jobs/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSettled: (...args) => {
      const data = args[0];
      if (data) {
        invalidateGetJob(data.id);
      }
      options?.onSettled?.(...args);
    },
    ...options,
  });
}
