import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const conn = process.env.MONGO_URI || "";

  if (!conn) {
    throw new Error("MONGO_URI is not defined");
  }
  await mongoose.connect(conn);
}
