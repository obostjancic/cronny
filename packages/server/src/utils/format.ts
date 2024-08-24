export const formatJSONArray = (arr: any[]): string => {
  return JSON.stringify(arr, null, 2);
};
