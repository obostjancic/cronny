import { Run } from "@cronny/types";
import { useSuspenseQuery, type QueryOptions } from "@tanstack/react-query";
import { queryClient } from "../utils/queryClient";
import { fetchJson } from "./utils";

const getQueryKey = (jobId: number | string, runId: number | string) => [
  `/api/jobs/${jobId}/runs/${runId}`,
];

export function useGetRun(
  jobId: number | string,
  runId: number | string,
  options?: QueryOptions<Run, Error>
) {
  const queryKey = getQueryKey(jobId, runId);

  return useSuspenseQuery<Run, Error>({
    queryKey: queryKey,
    queryFn: async () => {
      return await fetchJson(queryKey[0]);
    },
    ...options,
  });
}

export async function invalidateGetRun(jobId: number, runId: number) {
  await queryClient.invalidateQueries({ queryKey: getQueryKey(jobId, runId) });
}
