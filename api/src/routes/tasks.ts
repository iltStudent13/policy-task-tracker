import { Router, type Request, type Response } from "express";
import { body, param, query } from "express-validator";
import type { QueryFilter } from "mongoose";
import { Task, type ITask } from "../models/Task.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate([
    query("status")
      .optional()
      .isIn(["open", "pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    query("projectNumber")
      .optional()
      .isMongoId()
      .withMessage("Invalid project Number"),
    query("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignedTo ID"),
    query("search")
      .optional()
      .isString()
      .withMessage("Search must be a string"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be an integer greater than 0"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be an integer between 1 and 100"),
  ]),
  async (req: Request, res: Response) => {
    const { status, assignedTo, search, projectNumber } = req.query as Record<
      string,
      string | undefined
    >;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    const filter: QueryFilter<ITask> = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (projectNumber) filter.projectNumber = projectNumber;
    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { taskNumber: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .skip((page - 1) * limit)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({ tasks, total, page, limit });
  },
);

router.get(
  "/:id",
  validate([param("id").isMongoId().withMessage("Invalid task ID")]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  },
);

router.post(
  "/",
  validate([
    body("title").isString().withMessage("Title must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("status")
      .isIn(["open", "pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignedTo ID"),
    body("project").optional().isMongoId().withMessage("Invalid project ID"),
    body("projectNumber")
      .optional()
      .isMongoId()
      .withMessage("Invalid project Number"),
  ]),
  async (req: Request, res: Response) => {
    const { title, description, status, assignedTo } = req.body;
    const projectId = req.body.project ?? req.body.projectNumber;
    const task = new Task({
      title,
      description,
      status,
      assignedTo,
      project: projectId,
    });
    await task.save();
    res.status(201).json(task);
  },
);

router.put(
  "/:id",
  validate([
    param("id").isMongoId().withMessage("Invalid task ID"),
    body("title").optional().isString().withMessage("Title must be a string"),
    body("description").isString().withMessage("Description must be a string"),
    body("status")
      .isIn(["open", "pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignedTo ID"),
    body("project").optional().isMongoId().withMessage("Invalid project ID"),
    body("projectNumber")
      .optional()
      .isMongoId()
      .withMessage("Invalid project Number"),
  ]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, status, assignedTo } = req.body;
    const projectId = req.body.project ?? req.body.projectNumber;
    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, status, assignedTo, project: projectId },
      { new: true },
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  },
);

router.patch(
  "/:id",
  validate([
    param("id").isMongoId().withMessage("Invalid task ID"),
    body("title").optional().isString().withMessage("Title must be a string"),
    body("description").isString().withMessage("Description must be a string"),
    body("status")
      .isIn(["open", "pending", "in-progress", "completed"])
      .withMessage("Invalid status"),
    body("assignedTo")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignedTo ID"),
    body("project").optional().isMongoId().withMessage("Invalid project ID"),
    body("projectNumber")
      .optional()
      .isMongoId()
      .withMessage("Invalid project Number"),
  ]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, status, assignedTo } = req.body;
    const projectId = req.body.project ?? req.body.projectNumber;
    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, status, assignedTo, project: projectId },
      { new: true },
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  },
);

router.delete(
  "/:id",
  validate([param("id").isMongoId().withMessage("Invalid task ID")]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  },
);

export default router;
