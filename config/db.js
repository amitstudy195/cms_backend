import mongoose from "mongoose";
import User from "../models/User.js";
import Page from "../models/Page.js";
import Media from "../models/Media.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 1. Seed default demo accounts individually if they are missing
    let jane = await User.findOne({ email: "jane.doe@cms.com" });
    if (!jane) {
      console.log("Jane Doe demo profile missing. Seeding Admin...");
      jane = await User.create({
        name: "Jane Doe",
        email: "jane.doe@cms.com",
        password: "password123",
        role: "Admin"
      });
      console.log("Jane Doe admin account seeded (password: password123).");
    }

    let alex = await User.findOne({ email: "alex.rivera@cms.com" });
    if (!alex) {
      console.log("Alex Rivera demo profile missing. Seeding Editor...");
      alex = await User.create({
        name: "Alex Rivera",
        email: "alex.rivera@cms.com",
        password: "password123",
        role: "Editor"
      });
      console.log("Alex Rivera editor account seeded (password: password123).");
    }

    const janeId = jane._id;

    // 2. Seed starter content pages if the page collection is empty
    const pageCount = await Page.countDocuments();
    if (pageCount === 0) {
      console.log("Page catalog is empty. Seeding starter pages...");
      await Page.create([
        {
          title: "About Our Company",
          slug: "about-us",
          type: "page",
          content: "We are a forward-thinking technology team focused on delivering beautiful software solutions. Our mission is to make developer tools accessible and delightful for everyone. We believe in crafting premium user experiences that combine utility with speed.",
          status: "Published",
          author: janeId,
          featuredImage: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600",
          seo: {
            metaTitle: "About Us | TechCorp Solutions",
            metaDescription: "Learn more about TechCorp's mission, values, and the team building the future of developer tools."
          }
        },
        {
          title: "Developer Documentation",
          slug: "docs",
          type: "page",
          content: "Welcome to our documentation. Here you will find quick start guides, API references, and detailed tutorials. To integrate our REST SDK, install the package and configure your workspace client keys.",
          status: "Draft",
          author: janeId,
          featuredImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600",
          seo: {
            metaTitle: "Developer SDK Reference & Guides",
            metaDescription: "Comprehensive API references and integration workflows for the TechCorp REST SDK."
          }
        },
        {
          title: "Summer Product Launch",
          slug: "summer-launch",
          type: "page",
          content: "We are thrilled to announce our Summer 2026 feature list, including real-time sync, visual analytics dashboards, and custom webhook configurations.",
          status: "Scheduled",
          author: janeId,
          featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
          seo: {
            metaTitle: "Summer 2026 Launch Event",
            metaDescription: "Register for the summer launch and be the first to try real-time visual syncing."
          }
        }
      ]);
      console.log("Starter content pages seeded successfully.");
    }

    // 3. Seed starter media library files if the media collection is empty
    const mediaCount = await Media.countDocuments();
    if (mediaCount === 0) {
      console.log("Media library is empty. Seeding starter assets...");
      await Media.create([
        {
          originalName: "analytics-chart.jpg",
          generatedName: "file-seed-analytics.jpg",
          url: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600",
          fileType: "image/jpeg",
          fileSize: "412 KB",
          uploadedBy: janeId
        },
        {
          originalName: "hero-coding.jpg",
          generatedName: "file-seed-coding.jpg",
          url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600",
          fileType: "image/jpeg",
          fileSize: "625 KB",
          uploadedBy: janeId
        },
        {
          originalName: "financial-report.jpg",
          generatedName: "file-seed-report.jpg",
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
          fileType: "image/jpeg",
          fileSize: "248 KB",
          uploadedBy: janeId
        }
      ]);
      console.log("Starter media assets seeded successfully.");
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
