import {
  Router,
  type Request,
  type Response
} from "express";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", async (req: Request, res: Response) => {
  const [totalTasks, tasksByStatus, recentTasks, totalProjects, totalUsers] =
    await Promise.all([
      Task.countDocuments(),
      Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Project.countDocuments(),
      Task.find().sort({ createdAt: -1 }).limit(5),
      User.countDocuments(),
    ]);

  res.status(200).json({
    totalTasks,
    tasksByStatus,
    recentTasks,
    totalProjects,
    totalUsers,
  });
});
export default router;
