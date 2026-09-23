// Take the routes from app and make a server connection

import app from "./app";
import { connectDB } from "./config/db";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

async function main(): Promise<void> {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

main();
