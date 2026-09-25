import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { User } from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { generateToken } from "../utils/token.js";

const router = Router();

router.post(
  "/register",
  body("name").isString().withMessage("Name must be a string"),
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("role").isIn(["admin", "user"]).withMessage("Invalid role"),
  validate([
    body("name").isString().withMessage("Name must be a string"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role").isIn(["admin", "user"]).withMessage("Invalid role"),
  ]),
  async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ user });
  },
);

router.post(
  "/login",
  body("password").isLength({ min: 8 }),
  validate([
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ]),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const generatedToken = generateToken(user);
    res.json({
      token: generatedToken.token,
      expires: generatedToken.expiresAt,
      user,
    });
  },
);

router.get("/me", authenticate, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

router.get("/users", authenticate, async (req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.status(200).json(users);
});

export default router;
