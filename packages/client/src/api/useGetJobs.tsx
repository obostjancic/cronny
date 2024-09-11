import { Job } from "@cronny/types/Job";
import { useSuspenseQuery, type QueryOptions } from "@tanstack/react-query";
import { queryClient } from "../utils/queryClient";
import { fetchJson } from "./utils";

const getQueryKey = () => [`/api/jobs`];

export function useGetJobs(options?: QueryOptions<Job[], Error>) {
  return useSuspenseQuery<Job[], Error>({
    queryKey: getQueryKey(),
    queryFn: async () => {
      return await fetchJson(getQueryKey()[0]);
    },
    ...options,
  });
}

export async function invalidateGetJobs() {
  await queryClient.invalidateQueries({ queryKey: getQueryKey() });
}
