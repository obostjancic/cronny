import { join } from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { FinishedRun, Job } from "./types";

const FILE_PATH = join(__dirname, "..", ".db.json");

const initJSONDatabase = <T>(initialData: T) => {
  const read = async () => {
    const data = await fs.promises.readFile(FILE_PATH, { encoding: "utf-8" });
    return JSON.parse(data) as unknown as T;
  };

  const write = async (data: T) => {
    await fs.promises.writeFile(FILE_PATH, JSON.stringify(data, null, 2), {
      encoding: "utf-8",
    });
  };

  if (!fs.existsSync(FILE_PATH)) {
    write(initialData);
  }

  return {
    read,
    write,
  };
};

type Schema = {
  jobs: Record<string, Job>;
};

const db = initJSONDatabase<Schema>({ jobs: {} });

export async function getJobs(): Promise<Job[]> {
  const data = await db.read();
  return Object.values(data.jobs);
}

export async function getJob(id: string): Promise<Job> {
  const data = await db.read();
  return data.jobs[id];
}

export async function saveJob(jobId: string, jobName?: string): Promise<Job> {
  const data = await db.read();

  const jobToSave = {
    id: jobId,
    name: jobName,
    runs: [],
  };

  data.jobs[jobId] = jobToSave;
  await db.write(data);

  return jobToSave;
}

export async function saveJobRun(
  jobName: string,
  run: Omit<FinishedRun, "id">
): Promise<FinishedRun> {
  const data = await db.read();
  const runToSave = { id: randomUUID(), ...run };

  data.jobs[jobName].runs.unshift(runToSave);

  await db.write(data);
  return runToSave;
}

export async function getLastRun(
  jobName: string
): Promise<FinishedRun | undefined> {
  const data = await db.read();
  return data.jobs[jobName].runs[0];
}
