import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const conn = process.env.MONGO_URI || "";

  if (!conn) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(conn);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}
