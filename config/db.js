import mongoose from "mongoose";
import User from "../models/User.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default demo accounts if database collection is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("User roster is empty. Seeding simulation accounts...");
      await User.create([
        {
          name: "Jane Doe",
          email: "jane.doe@cms.com",
          password: "password123",
          role: "Admin"
        },
        {
          name: "Alex Rivera",
          email: "alex.rivera@cms.com",
          password: "password123",
          role: "Editor"
        }
      ]);
      console.log("Simulation accounts seeded successfully (Admin: jane.doe@cms.com / password123).");
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
