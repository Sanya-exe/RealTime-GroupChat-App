import mongoose from "mongoose";
import dns from "node:dns";

// Force Google DNS (bypasses Windows DNS completely)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
  try {
    console.log("MONGO_URL:", process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
};


