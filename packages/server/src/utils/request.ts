import axios, { AxiosRequestConfig } from "axios";

export const sleep = (ms = 250) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface RetryOpts {
  retries?: number;
  delay?: number;
  backoff?: number;
}

export const retry = async <T>(
  fn: () => Promise<T>,
  { retries = 3, delay = 1000, backoff = 2 }: RetryOpts = {}
): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (retries === 1) {
      throw e;
    }
    await sleep(delay);
    return retry(fn, { retries: retries - 1, delay: delay * backoff, backoff });
  }
};

export async function fetchMultiplePages<T>(
  url: string,
  fetchPageFunction: (url: string, page: number) => Promise<T[]>,
  maxRows: number,
  maxPages = 10
): Promise<T[]> {
  const allResults: T[] = [];
  let page = 1;
  let results: T[] = await fetchPageFunction(url, page);
  allResults.push(...results);

  while (results.length === maxRows && page < maxPages) {
    page += 1;
    results = await fetchPageFunction(url, page);
    allResults.push(...results);
  }

  return allResults;
}
