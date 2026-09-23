import { Router, type Request, type Response } from "express";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", async (req: Request, res: Response) => {
  const [totalTasks, tasksByStatusResults, totalProjects, recentTasks, totalUsers] =
    await Promise.all([
      Task.countDocuments(),
      Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Project.countDocuments(),
      Task.find().sort({ createdAt: -1 }).limit(5),
      User.countDocuments(),
    ]);

  const tasksByStatus = tasksByStatusResults.reduce<Record<string, number>>(
    (statusCounts, entry) => {
      if (typeof entry._id === "string") {
        statusCounts[entry._id] = entry.count;
      }

      return statusCounts;
    },
    {},
  );

  res.status(200).json({
    totalTasks,
    tasksByStatus,
    totalProjects,
    recentTasks,
    totalUsers,
  });
});
export default router;
