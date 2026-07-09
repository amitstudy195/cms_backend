import mongoose from "mongoose";
import User from "../models/User.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default demo accounts individually if they are missing
    const janeExists = await User.findOne({ email: "jane.doe@cms.com" });
    if (!janeExists) {
      console.log("Jane Doe demo profile missing. Seeding Admin...");
      await User.create({
        name: "Jane Doe",
        email: "jane.doe@cms.com",
        password: "password123",
        role: "Admin"
      });
      console.log("Jane Doe admin account seeded (password: password123).");
    }

    const alexExists = await User.findOne({ email: "alex.rivera@cms.com" });
    if (!alexExists) {
      console.log("Alex Rivera demo profile missing. Seeding Editor...");
      await User.create({
        name: "Alex Rivera",
        email: "alex.rivera@cms.com",
        password: "password123",
        role: "Editor"
      });
      console.log("Alex Rivera editor account seeded (password: password123).");
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
