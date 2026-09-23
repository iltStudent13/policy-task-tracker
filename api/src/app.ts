import express, { type Request, type Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoute from "./routes/auth";
import projectsRoute from "./routes/projects";
import tasksRoute from "./routes/tasks";
import dashboardRoute from "./routes/dashboard";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const connected = dbState === 1;

  // Log the database connection state for debugging purposes
  console.log(`Database connection state: ${dbState}`);
  res.status(connected ? 200 : 500).json({
    status: connected ? "ok" : "error",
    dbState: dbState ?? "unknown",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/projects", projectsRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/dashboard", dashboardRoute);

app.use(errorHandler);

export default app;
