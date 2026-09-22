import { Router, type Request, type Response } from "express";
import { body, param, query } from "express-validator";
import { Project } from "../models/Project";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate([
    query("status")
      .optional()
      .isIn(["open", "in-progress", "completed", "pending"])
      .withMessage("Invalid status"),
    query("projectType")
      .optional()
      .isIn(["core", "innovation", "research", "collaboration"])
      .withMessage("Invalid project type"),
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
    const { status, projectType, search } = req.query as Record<
      string,
      string | undefined
    >;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (projectType) filter.projectType = projectType;
    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [{ name: searchRegex }, { projectNumber: searchRegex }];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .skip((page - 1) * limit)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    res.status(200).json({ projects, total, page, limit });
  },
);

router.get(
  "/:id",
  validate([param("id").isMongoId().withMessage("Invalid project ID")]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  },
);

router.post(
  "/",
  validate([
    body("name").isString().withMessage("Name must be a string"),
    body("status")
      .isIn(["open", "in-progress", "completed", "pending"])
      .withMessage("Invalid status"),
    body("projectType")
      .isIn(["core", "innovation", "research", "collaboration"])
      .withMessage("Invalid project type"),
    body("owner").isMongoId().withMessage("Invalid owner ID"),
    body("startDate").isISO8601().withMessage("Invalid start date"),
  ]),
  async (req: Request, res: Response) => {
    const { name, description, status, projectType, owner, startDate } =
      req.body;
    const project = new Project({
      name,
      description,
      status,
      projectType,
      owner: req.user!._id,
      startDate: new Date(startDate),
    });
    await project.save();
    res.status(201).json(project);
  },
);

router.put(
  "/:id",
  validate([
    param("id").isMongoId().withMessage("Invalid project ID"),
    body("name").isString().withMessage("Name must be a string"),
    body("status")
      .isIn(["open", "in-progress", "completed", "pending"])
      .withMessage("Invalid status"),
    body("projectType")
      .isIn(["core", "innovation", "research", "collaboration"])
      .withMessage("Invalid project type"),
    body("owner").isMongoId().withMessage("Invalid owner ID"),
    body("startDate").isISO8601().withMessage("Invalid start date"),
  ]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, status, projectType, owner, startDate } =
      req.body;
    const project = await Project.findByIdAndUpdate(
      id,
      {
        name,
        description,
        status,
        projectType,
        owner,
        startDate: new Date(startDate),
      },
      { new: true },
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  },
);

router.delete(
  "/:id",
  validate([param("id").isMongoId().withMessage("Invalid project ID")]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  },
);

export default router;
