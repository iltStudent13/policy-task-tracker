import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { Task } from "../models/Task";

process.env.JWT_SECRET = process.env.JWT_SECRET || "development-secret";

let mongoServer: MongoMemoryServer;

async function registerUser(overrides: Partial<Record<string, string>> = {}) {
  const email = overrides.email || `user.${Date.now()}${Math.random()}@example.com`;
  const password = overrides.password || "Password123!";
  const payload = {
    name: overrides.name || "Test User",
    email,
    password,
    role: overrides.role || "user",
  };

  const response = await request(app).post("/api/auth/register").send(payload);
  expect(response.status).toBe(201);

  return { payload, response };
}

async function loginUser(email: string, password: string) {
  const response = await request(app).post("/api/auth/login").send({ email, password });

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("token");
  return response.body.token;
}

describe("API endpoint scenarios", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri("policy-task-tracker-test"));
  }, 30000);

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({})]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 30000);

  it("GET returns correct data for authenticated project listing", async () => {
    const { payload } = await registerUser();
    const token = await loginUser(payload.email, payload.password);

    await Project.create({
      projectNumber: "PRJ-1001",
      name: "Alpha Project",
      status: "open",
      projectType: "core",
      owner: (await User.findOne({ email: payload.email }))!._id,
      startDate: new Date("2024-01-15"),
    });

    const response = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("projects");
    expect(response.body).toHaveProperty("total");
    expect(response.body.projects).toHaveLength(1);
    expect(response.body.projects[0].name).toBe("Alpha Project");
  });

  it("POST creates a project with valid data", async () => {
    const { payload } = await registerUser();
    const token = await loginUser(payload.email, payload.password);
    const user = await User.findOne({ email: payload.email });

    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New Project",
        description: "A policy initiative",
        status: "in-progress",
        projectType: "innovation",
        owner: user!._id.toString(),
        projectNumber: "PRJ-2001",
        startDate: "2025-01-10T00:00:00.000Z",
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("New Project");
    expect(response.body.projectType).toBe("innovation");
    expect(response.body).toHaveProperty("_id");
  });

  it("POST rejects invalid project data", async () => {
    const { payload } = await registerUser();
    const token = await loginUser(payload.email, payload.password);

    const response = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bad Project",
        status: "not-a-status",
        projectType: "core",
        startDate: "not-a-date",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("Auth endpoints work for register and login", async () => {
    const email = `auth.${Date.now()}@example.com`;
    const password = "Password123!";

    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Auth User",
      email,
      password,
      role: "admin",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user.email).toBe(email);
    expect(registerResponse.body.user.password).toBeUndefined();

    const loginResponse = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeTruthy();
    expect(loginResponse.body.user.email).toBe(email);
  });

  it("Protected endpoints require valid tokens", async () => {
    const responseWithoutToken = await request(app).get("/api/projects");
    expect(responseWithoutToken.status).toBe(401);

    const invalidTokenResponse = await request(app)
      .get("/api/projects")
      .set("Authorization", "Bearer invalid.token.value");

    expect(invalidTokenResponse.status).toBe(401);
    expect(invalidTokenResponse.body.message).toMatch(/Invalid|Unauthorized/i);
  });
});
