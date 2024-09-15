import { JobDetails } from "@cronny/types/Job";
import { useSuspenseQuery, type QueryOptions } from "@tanstack/react-query";
import { queryClient } from "../utils/queryClient";
import { fetchJson } from "./utils";

const getQueryKey = (jobId: number | string) => [`/api/jobs/${jobId}`];

export function useGetJob(
  jobId: number | string,
  options?: QueryOptions<JobDetails, Error>
) {
  const queryKey = getQueryKey(jobId);
  return useSuspenseQuery<JobDetails, Error>({
    queryKey,
    queryFn: async () => {
      return await fetchJson(queryKey[0]);
    },
    ...options,
  });
}

export async function invalidateGetJob(jobId: number | string) {
  await queryClient.invalidateQueries({ queryKey: getQueryKey(jobId) });
}
