// Generate initial seed data for the database.  3 Users: admin, user1, user2, 10 tasks and 4 projects all with different project types

import mongoose from "mongoose";
import { User } from "./models/User";
import { Task } from "./models/Task";
import { Project } from "./models/Project";

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/policy-tracker",
  );

  // Clear existing data
  await User.deleteMany({});
  await Task.deleteMany({});
  await Project.deleteMany({});

  // Create users
  const admin = new User({
    name: "Admin",
    email: "admin@example.com",
    password: "password",
    role: "admin",
  });
  const user1 = new User({
    name: "User1",
    email: "user1@example.com",
    password: "password",
    role: "user",
  });
  const user2 = new User({
    name: "User2",
    email: "user2@example.com",
    password: "password",
    role: "user",
  });
  await admin.save();
  await user1.save();
  await user2.save();

  // Create projects
  const projectTypes = ["core", "innovation", "research", "collaboration"];
  const projects = [];
  for (let i = 0; i < 4; i++) {
    const project = new Project({
      name: `Project${i + 1}`,
      projectNumber: `PRJ-${i + 1}`,
      projectType: projectTypes[i],
      owner: admin._id,
      startDate: new Date(Date.now() - i * 86400000),
    });
    await project.save();
    projects.push(project);
  }

  // Create tasks
  for (let i = 0; i < 10; i++) {
    const project = projects[i % projects.length];
    const task = new Task({
      taskNumber: `TSK-${i + 1}`,
      title: `Task${i + 1}`,
      description: `Description for Task${i + 1}`,
      status: ["open", "pending", "in-progress", "completed"][i % 4],
      assignedTo: i % 2 === 0 ? user1._id : user2._id,
      project: project!._id,
    });
    await task.save();
  }

  console.log("Database seeded successfully");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  mongoose.disconnect();
});
