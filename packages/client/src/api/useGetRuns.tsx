import { useSuspenseQuery, type QueryOptions } from "@tanstack/react-query";
import { fetchJson } from "./utils";
import { queryClient } from "../utils/queryClient";
import { Run } from "@cronny/types/Job";

const getQueryKey = (jobId: string) => [`/api/jobs/${jobId}/runs`];
export function useGetRuns(
  jobId: string,
  options?: QueryOptions<Run[], Error>
) {
  const queryKey = getQueryKey(jobId);
  return useSuspenseQuery<Run[], Error>({
    queryKey,
    queryFn: async () => {
      return await fetchJson(queryKey[0]);
    },
    ...options,
  });
}

export async function invalidateGetRuns(jobId: string) {
  await queryClient.invalidateQueries({ queryKey: getQueryKey(jobId) });
}
