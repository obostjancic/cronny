import { useSuspenseQuery, type QueryOptions } from "@tanstack/react-query";
import { fetchJson } from "./utils";
import { queryClient } from "../utils/queryClient";
import { JobConfig } from "@cronny/types/Job";

// eslint-disable-next-line react-refresh/only-export-components
const ENDPOINT = "/api/jobs";

export function useGetJobs(options?: QueryOptions<JobConfig[], Error>) {
  return useSuspenseQuery<JobConfig[], Error>({
    queryKey: [ENDPOINT],
    queryFn: async () => {
      return await fetchJson(ENDPOINT);
    },
    ...options,
  });
}

export async function invalidateGetJobs() {
  await queryClient.invalidateQueries({ queryKey: [ENDPOINT] });
}
