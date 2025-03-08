export interface Client {
  id: number;
  name: string;
  apiKey: string;
  allowedJobs?: number[];
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}
