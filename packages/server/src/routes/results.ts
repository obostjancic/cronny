import { Request, Response } from "express";
import { updateJob } from "../db/job.js";
import { invalidateSchedule } from "../schedule.js";
import AsyncRouter from "./router.js";
import { updateResult } from "../db/result.js";

const router = AsyncRouter();

router.patch("/:id", async (req: Request, res: Response) => {
  const { id, ...patch } = req.body;
  const result = await updateResult(+req.params.id ?? id, patch);

  return res.json(result);
});

export default router;
